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


def resolve_repo_path(path_str: str) -> Path:
    """相对 nebula 根解析路径；若以 .. 开头则相对当前工作目录。"""
    p = Path(path_str)
    if p.is_absolute():
        return p.resolve()
    if p.parts and p.parts[0] == "..":
        return (Path.cwd() / p).resolve()
    return (REPO_ROOT / p).resolve()


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
    parser.add_argument(
        "--preserve-ids-from-dir",
        default="",
        help="从指定目录同名 CSV 按名称回填用例ID（如 docs/问题单/0616_v1）",
    )
    parser.add_argument(
        "--only-new-from-dir",
        default="",
        help="增量导入：各模块仅导出基准目录中不存在的用例；无新增则跳过该文件",
    )
    parser.add_argument("--force", action="store_true")
    args = parser.parse_args()

    output_dir = resolve_repo_path(args.output_dir) if args.output_dir else REPO_ROOT / "docs/问题单/0616"
    template_dir = resolve_repo_path(args.template_dir) if args.template_dir else REPO_ROOT / "docs/问题单/模板"
    preserve_dir = resolve_repo_path(args.preserve_ids_from_dir) if args.preserve_ids_from_dir else None
    only_new_dir = resolve_repo_path(args.only_new_from_dir) if args.only_new_from_dir else None

    if args.preserve_ids_from_dir and args.only_new_from_dir:
        print("Use either --preserve-ids-from-dir or --only-new-from-dir, not both.", file=sys.stderr)
        return 1

    total = 0
    written = 0
    for cases_file, template_file, output_file in MODULES:
        cases_path = resolve_path(f"configs/{cases_file}", SKILL_ROOT)
        template_path = template_dir / template_file
        output_path = output_dir / output_file
        preserve_from = None
        only_new_from = None
        if only_new_dir and (only_new_dir / output_file).is_file():
            only_new_from = only_new_dir / output_file
        elif preserve_dir and (preserve_dir / output_file).is_file():
            preserve_from = preserve_dir / output_file

        if output_path.exists() and not args.force:
            print(f"Skip (exists): {output_path}. Pass --force.", file=sys.stderr)
            return 1

        count = generate(cases_path, template_path, output_path, preserve_from, only_new_from)
        total += count
        if count == 0 and only_new_from:
            if output_path.is_file():
                output_path.unlink()
            print(f"Skip (no new cases): {output_file}")
            continue
        written += 1
        print(f"Wrote {count} rows to {output_path}")

    print(f"Done: {written} files written, {total} new rows total")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
