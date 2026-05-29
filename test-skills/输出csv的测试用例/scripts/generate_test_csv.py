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


def load_json(path: Path) -> dict | list:
    with path.open(encoding="utf-8") as f:
        return json.load(f)


def resolve_path(raw: str, base: Path) -> Path:
    p = Path(raw)
    if p.is_absolute():
        return p
    return (base / p).resolve()


def build_row(field_defaults: dict, case: dict) -> dict:
    row = dict(field_defaults)
    for case_key, csv_key in CASE_FIELD_MAP.items():
        if case_key in case and case[case_key] is not None:
            row[csv_key] = case[case_key]
    return row


def read_header(template_path: Path) -> list[str]:
    with template_path.open(encoding="utf-8-sig", newline="") as f:
        reader = csv.reader(f)
        header = next(reader)
    return header


def generate(config_path: Path, output_override: str | None = None) -> tuple[Path, int]:
    config = load_json(config_path)
    skill_root = SKILL_ROOT
    repo_root = resolve_path(config.get("repoRoot", "../../.."), skill_root)

    cases_rel = config.get("casesFile", "")
    cases_path = resolve_path(cases_rel, skill_root)
    cases_data = load_json(cases_path)
    cases = cases_data.get("cases", cases_data) if isinstance(cases_data, dict) else cases_data

    template_path = resolve_path(config["csvTemplatePath"], repo_root)
    if output_override:
        out_p = Path(output_override)
        output_path = out_p if out_p.is_absolute() else (skill_root / output_override).resolve()
    else:
        output_path = resolve_path(config["outputPath"], repo_root)
    field_defaults = config.get("fieldDefaults", {})

    header = read_header(template_path)
    rows = [build_row(field_defaults, case) for case in cases]

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
    args = parser.parse_args()

    config_path = resolve_path(args.config, SKILL_ROOT)
    if not config_path.is_file():
        print(f"Config not found: {config_path}", file=sys.stderr)
        return 1

    out_path, count = generate(config_path, args.output or None)
    print(f"Wrote {count} rows to {out_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
