#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""拷贝黄金样本到 assets/few-shot-example。"""
from __future__ import annotations

import shutil
from pathlib import Path

SKILL = Path(__file__).resolve().parent.parent
SRC = Path(r"F:/Documents/Repertory/Sieyuan/nebula/humanDocs/自测单/gitLog")
AFTER = SKILL / "assets/few-shot-example/nebula-0707-0807/after"
BEFORE = SKILL / "assets/few-shot-example/nebula-0707-0807/before"

FILES = ["commits_raw.json", "extract_commits.py", "build_excel.py", "list_commits.py", "0707-0807.xlsx"]


def main() -> None:
    AFTER.mkdir(parents=True, exist_ok=True)
    BEFORE.mkdir(parents=True, exist_ok=True)
    for name in FILES:
        src = SRC / name
        if src.exists():
            shutil.copy2(src, AFTER / name)
            print("copied", name)


if __name__ == "__main__":
    main()
