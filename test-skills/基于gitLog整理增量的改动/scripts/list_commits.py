#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import argparse
import json
from pathlib import Path


def skill_root() -> Path:
    return Path(__file__).resolve().parent.parent


def main() -> None:
    p = argparse.ArgumentParser()
    p.add_argument("--config", default=str(skill_root() / "configs/nebula-huiyan-0707-0807.config.json"))
    p.add_argument("--meta-root")
    args = p.parse_args()
    root = skill_root()
    cfg = json.loads((root / args.config if not Path(args.config).is_absolute() else Path(args.config)).read_text(encoding="utf-8"))
    meta = Path(args.meta_root or cfg["metaRoot"])
    raw = meta / cfg["outDir"] / cfg.get("rawJsonName", "commits_raw.json")
    rows = json.loads(raw.read_text(encoding="utf-8"))
    for r in rows:
        print(f"{r['date']}|{r['repo']}|{r['commit_short']}|{r['subject'][:100]}")
    print("---", len(rows))


if __name__ == "__main__":
    main()
