# -*- coding: utf-8 -*-
"""按 alarm_.csv 风格从 cases.json 生成带功能集合的测试系统 CSV。"""
from __future__ import annotations

import argparse
import csv
import json
import sys
from pathlib import Path

from csv_step_format import (
    build_combined_test_steps,
    clear_result_columns,
    apply_skill_csv_defaults,
)

SCRIPT_DIR = Path(__file__).resolve().parent
SKILL_ROOT = SCRIPT_DIR.parent

CASE_TO_ROW = {
    "name": "名称",
    "description": "描述",
    "purpose": "用例目的",
    "remark": "备注",
    "level": "用例等级",
    "featureSet": "功能集合",
    "summary": "用例说明",
    "precondition": "前置条件",
    "env": "环境说明",
    "reserve1": "预留字段1",
    "sortOrder": "排序顺序",
}

# 对齐 docs/问题单/模板/types.csv：function=0 error=1 yali=2 bianjie=3
CASE_TYPE_BY_KEY = {
    "function": "0",
    "error": "1",
    "yali": "2",
    "bianjie": "3",
}


def resolve_case_type(case: dict) -> str:
    """由 cases 键 caseType 或 direction/featureSet 推导 CSV 用例类型列。"""
    if case.get("caseType") is not None:
        raw = case["caseType"]
        if isinstance(raw, str) and raw in CASE_TYPE_BY_KEY:
            return CASE_TYPE_BY_KEY[raw]
        return str(raw)

    direction = case.get("direction", "正向")
    feature_set = case.get("featureSet", "")

    if direction == "异常" or feature_set == "异常处理":
        return "1"
    if direction == "边界":
        return "3"
    if direction == "压力" or feature_set == "压力测试":
        return "2"
    return "0"


def resolve_path(raw: str, base: Path) -> Path:
    p = Path(raw)
    return p if p.is_absolute() else (base / p).resolve()


def load_cases(path: Path) -> tuple[dict, list[dict]]:
    with path.open(encoding="utf-8") as f:
        data = json.load(f)
    if isinstance(data, dict):
        return data.get("fieldDefaults", {}), data.get("cases", [])
    return {}, data


def build_description(case: dict) -> str:
    if case.get("description"):
        return case["description"]
    direction = case.get("direction", "正向")
    feature = case.get("featureSet", "")
    name = case.get("name", "")
    return f"{feature} — {direction} — {name}" if feature and name else name


def case_to_row(
    case: dict,
    defaults: dict,
    header: list[str],
    id_by_name: dict[str, str] | None = None,
) -> dict:
    row = {k: "" for k in header}
    row.update(defaults)
    for key, col in CASE_TO_ROW.items():
        if key not in case or case[key] is None:
            continue
        if col in header:
            row[col] = str(case[key])

    row["测试步骤"] = build_combined_test_steps(
        case.get("steps", ""),
        case.get("expected", ""),
    )
    clear_result_columns(row, header)

    row["描述"] = build_description(case)
    if not row.get("用例说明"):
        row["用例说明"] = case.get("name", "")

    name = case.get("name", "")
    if "用例ID" in header:
        if case.get("legacyId"):
            row["用例ID"] = str(case["legacyId"])
        elif id_by_name and name in id_by_name:
            row["用例ID"] = id_by_name[name]
        else:
            row["用例ID"] = ""

    if "用例类型" in header:
        row["用例类型"] = resolve_case_type(case)
    apply_skill_csv_defaults(row, header)
    return row


def read_header(template_path: Path) -> list[str]:
    for enc in ("utf-8-sig", "utf-8", "gbk"):
        try:
            with template_path.open(encoding=enc, newline="") as f:
                return next(csv.reader(f))
        except UnicodeDecodeError:
            continue
    raise UnicodeDecodeError("template", b"", 0, 1, f"Cannot decode {template_path}")


def case_already_imported(case: dict, existing_names: set[str]) -> bool:
    """名称精确匹配，或 importedAliasNames 命中已导入旧名（cases 重命名场景）。"""
    name = (case.get("name") or "").strip()
    if name in existing_names:
        return True
    for alias in case.get("importedAliasNames") or []:
        if (alias or "").strip() in existing_names:
            return True
    return False


def generate(
    cases_path: Path,
    template_path: Path,
    output_path: Path,
    preserve_ids_from: Path | None = None,
    only_new_from: Path | None = None,
) -> int:
    defaults, cases = load_cases(cases_path)
    if "用例结果" in defaults:
        defaults["用例结果"] = ""
    header = read_header(template_path)

    if only_new_from:
        existing_names = load_existing_case_names(only_new_from)
        cases = [c for c in cases if not case_already_imported(c, existing_names)]
        id_by_name: dict[str, str] = {}
    else:
        id_by_name = load_name_to_id_map(preserve_ids_from) if preserve_ids_from else {}

    rows = [case_to_row(c, defaults, header, id_by_name) for c in cases]
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with output_path.open("w", encoding="utf-8-sig", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=header, extrasaction="ignore")
        writer.writeheader()
        writer.writerows(rows)
    return len(rows)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--cases", required=True)
    parser.add_argument("--template", required=True)
    parser.add_argument("--output", required=True)
    parser.add_argument("--force", action="store_true")
    parser.add_argument(
        "--preserve-ids-from",
        default="",
        help="更新场景：从已有 CSV 按「名称」回填用例ID",
    )
    parser.add_argument(
        "--only-new-from",
        default="",
        help="增量导入：仅导出基准 CSV 中不存在的用例（用例ID 留空，不与 preserve 联用）",
    )
    args = parser.parse_args()

    cases_path = resolve_path(args.cases, SKILL_ROOT)
    template_path = Path(args.template)
    output_path = Path(args.output)
    preserve_path = Path(args.preserve_ids_from) if args.preserve_ids_from else None
    only_new_path = Path(args.only_new_from) if args.only_new_from else None

    if output_path.exists() and not args.force:
        print(f"Output exists: {output_path}. Pass --force to overwrite.", file=sys.stderr)
        return 1

    count = generate(cases_path, template_path, output_path, preserve_path, only_new_path)
    print(f"Wrote {count} rows to {output_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
