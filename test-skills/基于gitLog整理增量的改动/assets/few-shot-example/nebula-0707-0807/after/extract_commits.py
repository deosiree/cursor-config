#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""多仓 git log 抽取 → commits_raw.json（--config 驱动）。"""
from __future__ import annotations

import argparse
import json
import subprocess
from pathlib import Path
from typing import Any


def skill_root() -> Path:
    return Path(__file__).resolve().parent.parent


def load_config(config_path: Path, meta_root_override: str | None) -> dict[str, Any]:
    cfg = json.loads(config_path.read_text(encoding="utf-8"))
    root = skill_root()
    if meta_root_override:
        cfg["metaRoot"] = meta_root_override
    meta = Path(cfg["metaRoot"])
    if not meta.is_absolute():
        meta = (root / meta).resolve()
    cfg["_metaRoot"] = meta
    cfg["_outDir"] = (meta / cfg["outDir"]).resolve()
    cfg["_repos"] = {k: (meta / v).resolve() for k, v in cfg["repos"].items()}
    return cfg


def run_git(cwd: Path, args: list[str]) -> str:
    return subprocess.check_output(
        ["git", *args], cwd=cwd, encoding="utf-8", errors="replace"
    )


def extract(cfg: dict[str, Any]) -> list[dict]:
    author = cfg["author"]
    since = cfg["since"]
    until = cfg.get("until")
    all_commits: list[dict] = []

    for name, path in cfg["_repos"].items():
        if not path.exists():
            print(f"SKIP missing {name}: {path}")
            continue
        log_args = [
            "log",
            f"--since={since}",
            f"--author={author}",
            "--no-merges",
            "--pretty=format:%H%x1f%h%x1f%ad%x1f%s%x1f%b%x1e",
            "--date=short",
        ]
        if until:
            log_args.insert(2, f"--until={until}")
        raw = run_git(path, log_args)
        count = 0
        for block in raw.split("\x1e"):
            if not block.strip():
                continue
            fields = block.strip("\n").split("\x1f")
            while len(fields) < 5:
                fields.append("")
            full, short, date, subject, body = fields[:5]
            full = full.strip()
            try:
                files_raw = run_git(path, ["show", "--name-only", "--pretty=format:", full])
                files = [f for f in files_raw.splitlines() if f.strip()]
            except Exception:
                files = []
            try:
                stat = run_git(path, ["show", "--stat", "--pretty=format:", full])
                stat_lines = [l for l in stat.splitlines() if l.strip()]
                stat_summary = stat_lines[-1] if stat_lines else ""
            except Exception:
                stat_summary = ""
            msg = subject.strip()
            if body.strip():
                msg = f"{msg}\n{body.strip()}"
            all_commits.append(
                {
                    "repo": name,
                    "commit_id": full,
                    "commit_short": short.strip(),
                    "date": date.strip(),
                    "subject": subject.strip(),
                    "body": body.strip(),
                    "message": msg,
                    "files": files,
                    "stat_summary": stat_summary,
                }
            )
            count += 1
        print(f"{name}: {count}")

    all_commits.sort(key=lambda c: (c["date"], c["repo"], c["commit_short"]))
    return all_commits


def main() -> None:
    parser = argparse.ArgumentParser(description="抽取 git log 到 commits_raw.json")
    parser.add_argument(
        "--config",
        default=str(skill_root() / "configs/nebula-huiyan-0707-0807.config.json"),
        help="配置文件路径",
    )
    parser.add_argument("--meta-root", help="覆盖 config.metaRoot")
    args = parser.parse_args()

    cfg_path = Path(args.config)
    if not cfg_path.is_absolute():
        cfg_path = (skill_root() / cfg_path).resolve()
    cfg = load_config(cfg_path, args.meta_root)
    cfg["_outDir"].mkdir(parents=True, exist_ok=True)

    commits = extract(cfg)
    out = cfg["_outDir"] / cfg.get("rawJsonName", "commits_raw.json")
    out.write_text(json.dumps(commits, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"TOTAL {len(commits)}")
    print(f"wrote {out}")


if __name__ == "__main__":
    main()
