# -*- coding: utf-8 -*-
"""CSV 测试步骤合并格式（规则 A/B，见 references/csv-export-format-rules.md）。"""
from __future__ import annotations

import csv
from pathlib import Path


def build_combined_test_steps(steps: str, expected: str) -> str:
    """将 steps 与 expected 合并为测试系统可导入的「测试步骤」列内容。"""
    steps = (steps or "").strip()
    expected = (expected or "").strip()
    if not expected:
        return f"测试步骤：\n{steps}" if steps else ""
    return f"测试步骤：\n{steps}\n---\n预期结果：\n{expected}"


def clear_result_columns(row: dict, header: list[str]) -> None:
    """规则 B：用例结果 / 预期结果列留空。"""
    for col in ("用例结果", "预期结果"):
        if col in header:
            row[col] = ""


def load_name_to_id_map(csv_path: Path) -> dict[str, str]:
    """从已有 CSV 按「名称」建立用例ID映射（规则 C：更新场景）。"""
    if not csv_path.is_file():
        return {}
    mapping: dict[str, str] = {}
    for enc in ("utf-8-sig", "utf-8", "gbk"):
        try:
            with csv_path.open(encoding=enc, newline="") as f:
                for row in csv.DictReader(f):
                    name = (row.get("名称") or "").strip()
                    case_id = (row.get("用例ID") or "").strip()
                    if name and case_id:
                        mapping[name] = case_id
            return mapping
        except UnicodeDecodeError:
            continue
    return mapping
