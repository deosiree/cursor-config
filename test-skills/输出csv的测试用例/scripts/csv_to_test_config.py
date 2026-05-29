# -*- coding: utf-8 -*-
"""从参考 CSV 推断 fieldDefaults，写出模块 config.json 骨架。"""
from __future__ import annotations

import argparse
import csv
import json
import sys
from collections import Counter
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
SKILL_ROOT = SCRIPT_DIR.parent

# 用例行字段，不参与默认值推断
CASE_COLUMNS = {"名称", "前置条件", "测试步骤", "预期结果", "备注", "用例说明"}

# 通常留空的列
PREFER_EMPTY = {"用例ID", "功能集合", "描述", "创建时间", "环境说明", "需求编号"}


def resolve_path(raw: str, base: Path) -> Path:
    p = Path(raw)
    if p.is_absolute():
        return p
    return (base / p).resolve()


def infer_defaults(rows: list[dict], header: list[str]) -> dict[str, str]:
    defaults: dict[str, str] = {}
    for col in header:
        if col in CASE_COLUMNS:
            continue
        if col in PREFER_EMPTY:
            defaults[col] = ""
            continue
        values = [str(r.get(col, "")).strip() for r in rows if r.get(col) is not None]
        non_empty = [v for v in values if v]
        if not non_empty:
            defaults[col] = ""
            continue
        counter = Counter(non_empty)
        defaults[col] = counter.most_common(1)[0][0]
    return defaults


def read_csv_rows(path: Path) -> tuple[list[str], list[dict]]:
    with path.open(encoding="utf-8-sig", newline="") as f:
        reader = csv.DictReader(f)
        header = reader.fieldnames or []
        rows = list(reader)
    return list(header), rows


def build_config(
    module_id: str,
    reference_csv: Path,
    output_config: Path,
    repo_root: Path,
    cases_file: str,
    output_csv: str | None,
    field_overrides: dict | None,
) -> dict:
    header, rows = read_csv_rows(reference_csv)
    field_defaults = infer_defaults(rows, header)
    if field_overrides:
        field_defaults.update(field_overrides)

    try:
        csv_rel = reference_csv.relative_to(repo_root).as_posix()
    except ValueError:
        csv_rel = str(reference_csv)

    out_path = output_csv
    if not out_path:
        out_path = f"docs/问题单/0529/{module_id}.csv"

    config = {
        "moduleId": module_id,
        "repoRoot": "../../..",
        "csvTemplatePath": csv_rel,
        "outputPath": out_path.replace("\\", "/"),
        "casesFile": cases_file.replace("\\", "/"),
        "fieldDefaults": field_defaults,
    }
    return config


def main() -> int:
    parser = argparse.ArgumentParser(description="参考 CSV → config.json")
    parser.add_argument("--reference-csv", required=True, help="参考或模板 CSV")
    parser.add_argument("--module-id", required=True, help="模块 ID，如 tenant-unit")
    parser.add_argument(
        "--output-config",
        required=True,
        help="输出 config.json 路径（相对 skill 根或绝对）",
    )
    parser.add_argument(
        "--cases-file",
        default="",
        help="cases.json 相对 skill 根路径，默认 configs/{module-id}.cases.json",
    )
    parser.add_argument("--output-csv", default="", help="outputPath 覆盖")
    parser.add_argument(
        "--overrides-json",
        default="",
        help='fieldDefaults 覆盖 JSON，如 {"模块名":"租户管理","创建人员":"惠岩"}',
    )
    args = parser.parse_args()

    ref = resolve_path(args.reference_csv, Path.cwd())
    if not ref.is_file():
        print(f"Reference CSV not found: {ref}", file=sys.stderr)
        return 1

    cases_file = args.cases_file or f"configs/{args.module_id}.cases.json"
    overrides = json.loads(args.overrides_json) if args.overrides_json else None
    repo_root = (SKILL_ROOT / "../../..").resolve()

    config = build_config(
        args.module_id,
        ref,
        resolve_path(args.output_config, SKILL_ROOT),
        repo_root,
        cases_file,
        args.output_csv or None,
        overrides,
    )

    out_path = resolve_path(args.output_config, SKILL_ROOT)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    with out_path.open("w", encoding="utf-8") as f:
        json.dump(config, f, ensure_ascii=False, indent=2)
        f.write("\n")

    print(f"Wrote config to {out_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
