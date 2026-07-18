"""Salvage PowerShell-corrupted dump: fix quotes + import by INSERT boundaries."""
from __future__ import annotations

import re
import sys
time = __import__("time")
from pathlib import Path

import pymysql

SRC = Path(sys.argv[1])
HOST, PORT = sys.argv[2], int(sys.argv[3])
USER, PASSWORD, DATABASE = sys.argv[4], sys.argv[5], sys.argv[6]

REFILL = {
    "t_entry_info", "t_translate", "t_task_info", "t_product", "t_product_relation",
    "t_product_table", "t_entry_operate", "t_entry_label", "t_entry_property",
    "t_entry_recover", "t_entry_info_restore", "t_response", "t_second_classify",
    "t_thesaurus", "t_i8n_address", "t_version", "t_version_table",
    "t_version_202310", "t_version_202311", "t_version_202312", "t_version_202401",
    "t_user_partiality", "t_user_product",
    "term_word", "term_word_conflict", "term_agent_audit",
    "t_entry_classify", "t_authority", "t_menu", "t_role", "t_role_menu",
    "t_role_authority", "t_user", "t_user_role", "t_language",
}

COMMENT_PAT = re.compile(rb" COMMENT='[^';\r\n]*")
EURO_BAD = bytes.fromhex("e282ac3f2c27")  # €?,'
EURO_FIX = b"','"
# Also fix other common lost-quote: ?,' after non-ascii high bytes already handled;
# pattern ASCII ?,' that follows bytes >= 0x80 handled via euro; add generic: \x3f,' after utf8 trail
BATCH = 25


def transform(chunk: bytes) -> bytes:
    return COMMENT_PAT.sub(b"", chunk).replace(EURO_BAD, EURO_FIX)


def connect():
    return pymysql.connect(
        host=HOST, port=PORT, user=USER, password=PASSWORD, database=DATABASE,
        charset="utf8mb4", autocommit=False, ssl_disabled=True,
        connect_timeout=60, read_timeout=600, write_timeout=600,
    )


def split_rows(body: str) -> list[str]:
    rows = []
    i, n = 0, len(body)
    while i < n:
        while i < n and body[i] in " \t\r\n,":
            i += 1
        if i >= n or body[i] != "(":
            break
        start = i
        depth = 0
        in_s = False
        while i < n:
            c = body[i]
            if in_s:
                if c == "\\" and i + 1 < n:
                    i += 2
                    continue
                if c == "'" and i + 1 < n and body[i + 1] == "'":
                    i += 2
                    continue
                if c == "'":
                    in_s = False
                i += 1
                continue
            if c == "'":
                in_s = True
                i += 1
                continue
            if c == "(":
                depth += 1
            elif c == ")":
                depth -= 1
                if depth == 0:
                    i += 1
                    rows.append(body[start:i])
                    break
            i += 1
    return rows


def import_insert(conn, cur, stmt: bytes, stats: dict):
    stmt = stmt.strip()
    if not stmt.upper().startswith(b"INSERT"):
        return
    m = re.match(rb"\s*INSERT INTO `([^`]+)`", stmt)
    if not m:
        return
    table = m.group(1).decode()
    if table not in REFILL:
        stats["skip"] += 1
        return
    sql = stmt.decode("utf-8", errors="replace")
    u = sql.upper()
    idx = u.find("VALUES")
    if idx < 0:
        stats["fail"] += 1
        return
    head = sql[:idx] + "VALUES "
    body = sql[idx + 6:].strip().rstrip(";").strip()
    # trim trailing garbage after last )
    if ")" in body:
        body = body[: body.rfind(")") + 1]
    rows = split_rows(body)
    if not rows:
        stats["fail"] += 1
        print(f"FAIL {table}: no rows parsed (stmt~{len(stmt)}B)", flush=True)
        return

    ok = bad = 0
    for i in range(0, len(rows), BATCH):
        batch = rows[i : i + BATCH]
        try:
            cur.execute(head + ",".join(batch))
            conn.commit()
            ok += len(batch)
        except Exception:
            conn.rollback()
            for row in batch:
                try:
                    cur.execute(head + row)
                    conn.commit()
                    ok += 1
                except Exception:
                    conn.rollback()
                    bad += 1
    stats["ok"] += 1
    stats["rows"] += ok
    stats["bad_rows"] += bad
    print(f"OK {table}: rows={ok} bad={bad}", flush=True)


def extract_statements(data: bytes):
    """Yield INSERT statements split by next INSERT/UNLOCK/CREATE markers."""
    starts = [m.start() for m in re.finditer(rb"INSERT INTO `", data)]
    for i, st in enumerate(starts):
        end = starts[i + 1] if i + 1 < len(starts) else len(data)
        chunk = data[st:end]
        # cut at UNLOCK / CREATE / Dumping if present
        for marker in (b"\nUNLOCK TABLES", b"\nCREATE TABLE", b"\n--\n-- Table structure", b"\nDROP TABLE"):
            k = chunk.find(marker)
            if k > 0:
                chunk = chunk[:k]
        # ensure ends near );
        k = chunk.rfind(b");")
        if k < 0:
            continue
        yield chunk[: k + 2] + b";"


def main():
    # Phase 1: write transformed stream to temp file (bounded memory)
    fixed_path = Path(sys.argv[7]) if len(sys.argv) > 7 else SRC.with_name(SRC.stem + "_quote_fixed.sql")
    print(f"Phase1 transform -> {fixed_path}", flush=True)
    t0 = time.time()
    with SRC.open("rb") as fin, fixed_path.open("wb") as fout:
        buf = b""
        n = 0
        while True:
            chunk = fin.read(8 * 1024 * 1024)
            if not chunk:
                break
            data = transform(buf + chunk)
            keep = 64
            body, buf = (data[:-keep], data[-keep:]) if len(data) > keep else (data, b"")
            fout.write(body)
            n += len(chunk)
            if n % (64 * 1024 * 1024) < 8 * 1024 * 1024:
                print(f"  wrote progress {n/1e6:.0f}MB", flush=True)
        if buf:
            fout.write(transform(buf))
    print(f"Phase1 done {time.time()-t0:.0f}s size={fixed_path.stat().st_size/1e6:.0f}MB", flush=True)

    conn = connect()
    cur = conn.cursor()
    cur.execute("SET NAMES utf8mb4")
    cur.execute("SET FOREIGN_KEY_CHECKS=0")
    cur.execute("SET UNIQUE_CHECKS=0")
    cur.execute("SHOW TABLES")
    existing = {r[0] for r in cur.fetchall()}
    for t in sorted(REFILL & existing):
        try:
            cur.execute(f"TRUNCATE TABLE `{t}`")
            print("TRUNCATE", t, flush=True)
        except Exception as e:
            print("TRUNCATE skip", t, e, flush=True)
    conn.commit()

    stats = {"ok": 0, "fail": 0, "rows": 0, "skip": 0, "bad_rows": 0}
    print("Phase2 import by INSERT boundaries", flush=True)
    # Read fixed file in large chunks but split by INSERT markers using index scan
    # For huge file: memory-map or scan offsets
    data = fixed_path.read_bytes()
    print(f"  loaded {len(data)/1e6:.0f}MB into memory", flush=True)
    count_ins = 0
    for stmt in extract_statements(data):
        count_ins += 1
        try:
            import_insert(conn, cur, stmt, stats)
        except pymysql.err.OperationalError as e:
            print("RECONNECT", e, flush=True)
            try:
                conn.close()
            except Exception:
                pass
            conn = connect()
            cur = conn.cursor()
            cur.execute("SET NAMES utf8mb4")
            cur.execute("SET FOREIGN_KEY_CHECKS=0")
            import_insert(conn, cur, stmt, stats)
    print(f"processed INSERT stmts found={count_ins}", flush=True)

    # restore admin
    try:
        cur.execute(
            "INSERT INTO t_user (id, user_name, job_number, department) "
            "SELECT 'd37d01e4-2df1-4681-b7bf-8a5f97f06495', 'admin', NULL, '通用平台部' FROM DUAL "
            "WHERE NOT EXISTS (SELECT 1 FROM t_user WHERE user_name='admin')"
        )
        conn.commit()
    except Exception as e:
        print("admin ensure skip", e, flush=True)

    cur.execute("SET FOREIGN_KEY_CHECKS=1")
    conn.commit()
    print("=== DONE ===", stats, f"elapsed={time.time()-t0:.0f}s", flush=True)
    for t in ["t_entry_info", "t_translate", "t_task_info", "t_product", "term_word",
              "t_user", "t_entry_classify", "term_agent_audit", "t_menu", "t_authority"]:
        if t in existing:
            cur.execute(f"SELECT COUNT(*) FROM `{t}`")
            print(f"COUNT {t}={cur.fetchone()[0]}", flush=True)
    cur.close()
    conn.close()
    print(f"Fixed dump kept at: {fixed_path}", flush=True)


if __name__ == "__main__":
    main()
