#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""将 t-cloud 菜单 YAML 转为 scan-menu-rules 可用的 MenuVO JSON（只读转换，不写后端）。"""
from __future__ import annotations

import json
import sys
from pathlib import Path

import yaml

FIELD_MAP = {
    "parent_id": "parentId",
    "project_id": "projectId",
    "route_path": "routePath",
    "route_name": "routeName",
    "sort_order": "sort",
    "is_visible": "isVisible",
    "is_system_only": "isSystemOnly",
    "keep_alive": "keepAlive",
}


def convert_node(node: dict, project_label: str) -> dict:
    out: dict = {}
    for k, v in node.items():
        if k == "children":
            continue
        key = FIELD_MAP.get(k, k)
        out[key] = v

    # 导出里 project_id 恒为 0，用文件名区分项目，避免跨文件误合并
    out["projectId"] = project_label

    raw_params = out.get("params")
    if isinstance(raw_params, str):
        try:
            out["params"] = json.loads(raw_params) if raw_params.strip() else []
        except json.JSONDecodeError:
            out["params"] = []
    elif raw_params is None:
        out["params"] = []

    if "id" in out and out["id"] is not None:
        out["id"] = str(out["id"])
    if out.get("parentId") is not None:
        out["parentId"] = str(out["parentId"])
    else:
        out["parentId"] = None

    children = node.get("children") or []
    if children:
        out["children"] = [convert_node(c, project_label) for c in children]
    return out


def convert_file(path: Path) -> list:
    data = yaml.safe_load(path.read_text(encoding="utf-8")) or {}
    menus = data.get("menus") or []
    label = path.stem
    return [convert_node(m, label) for m in menus]


def main() -> int:
    src = Path(sys.argv[1] if len(sys.argv) > 1 else ".")
    out_dir = Path(sys.argv[2] if len(sys.argv) > 2 else src / "_scan_json")
    out_dir.mkdir(parents=True, exist_ok=True)

    combined: list = []
    for yml in sorted(src.glob("*.yaml")):
        tree = convert_file(yml)
        single = out_dir / f"{yml.stem}.json"
        single.write_text(json.dumps(tree, ensure_ascii=False, indent=2), encoding="utf-8")
        print(f"wrote {single} roots={len(tree)}")
        combined.extend(tree)

    all_path = out_dir / "_all.json"
    all_path.write_text(json.dumps(combined, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"wrote {all_path} roots={len(combined)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
