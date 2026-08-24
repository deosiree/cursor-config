#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import json
from pathlib import Path

rows = json.loads(
    Path(r"F:\Documents\Repertory\Sieyuan\nebula\humanDocs\自测单\gitLog\commits_raw.json").read_text(
        encoding="utf-8"
    )
)
for r in rows:
    print(f"{r['date']}|{r['repo']}|{r['commit_short']}|{r['subject'][:100]}")
print("---", len(rows))
