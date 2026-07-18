# Stream-salvage PowerShell-corrupted mysqldump into live DB via pymysql.
# Fixes: 1) strip broken table COMMENT='...'  2) restore lost quotes: €?,' -> ','
# Executes INSERT statements only (schema assumed present). FK checks off.
param(
    [Parameter(Mandatory = $true)][string]$BackupPath,
    [string]$HostName = "127.0.0.1",
    [int]$Port = 3306,
    [string]$DbUser = "root",
    [string]$DbPassword = "123456",
    [string]$Database = "translationtool",
    [switch]$Force
)

$ErrorActionPreference = "Stop"
if (-not $Force) { throw "Specify -Force to run destructive truncate+import" }
if (-not (Test-Path $BackupPath)) { throw "Not found: $BackupPath" }

$py = @'
import re, sys, time
from pathlib import Path
import pymysql

src = Path(sys.argv[1])
host, port, user, password, database = sys.argv[2], int(sys.argv[3]), sys.argv[4], sys.argv[5], sys.argv[6]

# Tables we refill from dump (truncate first). Skip pure schema-only leftovers.
REFILL = {
    "t_entry_info", "t_translate", "t_task_info", "t_product", "t_product_relation",
    "t_product_table", "t_entry_operate", "t_entry_label", "t_entry_property",
    "t_entry_recover", "t_entry_info_restore", "t_response", "t_second_classify",
    "t_thesaurus", "t_i8n_address", "t_version", "t_version_table",
    "t_version_202310", "t_version_202311", "t_version_202312", "t_version_202401",
    "t_user_partiality", "t_user_product",
    "term_word", "term_word_conflict", "term_agent_audit",
    # replace seed with dump copies for consistency
    "t_entry_classify", "t_authority", "t_menu", "t_role", "t_role_menu",
    "t_role_authority", "t_user", "t_user_role", "t_language",
}

COMMENT_PAT = re.compile(rb" COMMENT='[^';\r\n]*")
QUOTE_FIX = (bytes.fromhex("e282ac3f2c27"), b"','")  # €?,' -> ','

def transform(chunk: bytes) -> bytes:
    chunk = COMMENT_PAT.sub(b"", chunk)
    chunk = chunk.replace(QUOTE_FIX[0], QUOTE_FIX[1])
    return chunk

conn = pymysql.connect(host=host, port=port, user=user, password=password,
                       database=database, charset="utf8mb4", autocommit=False,
                       max_allowed_packet=256*1024*1024)
cur = conn.cursor()
cur.execute("SET NAMES utf8mb4")
cur.execute("SET FOREIGN_KEY_CHECKS=0")
cur.execute("SET UNIQUE_CHECKS=0")
cur.execute("SET sql_mode='NO_ENGINE_SUBSTITUTION'")

# Truncate refill tables that exist
cur.execute("SHOW TABLES")
existing = {r[0] for r in cur.fetchall()}
for t in sorted(REFILL & existing):
    try:
        cur.execute(f"TRUNCATE TABLE `{t}`")
        print(f"TRUNCATE {t}", flush=True)
    except Exception as e:
        print(f"TRUNCATE skip {t}: {e}", flush=True)
conn.commit()

stats = {"ok": 0, "fail": 0, "rows": 0, "skip": 0}
buf = b""
in_insert = False
stmt_buf = b""
current_table = None
read_total = 0
t0 = time.time()

def table_of(stmt: bytes):
    m = re.match(rb"INSERT INTO `([^`]+)`", stmt.lstrip())
    return m.group(1).decode() if m else None

def exec_insert(stmt: bytes):
    global stats
    stmt = stmt.strip()
    if not stmt:
        return
    if not stmt.upper().startswith(b"INSERT"):
        return
    table = table_of(stmt)
    if table not in REFILL:
        stats["skip"] += 1
        return
    if not stmt.endswith(b";"):
        stmt += b";"
    sql = stmt.decode("utf-8", errors="replace")
    try:
        n = cur.execute(sql)
        conn.commit()
        stats["ok"] += 1
        stats["rows"] += (n or 0)
        if stats["ok"] % 20 == 0:
            print(f"... ok={stats['ok']} fail={stats['fail']} rows~={stats['rows']} table={table}", flush=True)
    except Exception as e:
        conn.rollback()
        # fallback: split rows
        try:
            recovered = split_and_insert(sql, table)
            if recovered:
                stats["ok"] += 1
                stats["rows"] += recovered
                print(f"SPLIT-OK {table} recovered_rows={recovered}", flush=True)
            else:
                stats["fail"] += 1
                print(f"FAIL {table}: {str(e)[:180]}".encode("ascii", "backslashreplace").decode(), flush=True)
        except Exception as e2:
            stats["fail"] += 1
            print(f"FAIL {table}: {str(e)[:120]} | split: {str(e2)[:80]}".encode("ascii","backslashreplace").decode(), flush=True)

def split_and_insert(sql: str, table: str) -> int:
    """Split extended INSERT into per-row inserts; skip bad rows."""
    u = sql.upper()
    idx = u.find("VALUES")
    if idx < 0:
        return 0
    head = sql[:idx] + "VALUES "
    body = sql[idx + 6:].strip()
    if body.endswith(";"):
        body = body[:-1].strip()
    # body starts with (
    rows = []
    i = 0
    n = len(body)
    while i < n:
        while i < n and body[i] in " \t\r\n,":
            i += 1
        if i >= n:
            break
        if body[i] != "(":
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
            else:
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
    recovered = 0
    for row in rows:
        try:
            cur.execute(head + row)
            conn.commit()
            recovered += 1
        except Exception:
            conn.rollback()
    return recovered

# Stream file
with src.open("rb") as f:
    while True:
        chunk = f.read(4 * 1024 * 1024)
        if not chunk:
            break
        read_total += len(chunk)
        data = transform(buf + chunk)
        # keep overlap for patterns
        if len(data) > 200:
            body, buf = data[:-150], data[-150:]
        else:
            body, buf = data, b""

        i = 0
        while i < len(body):
            if not in_insert:
                j = body.find(b"INSERT INTO `", i)
                if j < 0:
                    break
                in_insert = True
                stmt_buf = body[j:]
                i = len(body)
            else:
                stmt_buf += body[i:]
                i = len(body)

            if in_insert:
                # find end ); followed by newline or end markers
                # scan for ); outside strings from end of known
                end = find_stmt_end(stmt_buf)
                if end is not None:
                    stmt = stmt_buf[:end + 1]  # include ;
                    # actually find_stmt_end returns index of ;
                    exec_insert(stmt)
                    rest = stmt_buf[end + 1:]
                    in_insert = False
                    stmt_buf = b""
                    # continue scanning rest in same body cycle
                    body = rest
                    i = 0
                    buf = b""  # rest fully in body
                    if read_total and read_total % (64 * 1024 * 1024) < 4 * 1024 * 1024:
                        print(f"read {read_total/1e6:.0f}MB elapsed {time.time()-t0:.0f}s stats={stats}", flush=True)

# flush
if buf:
    if in_insert:
        stmt_buf += transform(buf)
    else:
        # might start insert in buf
        tbuf = transform(buf)
        j = tbuf.find(b"INSERT INTO `")
        if j >= 0:
            stmt_buf = tbuf[j:]
            in_insert = True

if in_insert and stmt_buf.strip():
    # force end
    s = stmt_buf.strip()
    if not s.endswith(b";"):
        # try find last );
        k = s.rfind(b");")
        if k >= 0:
            s = s[:k + 2]
    exec_insert(s if s.endswith(b";") else s + b";")

def find_stmt_end(stmt: bytes):
    # Find '); that terminates INSERT — first ); at depth 0 after VALUES, then optional whitespace and we treat ); as end (semicolon may be missing until next)
    # mysqldump ends with );
    in_s = False
    i = 0
    # skip to VALUES
    vu = stmt.upper().find(b"VALUES")
    if vu < 0:
        return None
    i = vu + 6
    depth = 0
    seen_values = False
    while i < len(stmt):
        c = stmt[i:i+1]
        if in_s:
            if c == b"\\" and i + 1 < len(stmt):
                i += 2
                continue
            if c == b"'" and i + 1 < len(stmt) and stmt[i+1:i+2] == b"'":
                i += 2
                continue
            if c == b"'":
                in_s = False
            i += 1
            continue
        if c == b"'":
            in_s = True
            i += 1
            continue
        if c == b"(":
            depth += 1
            seen_values = True
            i += 1
            continue
        if c == b")":
            depth -= 1
            i += 1
            if seen_values and depth == 0:
                # expect ;
                while i < len(stmt) and stmt[i:i+1] in b" \t\r\n":
                    i += 1
                if i < len(stmt) and stmt[i:i+1] == b";":
                    return i
                # no semicolon yet — incomplete
                return None
            continue
        i += 1
    return None

# NOTE: find_stmt_end used before definition in loop — Python needs function defined first.
# Rewrite file properly below.
'@

# The script above has a bug (find_stmt_end used before def). Write clean version.
$pyPath = Join-Path $env:TEMP "salvage_full_import.py"
@'
import re, sys, time
from pathlib import Path
import pymysql

src = Path(sys.argv[1])
host, port, user, password, database = sys.argv[2], int(sys.argv[3]), sys.argv[4], sys.argv[5], sys.argv[6]

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

def transform(chunk: bytes) -> bytes:
    return COMMENT_PAT.sub(b"", chunk).replace(EURO_BAD, EURO_FIX)

def find_stmt_end(stmt: bytes):
    vu = stmt.upper().find(b"VALUES")
    if vu < 0:
        return None
    i = vu + 6
    depth = 0
    in_s = False
    seen = False
    while i < len(stmt):
        c = stmt[i]
        if in_s:
            if c == 0x5C and i + 1 < len(stmt):  # backslash
                i += 2
                continue
            if c == 0x27 and i + 1 < len(stmt) and stmt[i + 1] == 0x27:
                i += 2
                continue
            if c == 0x27:
                in_s = False
            i += 1
            continue
        if c == 0x27:
            in_s = True
            i += 1
            continue
        if c == 0x28:  # (
            depth += 1
            seen = True
            i += 1
            continue
        if c == 0x29:  # )
            depth -= 1
            i += 1
            if seen and depth == 0:
                while i < len(stmt) and stmt[i] in (0x20, 0x09, 0x0D, 0x0A):
                    i += 1
                if i < len(stmt) and stmt[i] == 0x3B:  # ;
                    return i
                return None
            continue
        i += 1
    return None

def table_of(stmt: bytes):
    m = re.match(rb"\s*INSERT INTO `([^`]+)`", stmt)
    return m.group(1).decode() if m else None

def split_and_insert(cur, conn, sql: str) -> int:
    u = sql.upper()
    idx = u.find("VALUES")
    if idx < 0:
        return 0
    head = sql[:idx] + "VALUES "
    body = sql[idx + 6:].strip().rstrip(";").strip()
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
    recovered = 0
    for row in rows:
        try:
            cur.execute(head + row)
            conn.commit()
            recovered += 1
        except Exception:
            conn.rollback()
    return recovered

conn = pymysql.connect(host=host, port=port, user=user, password=password,
                       database=database, charset="utf8mb4", autocommit=False,
                       max_allowed_packet=512*1024*1024)
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

stats = {"ok": 0, "fail": 0, "rows": 0, "skip": 0}
buf = b""
stmt_buf = b""
in_insert = False
read_total = 0
t0 = time.time()

def exec_insert(stmt: bytes):
    stmt = stmt.strip()
    if not stmt.upper().startswith(b"INSERT"):
        return
    table = table_of(stmt)
    if table not in REFILL:
        stats["skip"] += 1
        return
    if not stmt.endswith(b";"):
        stmt += b";"
    sql = stmt.decode("utf-8", errors="replace")
    try:
        n = cur.execute(sql)
        conn.commit()
        stats["ok"] += 1
        stats["rows"] += n or 0
        if stats["ok"] % 10 == 0:
            print(f"... ok={stats['ok']} fail={stats['fail']} rows={stats['rows']} last={table}", flush=True)
    except Exception as e:
        conn.rollback()
        recovered = split_and_insert(cur, conn, sql)
        if recovered:
            stats["ok"] += 1
            stats["rows"] += recovered
            print(f"SPLIT-OK {table} rows={recovered}", flush=True)
        else:
            stats["fail"] += 1
            msg = str(e)[:160].encode("ascii", "backslashreplace").decode()
            print(f"FAIL {table}: {msg}", flush=True)

with src.open("rb") as f:
    while True:
        chunk = f.read(8 * 1024 * 1024)
        if not chunk:
            break
        read_total += len(chunk)
        data = transform(buf + chunk)
        keep = 200
        if len(data) > keep:
            body, buf = data[:-keep], data[-keep:]
        else:
            body, buf = data, b""

        if not in_insert:
            stmt_buf = b""

        pos = 0
        while pos < len(body):
            if not in_insert:
                j = body.find(b"INSERT INTO `", pos)
                if j < 0:
                    break
                in_insert = True
                stmt_buf = body[j:]
                pos = len(body)
            else:
                stmt_buf += body[pos:]
                pos = len(body)

            while in_insert:
                end = find_stmt_end(stmt_buf)
                if end is None:
                    break
                exec_insert(stmt_buf[: end + 1])
                stmt_buf = stmt_buf[end + 1 :]
                in_insert = False
                # more inserts in remainder?
                j = stmt_buf.find(b"INSERT INTO `")
                if j >= 0:
                    stmt_buf = stmt_buf[j:]
                    in_insert = True
                else:
                    # put unused remainder back for next chunk via buf
                    buf = stmt_buf + buf
                    stmt_buf = b""
                    break

        if read_total % (32 * 1024 * 1024) < 8 * 1024 * 1024:
            print(f"read {read_total/1e6:.0f}MB {time.time()-t0:.0f}s {stats}", flush=True)

# final flush
if buf and not in_insert:
    j = buf.find(b"INSERT INTO `")
    if j >= 0:
        in_insert = True
        stmt_buf = transform(buf[j:])
elif in_insert:
    stmt_buf += transform(buf)

if in_insert and stmt_buf.strip():
    end = find_stmt_end(stmt_buf)
    if end is not None:
        exec_insert(stmt_buf[: end + 1])
    else:
        s = stmt_buf.strip()
        k = s.rfind(b");")
        if k >= 0:
            exec_insert(s[: k + 2] + b";")

cur.execute("SET FOREIGN_KEY_CHECKS=1")
cur.execute("SET UNIQUE_CHECKS=1")
conn.commit()

# summary counts
print("=== DONE ===", stats, f"elapsed={time.time()-t0:.0f}s", flush=True)
for t in ["t_entry_info", "t_translate", "t_task_info", "t_product", "term_word", "t_user", "t_entry_classify"]:
    if t in existing:
        cur.execute(f"SELECT COUNT(*) FROM `{t}`")
        print(f"COUNT {t}={cur.fetchone()[0]}", flush=True)

cur.close()
conn.close()
'@ | Set-Content -Path $pyPath -Encoding utf8

Write-Host "Starting full salvage import (may take several minutes)..."
python $pyPath $BackupPath $HostName $Port $DbUser $DbPassword $Database
if ($LASTEXITCODE -ne 0) { throw "salvage failed exit $LASTEXITCODE" }
