# -*- coding: utf-8 -*-
"""通用测试用例 CSV 生成器：读取 config.json + cases.json，输出 UTF-8 BOM CSV。"""
from __future__ import annotations

import argparse
import csv
import json
import sys
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
SKILL_ROOT = SCRIPT_DIR.parent

CASE_FIELD_MAP = {
    "name": "名称",
    "precondition": "前置条件",
    "steps": "测试步骤",
    "expected": "预期结果",
    "remark": "备注",
}


def expected_csv_column(header: list[str]) -> str:
    """menu.csv 等模板用「用例结果」，部分模板用「预期结果」。"""
    if "预期结果" in header:
        return "预期结果"
    if "用例结果" in header:
        return "用例结果"
    return "预期结果"


def load_json(path: Path) -> dict | list:
    with path.open(encoding="utf-8") as f:
        return json.load(f)


def resolve_path(raw: str, base: Path) -> Path:
    p = Path(raw)
    if p.is_absolute():
        return p
    return (base / p).resolve()


def build_row(field_defaults: dict, case: dict, header: list[str] | None = None) -> dict:
    row = dict(field_defaults)
    expected_col = expected_csv_column(header) if header else "预期结果"
    for case_key, csv_key in CASE_FIELD_MAP.items():
        if case_key not in case or case[case_key] is None:
            continue
        target = expected_col if case_key == "expected" else csv_key
        row[target] = case[case_key]
    return row


def read_header(template_path: Path) -> list[str]:
    with template_path.open(encoding="utf-8-sig", newline="") as f:
        reader = csv.reader(f)
        header = next(reader)
    return header


def generate(config_path: Path, output_override: str | None = None, force: bool = False) -> tuple[Path, int]:
    config = load_json(config_path)
    skill_root = SKILL_ROOT
    repo_root = resolve_path(config.get("repoRoot", "../../.."), skill_root)

    cases_rel = config.get("casesFile", "")
    cases_path = resolve_path(cases_rel, skill_root)
    cases_data = load_json(cases_path)
    cases = cases_data.get("cases", cases_data) if isinstance(cases_data, dict) else cases_data

    if not cases:
        print(f"No cases found in {cases_path}. Stopping — empty CSV would be meaningless.", file=sys.stderr)
        return output_path, 0

    template_path = resolve_path(config["csvTemplatePath"], repo_root)
    if output_override:
        out_p = Path(output_override)
        output_path = out_p if out_p.is_absolute() else (skill_root / output_override).resolve()
    else:
        output_path = resolve_path(config["outputPath"], repo_root)
    field_defaults = config.get("fieldDefaults", {})

    header = read_header(template_path)
    rows = [build_row(field_defaults, case, header) for case in cases]

    # G3 CSV 覆盖确认
    if output_path.exists() and not force:
        print(f"G3: Output already exists: {output_path} ({len(output_path.read_text(encoding='utf-8-sig').splitlines())} existing lines)", file=sys.stderr)
        print(f"G3: About to write {len(rows)} new rows. Pass --force to skip this check.", file=sys.stderr)
        return output_path, -1

    output_path.parent.mkdir(parents=True, exist_ok=True)
    with output_path.open("w", encoding="utf-8-sig", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=header, extrasaction="ignore")
        writer.writeheader()
        writer.writerows(rows)

    return output_path, len(rows)


def main() -> int:
    parser = argparse.ArgumentParser(description="从 config + cases 生成测试系统 CSV")
    parser.add_argument(
        "--config",
        required=True,
        help="模块 config.json 路径（相对 skill 根或绝对路径）",
    )
    parser.add_argument("--output", default="", help="覆盖 outputPath（可选）")
    parser.add_argument("--force", action="store_true", help="跳过 G3 CSV 覆盖确认")
    args = parser.parse_args()

    config_path = resolve_path(args.config, SKILL_ROOT)
    if not config_path.is_file():
        print(f"Config not found: {config_path}", file=sys.stderr)
        return 1

    out_path, count = generate(config_path, args.output or None, force=args.force)
    if count == -1:
        print(f"G3: Skipped. Re-run with --force to overwrite {out_path}", file=sys.stderr)
        return 2
    print(f"Wrote {count} rows to {out_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
