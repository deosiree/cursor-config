"""Rewrite CREATE DATABASE / USE markers and sanitize session restore footers."""
from __future__ import annotations

import json
import sys
from pathlib import Path

# Extracted mid-section dumps lack @OLD_* init; restoring NULL fails on MySQL 8.
SANITIZE = [
    (
        b"/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;",
        b"/*!40103 SET TIME_ZONE='+00:00' */;",
    ),
    (
        b"/*!50606 SET GLOBAL INNODB_STATS_AUTO_RECALC=@OLD_INNODB_STATS_AUTO_RECALC */;",
        b"-- skipped GLOBAL INNODB_STATS_AUTO_RECALC restore",
    ),
    (
        b"/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;",
        b"/*!40101 SET SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;",
    ),
    (
        b"/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;",
        b"/*!40014 SET FOREIGN_KEY_CHECKS=1 */;",
    ),
    (
        b"/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;",
        b"/*!40014 SET UNIQUE_CHECKS=1 */;",
    ),
    (
        b"/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;",
        b"/*!40101 SET CHARACTER_SET_CLIENT=utf8mb4 */;",
    ),
    (
        b"/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;",
        b"/*!40101 SET CHARACTER_SET_RESULTS=utf8mb4 */;",
    ),
    (
        b"/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;",
        b"/*!40101 SET COLLATION_CONNECTION=utf8mb4_unicode_ci */;",
    ),
    (
        b"/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;",
        b"/*!40111 SET SQL_NOTES=1 */;",
    ),
]


def rewrite(src: Path, dst: Path, from_db: str, to_db: str) -> dict:
    from_b = from_db.encode("utf-8")
    to_b = to_db.encode("utf-8")
    replacements = [
        (f"-- Current Database: `{from_db}`".encode(), f"-- Current Database: `{to_db}`".encode()),
        (
            f"CREATE DATABASE /*!32312 IF NOT EXISTS*/ `{from_db}`".encode(),
            f"CREATE DATABASE /*!32312 IF NOT EXISTS*/ `{to_db}`".encode(),
        ),
        (
            f"CREATE DATABASE IF NOT EXISTS `{from_db}`".encode(),
            f"CREATE DATABASE IF NOT EXISTS `{to_db}`".encode(),
        ),
        (f"CREATE DATABASE `{from_db}`".encode(), f"CREATE DATABASE `{to_db}`".encode()),
        (f"USE `{from_db}`".encode(), f"USE `{to_db}`".encode()),
    ]
    tick_from = b"`" + from_b + b"`"
    tick_to = b"`" + to_b + b"`"

    prelude = (
        b"-- sanitize: init session vars missing from mid-section all-databases extract\n"
        b"/*!40103 SET TIME_ZONE='+00:00' */;\n"
        b"/*!40014 SET FOREIGN_KEY_CHECKS=0 */;\n"
        b"/*!40014 SET UNIQUE_CHECKS=0 */;\n"
        b"/*!40101 SET NAMES utf8mb4 */;\n"
    )

    written = 0
    replaced = 0
    sanitized = 0
    overlap = max(len(p[0]) for p in replacements + SANITIZE) + len(tick_from) + 8
    carry = b""
    with src.open("rb") as fin, dst.open("wb") as fout:
        fout.write(prelude)
        written += len(prelude)
        while True:
            chunk = fin.read(8 * 1024 * 1024)
            if not chunk and not carry:
                break
            blob = carry + chunk
            if chunk:
                keep = blob[-overlap:]
                work = blob[:-overlap] if len(blob) > overlap else b""
                if len(chunk) < 8 * 1024 * 1024:
                    work = blob
                    keep = b""
            else:
                work = blob
                keep = b""

            for old, new in replacements:
                c = work.count(old)
                if c:
                    replaced += c
                    work = work.replace(old, new)
            c2 = work.count(tick_from)
            if c2:
                replaced += c2
                work = work.replace(tick_from, tick_to)
            for old, new in SANITIZE:
                c = work.count(old)
                if c:
                    sanitized += c
                    work = work.replace(old, new)

            fout.write(work)
            written += len(work)
            carry = keep

    return {
        "ok": True,
        "source": str(src),
        "outPath": str(dst),
        "fromDb": from_db,
        "toDb": to_db,
        "bytesWritten": written,
        "replacements": replaced,
        "sanitizedSessionRestores": sanitized,
    }


def main() -> None:
    if len(sys.argv) != 5:
        raise SystemExit(
            "Usage: rewrite_dump_database.py <src.sql> <dst.sql> <from_db> <to_db>"
        )
    src, dst, from_db, to_db = Path(sys.argv[1]), Path(sys.argv[2]), sys.argv[3], sys.argv[4]
    print(json.dumps(rewrite(src, dst, from_db, to_db), ensure_ascii=False))


if __name__ == "__main__":
    main()
