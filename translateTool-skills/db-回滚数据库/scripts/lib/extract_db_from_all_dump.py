"""Extract one database section from mysqldump --all-databases."""
import json
import re
import sys
from pathlib import Path


def main():
    src = Path(sys.argv[1])
    database = sys.argv[2]
    out = Path(sys.argv[3])

    marker = f"-- Current Database: `{database}`".encode("utf-8")
    next_pat = re.compile(rb"-- Current Database: `([^`]+)`")

    data_start = None
    with src.open("rb") as f:
        pos = 0
        buf = b""
        while True:
            chunk = f.read(8 * 1024 * 1024)
            if not chunk:
                break
            blob = buf + chunk
            i = blob.find(marker)
            if i >= 0:
                data_start = pos - len(buf) + i
                break
            buf = blob[-len(marker) :]
            pos += len(chunk)

    if data_start is None:
        use_m = f"USE `{database}`".encode("utf-8")
        with src.open("rb") as f:
            pos = 0
            while True:
                chunk = f.read(8 * 1024 * 1024)
                if not chunk:
                    break
                i = chunk.find(use_m)
                if i >= 0:
                    data_start = pos + i
                    break
                pos += len(chunk)
        if data_start is None:
            raise SystemExit(f"Database section not found: {database}")

    data_end = src.stat().st_size
    with src.open("rb") as f:
        f.seek(data_start + len(marker))
        pos = data_start + len(marker)
        while True:
            chunk = f.read(8 * 1024 * 1024)
            if not chunk:
                break
            for m in next_pat.finditer(chunk):
                abspos = pos + m.start()
                if abspos > data_start + 50:
                    data_end = abspos
                    break
            else:
                pos += len(chunk)
                continue
            break

    # Mid-section extracts miss mysqldump @OLD_* init; without it the footer
    # SET TIME_ZONE=@OLD_TIME_ZONE fails (NULL) on MySQL 8. Init + rewrite sanitize.
    header = (
        b"-- Extracted single-database dump (from --all-databases)\n"
        + f"-- Source database: {database}\n".encode()
        + b"/*!40101 SET NAMES utf8mb4 */;\n"
        + b"/*!40103 SET TIME_ZONE='+00:00' */;\n"
        + b"/*!40014 SET FOREIGN_KEY_CHECKS=0 */;\n"
        + b"/*!40014 SET UNIQUE_CHECKS=0 */;\n"
        + f"CREATE DATABASE IF NOT EXISTS `{database}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;\n".encode()
        + f"USE `{database}`;\n\n".encode()
    )

    written = 0
    with src.open("rb") as fin, out.open("wb") as fout:
        fout.write(header)
        fin.seek(data_start)
        remain = data_end - data_start
        while remain > 0:
            n = min(8 * 1024 * 1024, remain)
            chunk = fin.read(n)
            if not chunk:
                break
            fout.write(chunk)
            written += len(chunk)
            remain -= len(chunk)

    print(
        json.dumps(
            {
                "ok": True,
                "database": database,
                "source": str(src),
                "outPath": str(out),
                "sectionStart": data_start,
                "sectionEnd": data_end,
                "bytesWritten": written,
                "sizeHumanMB": round(out.stat().st_size / 1e6, 2),
            },
            ensure_ascii=False,
        )
    )


if __name__ == "__main__":
    main()
