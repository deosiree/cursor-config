# -*- coding: utf-8 -*-
"""从 docs/0529/generate_menu_unit_csv.py 提取 cases.json（一次性迁移）。"""
from __future__ import annotations

import importlib.util
import json
import sys
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
SKILL_ROOT = SCRIPT_DIR.parent
REPO_ROOT = (SKILL_ROOT / "../../..").resolve()
LEGACY = REPO_ROOT / "docs/问题单/0529/generate_menu_unit_csv.py"
CASES_OUT = SKILL_ROOT / "configs/menu-unit-gateway.cases.json"


def load_legacy():
    spec = importlib.util.spec_from_file_location("legacy_menu_csv", LEGACY)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"Cannot load {LEGACY}")
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


def rows_to_cases(rows: list[dict]) -> list[dict]:
    return [
        {
            "name": r["名称"],
            "precondition": r["前置条件"],
            "steps": r["测试步骤"],
            "expected": r["预期结果"],
            "remark": r["备注"],
        }
        for r in rows
    ]


def main() -> int:
    if not LEGACY.is_file():
        print(f"Legacy script not found: {LEGACY}", file=sys.stderr)
        return 1

    legacy = load_legacy()
    legacy.ROWS.clear()
    legacy.add_gateway_cases()
    legacy.add_tree_helper_cases()
    legacy.add_route_cases()
    legacy.add_system_only_cases()
    legacy.add_project_scope_cases()
    legacy.add_cache_cases()

    payload = {
        "moduleId": "menu-unit-gateway",
        "cases": rows_to_cases(legacy.ROWS),
    }

    CASES_OUT.parent.mkdir(parents=True, exist_ok=True)
    with CASES_OUT.open("w", encoding="utf-8") as f:
        json.dump(payload, f, ensure_ascii=False, indent=2)
        f.write("\n")

    print(f"Wrote {len(payload['cases'])} cases to {CASES_OUT}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
