"""Keep-classify closure helpers for translationtool MySQL."""
from __future__ import annotations

import json
import subprocess
import sys
from typing import Any


DEFAULT_DEPARTMENT = "通用平台部"


def normalize_department(department: str) -> str:
    if not department or department in ("-", "DEFAULT", "default"):
        return DEFAULT_DEPARTMENT
    return department


def mysql_exec(
    container: str,
    user: str,
    password: str,
    database: str,
    sql: str,
) -> str:
    args = [
        "docker",
        "exec",
        "-i",
        container,
        "mysql",
        f"-u{user}",
        f"-p{password}",
        "--default-character-set=utf8mb4",
        "-N",
        "-B",
    ]
    if database:
        args.append(database)
    proc = subprocess.run(args, input=sql.encode("utf-8"), capture_output=True)
    if proc.returncode != 0:
        err = (proc.stderr or b"").decode("utf-8", "replace")
        raise SystemExit(f"mysql failed ({proc.returncode}): {err}\nSQL head:\n{sql[:1200]}")
    return (proc.stdout or b"").decode("utf-8", "replace")


def q_list(values: list[str]) -> str:
    return ",".join("'" + v.replace("\\", "\\\\").replace("'", "''") + "'" for v in values)


def table_set(container: str, user: str, password: str, database: str) -> set[str]:
    raw = mysql_exec(
        container,
        user,
        password,
        database,
        "SELECT table_name FROM information_schema.tables WHERE table_schema = DATABASE();",
    )
    return {ln.strip() for ln in raw.splitlines() if ln.strip()}


def resolve_roots(
    container: str,
    user: str,
    password: str,
    database: str,
    department: str,
    classify_names: list[str],
) -> list[dict[str, Any]]:
    names_sql = q_list(classify_names)
    dept = department.replace("'", "''")
    sql = f"""
SELECT id, name, department, parent_id, type, IFNULL(is_delete,0)
FROM t_entry_classify
WHERE name IN ({names_sql})
  AND department = '{dept}'
ORDER BY name, is_delete ASC, create_time ASC;
"""
    raw = mysql_exec(container, user, password, database, sql)
    by_name: dict[str, list[dict[str, Any]]] = {n: [] for n in classify_names}
    for line in raw.splitlines():
        if not line.strip():
            continue
        parts = line.split("\t")
        if len(parts) < 6:
            continue
        row = {
            "id": parts[0],
            "name": parts[1],
            "department": parts[2],
            "parent_id": None if parts[3] in ("NULL", "") else parts[3],
            "type": None if parts[4] in ("NULL", "") else parts[4],
            "is_delete": int(parts[5]),
        }
        by_name.setdefault(row["name"], []).append(row)

    chosen: list[dict[str, Any]] = []
    missing: list[str] = []
    for name in classify_names:
        cands = by_name.get(name) or []
        alive = [c for c in cands if c["is_delete"] == 0] or cands
        if not alive:
            missing.append(name)
            continue
        pick = alive[0]
        if len(alive) > 1:
            pick = dict(pick)
            pick["ambiguousAlternates"] = [
                {"id": c["id"], "is_delete": c["is_delete"]} for c in alive[1:]
            ]
        chosen.append(pick)
    if missing:
        raise SystemExit(
            "Classify name match FAILED (abort, no partial restore): missing="
            + json.dumps(missing, ensure_ascii=False)
            + f" department={department}"
        )
    return chosen


def build_keep_sql(
    root_ids: list[str],
    department: str,
    present: set[str],
    audit_entry_col: str | None,
    term_word_entry_col: str | None,
) -> str:
    """Build prune SQL using *real* helper tables (MySQL forbids reopening TEMP tables)."""
    roots = q_list(root_ids)
    dept = department.replace("'", "''")
    # Permanent helpers in temp DB — avoid TEMPORARY reopen errors
    parts: list[str] = [
        "SET NAMES utf8mb4;",
        "SET FOREIGN_KEY_CHECKS=0;",
        "SET UNIQUE_CHECKS=0;",
        "DROP TABLE IF EXISTS _keep_classify;",
        "DROP TABLE IF EXISTS _keep_product;",
        "DROP TABLE IF EXISTS _keep_entry;",
        "DROP TABLE IF EXISTS _keep_translate;",
        "DROP TABLE IF EXISTS _keep_task;",
        "CREATE TABLE _keep_classify (id VARCHAR(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin PRIMARY KEY) ENGINE=InnoDB;",
        "CREATE TABLE _keep_product (id VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin PRIMARY KEY) ENGINE=InnoDB;",
        "CREATE TABLE _keep_entry (id VARCHAR(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin PRIMARY KEY) ENGINE=InnoDB;",
        "CREATE TABLE _keep_translate (id VARCHAR(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin PRIMARY KEY) ENGINE=InnoDB;",
        "CREATE TABLE _keep_task (id VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin PRIMARY KEY) ENGINE=InnoDB;",
        f"""
INSERT IGNORE INTO _keep_classify (id)
WITH RECURSIVE subtree AS (
  SELECT id, parent_id FROM t_entry_classify WHERE id IN ({roots})
  UNION ALL
  SELECT c.id, c.parent_id
  FROM t_entry_classify c
  INNER JOIN subtree s ON c.parent_id = s.id
)
SELECT id FROM subtree;
""",
        f"""
INSERT IGNORE INTO _keep_classify (id)
WITH RECURSIVE ancestors AS (
  SELECT id, parent_id FROM t_entry_classify WHERE id IN ({roots})
  UNION ALL
  SELECT c.id, c.parent_id
  FROM t_entry_classify c
  INNER JOIN ancestors a ON a.parent_id = c.id
  WHERE a.parent_id IS NOT NULL AND a.parent_id <> ''
)
SELECT id FROM ancestors;
""",
        """
INSERT IGNORE INTO _keep_product (id)
SELECT id FROM t_entry_classify
WHERE id IN (SELECT id FROM _keep_classify) AND type = 'product';
""",
        """
INSERT IGNORE INTO _keep_product (id)
SELECT DISTINCT product_id FROM t_entry_info
WHERE product_id IS NOT NULL AND product_id <> ''
  AND classify_id IN (SELECT id FROM _keep_classify);
""",
    ]
    if "t_product_relation" in present:
        parts.append(
            """
INSERT IGNORE INTO _keep_product (id)
SELECT DISTINCT product_id FROM t_product_relation
WHERE product_id IS NOT NULL AND product_id <> ''
  AND entry_id IN (
    SELECT id FROM t_entry_info WHERE classify_id IN (SELECT id FROM _keep_classify)
  );
"""
        )
    if "t_product" in present:
        # Do not INSERT…SELECT into _keep_product while reading _keep_product in same stmt.
        parts.append(
            f"""
INSERT IGNORE INTO _keep_product (id)
SELECT p.id FROM t_product p
INNER JOIN (
  SELECT DISTINCT product_id AS pid FROM t_entry_info
  WHERE classify_id IN (SELECT id FROM _keep_classify)
    AND product_id IS NOT NULL AND product_id <> ''
) x ON x.pid = p.id
WHERE p.department = '{dept}' OR p.department IS NULL OR p.department = '';
"""
        )
    parts.append(
        """
INSERT IGNORE INTO _keep_entry (id)
SELECT DISTINCT id FROM t_entry_info
WHERE classify_id IN (SELECT id FROM _keep_classify)
   OR (product_id IS NOT NULL AND product_id <> '' AND product_id IN (SELECT id FROM _keep_product));
"""
    )
    if "t_product_relation" in present:
        parts.append(
            """
INSERT IGNORE INTO _keep_entry (id)
SELECT DISTINCT entry_id FROM t_product_relation
WHERE product_id IN (SELECT id FROM _keep_product);
"""
        )
    parts.append(
        """
INSERT IGNORE INTO _keep_task (id)
SELECT DISTINCT task_id FROM t_entry_info
WHERE id IN (SELECT id FROM _keep_entry)
  AND task_id IS NOT NULL AND task_id <> '';
"""
    )
    if "t_product_relation" in present:
        parts.append(
            """
INSERT IGNORE INTO _keep_task (id)
SELECT DISTINCT task_id FROM t_product_relation
WHERE (entry_id IN (SELECT id FROM _keep_entry) OR product_id IN (SELECT id FROM _keep_product))
  AND task_id IS NOT NULL AND task_id <> '';
"""
        )
    if "t_task_info" in present:
        parts.append(
            """
INSERT IGNORE INTO _keep_task (id)
SELECT id FROM t_task_info
WHERE product_id IN (SELECT id FROM _keep_product)
   OR id IN (SELECT id FROM _keep_task);
"""
        )
    for col in ("en_trans_id", "ru_trans_id", "fra_trans_id", "spa_trans_id", "zh_trans_id"):
        parts.append(
            f"""
INSERT IGNORE INTO _keep_translate (id)
SELECT {col} FROM t_entry_info
WHERE id IN (SELECT id FROM _keep_entry)
  AND {col} IS NOT NULL AND {col} <> '';
"""
        )
    parts.append(
        f"""
INSERT IGNORE INTO _keep_translate (id)
SELECT t.id FROM t_translate t
INNER JOIN t_entry_info e ON e.entry = t.entry AND e.id IN (SELECT id FROM _keep_entry)
WHERE t.visual_range = '{dept}'
  AND IFNULL(t.delete_state,0) = 0;
"""
    )

    # Deletes via LEFT JOIN (avoid NOT IN + helper reopen quirks)
    if "t_product_relation" in present:
        parts.append(
            """
DELETE r FROM t_product_relation r
LEFT JOIN _keep_entry k ON k.id = r.entry_id
WHERE k.id IS NULL;
"""
        )
    if "t_entry_operate" in present:
        parts.append(
            """
DELETE o FROM t_entry_operate o
LEFT JOIN _keep_entry k ON k.id = o.entry_id
WHERE o.entry_id IS NOT NULL AND o.entry_id <> '' AND k.id IS NULL;
"""
        )
    if "t_entry_product" in present:
        parts.append(
            """
DELETE ep FROM t_entry_product ep
LEFT JOIN _keep_classify k ON k.id = ep.classify_id
WHERE k.id IS NULL;
"""
        )
    if "t_entry_project" in present:
        parts.append(
            """
DELETE ep FROM t_entry_project ep
LEFT JOIN _keep_classify k ON k.id = ep.classify_id
WHERE k.id IS NULL;
"""
        )
    for tbl in (
        "t_entry_info",
        "t_entry_info_restore",
        "t_entry_temp",
        "t_entry_version",
    ):
        if tbl in present:
            parts.append(
                f"""
DELETE e FROM `{tbl}` e
LEFT JOIN _keep_entry k ON k.id = e.id
WHERE k.id IS NULL;
"""
            )
    if "t_translate" in present:
        parts.append(
            """
DELETE t FROM t_translate t
LEFT JOIN _keep_translate k ON k.id = t.id
WHERE k.id IS NULL;
"""
        )
    parts.append(
        """
DELETE c FROM t_entry_classify c
LEFT JOIN _keep_classify k ON k.id = c.id
WHERE k.id IS NULL;
"""
    )
    if "t_product" in present:
        parts.append(
            """
DELETE p FROM t_product p
LEFT JOIN _keep_product k ON k.id = p.id
WHERE k.id IS NULL;
"""
        )
    if "t_product_table" in present:
        parts.append(
            """
DELETE pt FROM t_product_table pt
LEFT JOIN _keep_product k ON k.id = pt.product_id
WHERE k.id IS NULL;
"""
        )
    if "t_task_info" in present:
        parts.append(
            """
DELETE t FROM t_task_info t
LEFT JOIN _keep_task k ON k.id = t.id
WHERE k.id IS NULL;
"""
        )
    if "t_user_product" in present:
        parts.append(
            """
DELETE up FROM t_user_product up
LEFT JOIN _keep_product k ON k.id = up.product_id
WHERE up.product_id IS NOT NULL AND up.product_id <> '' AND k.id IS NULL;
"""
        )
    if "t_second_classify" in present:
        parts.append(
            """
DELETE s FROM t_second_classify s
LEFT JOIN _keep_classify k ON k.id = s.parent_id
WHERE s.parent_id IS NOT NULL AND s.parent_id <> '' AND k.id IS NULL;
"""
        )
    if "term_agent_audit" in present and audit_entry_col:
        parts.append(
            f"""
DELETE a FROM term_agent_audit a
LEFT JOIN _keep_entry k ON k.id = a.`{audit_entry_col}`
WHERE a.`{audit_entry_col}` IS NOT NULL AND a.`{audit_entry_col}` <> '' AND k.id IS NULL;
"""
        )
    if "term_word" in present and term_word_entry_col:
        parts.append(
            f"""
DELETE w FROM term_word w
LEFT JOIN _keep_entry k ON k.id = w.`{term_word_entry_col}`
WHERE w.`{term_word_entry_col}` IS NOT NULL AND w.`{term_word_entry_col}` <> '' AND k.id IS NULL;
"""
        )
    elif "term_word" in present:
        parts.append(
            """
DELETE w FROM term_word w
LEFT JOIN (
  SELECT DISTINCT entry AS e FROM t_entry_info WHERE id IN (SELECT id FROM _keep_entry)
) ke ON ke.e = w.word
WHERE ke.e IS NULL;
"""
        )

    parts.extend(
        [
            "DROP TABLE IF EXISTS _keep_classify;",
            "DROP TABLE IF EXISTS _keep_product;",
            "DROP TABLE IF EXISTS _keep_entry;",
            "DROP TABLE IF EXISTS _keep_translate;",
            "DROP TABLE IF EXISTS _keep_task;",
            "SET FOREIGN_KEY_CHECKS=1;",
            "SET UNIQUE_CHECKS=1;",
        ]
    )
    return "\n".join(parts)


def count_table(
    container: str, user: str, password: str, database: str, present: set[str], table: str
) -> int:
    if table not in present:
        return 0
    return int(
        mysql_exec(
            container, user, password, database, f"SELECT COUNT(*) FROM `{table}`;"
        ).strip()
        or "0"
    )


def inspect(
    container: str,
    user: str,
    password: str,
    database: str,
    department: str,
    classify_names: list[str],
) -> dict[str, Any]:
    present = table_set(container, user, password, database)
    roots = resolve_roots(container, user, password, database, department, classify_names)
    root_ids = [r["id"] for r in roots]
    roots_q = q_list(root_ids)

    subtree_count = int(
        mysql_exec(
            container,
            user,
            password,
            database,
            f"""
WITH RECURSIVE subtree AS (
  SELECT id FROM t_entry_classify WHERE id IN ({roots_q})
  UNION ALL
  SELECT c.id FROM t_entry_classify c INNER JOIN subtree s ON c.parent_id = s.id
)
SELECT COUNT(*) FROM subtree;
""",
        ).strip()
        or "0"
    )
    entry_count = int(
        mysql_exec(
            container,
            user,
            password,
            database,
            f"""
WITH RECURSIVE subtree AS (
  SELECT id FROM t_entry_classify WHERE id IN ({roots_q})
  UNION ALL
  SELECT c.id FROM t_entry_classify c INNER JOIN subtree s ON c.parent_id = s.id
)
SELECT COUNT(*) FROM t_entry_info WHERE classify_id IN (SELECT id FROM subtree);
""",
        ).strip()
        or "0"
    )
    product_nodes = int(
        mysql_exec(
            container,
            user,
            password,
            database,
            f"""
WITH RECURSIVE subtree AS (
  SELECT id, type FROM t_entry_classify WHERE id IN ({roots_q})
  UNION ALL
  SELECT c.id, c.type FROM t_entry_classify c INNER JOIN subtree s ON c.parent_id = s.id
)
SELECT COUNT(*) FROM subtree WHERE type = 'product';
""",
        ).strip()
        or "0"
    )
    entries_via_relation = 0
    if "t_product_relation" in present:
        entries_via_relation = int(
            mysql_exec(
                container,
                user,
                password,
                database,
                f"""
WITH RECURSIVE subtree AS (
  SELECT id, type FROM t_entry_classify WHERE id IN ({roots_q})
  UNION ALL
  SELECT c.id, c.type FROM t_entry_classify c INNER JOIN subtree s ON c.parent_id = s.id
)
SELECT COUNT(DISTINCT r.entry_id) FROM t_product_relation r
WHERE r.product_id IN (SELECT id FROM subtree WHERE type = 'product');
""",
            ).strip()
            or "0"
        )
    totals: dict[str, int] = {
        "t_entry_classify": count_table(
            container, user, password, database, present, "t_entry_classify"
        ),
        "t_entry_info": count_table(
            container, user, password, database, present, "t_entry_info"
        ),
        "t_product": count_table(container, user, password, database, present, "t_product"),
        "t_product_relation": count_table(
            container, user, password, database, present, "t_product_relation"
        ),
        "t_translate": count_table(
            container, user, password, database, present, "t_translate"
        ),
        "t_task_info": count_table(
            container, user, password, database, present, "t_task_info"
        ),
        "t_user": count_table(container, user, password, database, present, "t_user"),
    }
    if "t_entry_classify" in present:
        totals["classify_dept_distinct"] = int(
            mysql_exec(
                container,
                user,
                password,
                database,
                "SELECT COUNT(DISTINCT department) FROM t_entry_classify;",
            ).strip()
            or "0"
        )
    else:
        totals["classify_dept_distinct"] = 0

    return {
        "ok": True,
        "database": database,
        "department": department,
        "classifyNames": classify_names,
        "roots": roots,
        "subtreeClassifyCount": subtree_count,
        "entriesOnSubtree": entry_count,
        "entriesViaProductRelation": entries_via_relation,
        "productTypedNodesInSubtree": product_nodes,
        "tableTotals": totals,
        "otherClassifyApprox": max(0, totals.get("t_entry_classify", 0) - subtree_count),
    }


def apply_keep(
    container: str,
    user: str,
    password: str,
    database: str,
    department: str,
    classify_names: list[str],
) -> dict[str, Any]:
    before = inspect(container, user, password, database, department, classify_names)
    present = table_set(container, user, password, database)

    audit_entry_col = None
    if "term_agent_audit" in present:
        cols = {
            c.strip()
            for c in mysql_exec(
                container,
                user,
                password,
                database,
                """
SELECT column_name FROM information_schema.columns
WHERE table_schema = DATABASE() AND table_name = 'term_agent_audit';
""",
            ).splitlines()
            if c.strip()
        }
        if "entry_info_id" in cols:
            audit_entry_col = "entry_info_id"
        elif "entry_id" in cols:
            audit_entry_col = "entry_id"
        else:
            present = set(present)
            present.discard("term_agent_audit")

    term_word_entry_col = None
    if "term_word" in present:
        cols = {
            c.strip()
            for c in mysql_exec(
                container,
                user,
                password,
                database,
                """
SELECT column_name FROM information_schema.columns
WHERE table_schema = DATABASE() AND table_name = 'term_word';
""",
            ).splitlines()
            if c.strip()
        }
        if "source_entry_info_id" in cols:
            term_word_entry_col = "source_entry_info_id"
        elif "entry_info_id" in cols:
            term_word_entry_col = "entry_info_id"

    root_ids = [r["id"] for r in before["roots"]]
    sql = build_keep_sql(
        root_ids, department, present, audit_entry_col, term_word_entry_col
    )
    mysql_exec(container, user, password, database, sql)
    after = inspect(container, user, password, database, department, classify_names)
    orphans = int(
        mysql_exec(
            container,
            user,
            password,
            database,
            """
SELECT COUNT(*) FROM t_entry_info e
LEFT JOIN t_entry_classify c ON c.id = e.classify_id
WHERE e.classify_id IS NOT NULL AND e.classify_id <> '' AND c.id IS NULL;
""",
        ).strip()
        or "0"
    )
    return {
        "ok": True,
        "rootsSelected": [
            {"id": r["id"], "name": r["name"], "ambiguous": "ambiguousAlternates" in r}
            for r in before["roots"]
        ],
        "before": before,
        "after": after,
        "orphanEntriesMissingClassify": orphans,
        "tablesConsidered": sorted(present),
        "auditEntryCol": audit_entry_col,
        "termWordEntryCol": term_word_entry_col,
    }


def main(argv: list[str]) -> None:
    if len(argv) < 8:
        raise SystemExit(
            "Usage: keep_classify_ops.py inspect|apply "
            "container user password database department name1,name2"
        )
    cmd = argv[1]
    container, user, password, database, department = argv[2:7]
    department = normalize_department(department)
    names = [n for n in argv[7].split(",") if n]
    if cmd == "inspect":
        out = inspect(container, user, password, database, department, names)
    elif cmd == "apply":
        out = apply_keep(container, user, password, database, department, names)
    else:
        raise SystemExit(f"Unknown cmd: {cmd}")
    print(json.dumps(out, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main(sys.argv)
