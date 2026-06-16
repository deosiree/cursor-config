# -*- coding: utf-8 -*-
"""批量从 cases.json 重新生成模块 CSV（0616 修复等场景）。"""
from __future__ import annotations

import argparse
import sys
from pathlib import Path

from generate_feature_csv import generate, resolve_path

SCRIPT_DIR = Path(__file__).resolve().parent
SKILL_ROOT = SCRIPT_DIR.parent
REPO_ROOT = (SKILL_ROOT / "../../../").resolve()

MODULES = [
    ("tenant.cases.json", "tenant.csv", "tenant.csv"),
    ("role.cases.json", "role.csv", "role.csv"),
    ("menu.cases.json", "menu.csv", "menu.csv"),
    ("login.cases.json", "login.csv", "login.csv"),
    ("user.cases.json", "user.csv", "user.csv"),
    ("dashboard.cases.json", "dashboard.csv", "dashboard.csv"),
    ("securityConfig.cases.json", "securityConfig.csv", "securityConfig.csv"),
]


def main() -> int:
    parser = argparse.ArgumentParser(description="批量重新生成模块测试 CSV")
    parser.add_argument(
        "--output-dir",
        default="",
        help="输出目录（相对 nebula 根），默认 docs/问题单/0616",
    )
    parser.add_argument(
        "--template-dir",
        default="",
        help="模板目录（相对 nebula 根），默认 docs/问题单/模板",
    )
    parser.add_argument(
        "--preserve-ids",
        action="store_true",
        help="从 output-dir 中同名 CSV 按名称回填用例ID",
    )
    parser.add_argument("--force", action="store_true")
    args = parser.parse_args()

    output_dir = Path(args.output_dir) if args.output_dir else REPO_ROOT / "docs/问题单/0616"
    template_dir = Path(args.template_dir) if args.template_dir else REPO_ROOT / "docs/问题单/模板"
    if not output_dir.is_absolute():
        output_dir = (REPO_ROOT / output_dir).resolve()
    if not template_dir.is_absolute():
        template_dir = (REPO_ROOT / template_dir).resolve()

    total = 0
    for cases_file, template_file, output_file in MODULES:
        cases_path = resolve_path(f"configs/{cases_file}", SKILL_ROOT)
        template_path = template_dir / template_file
        output_path = output_dir / output_file
        preserve_from = output_path if args.preserve_ids and output_path.is_file() else None

        if output_path.exists() and not args.force:
            print(f"Skip (exists): {output_path}. Pass --force.", file=sys.stderr)
            return 1

        count = generate(cases_path, template_path, output_path, preserve_from)
        print(f"Wrote {count} rows to {output_path}")
        total += count

    print(f"Done: {len(MODULES)} files, {total} rows total")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
