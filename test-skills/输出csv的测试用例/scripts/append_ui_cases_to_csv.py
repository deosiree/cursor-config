# -*- coding: utf-8 -*-
"""UI 测试用例追加写入脚本：模板不存在时报错 / 首次复制整表 / 已存在追加 / 功能集合强制空 / UTF-8 BOM。"""
from __future__ import annotations

import argparse
import csv
import json
import shutil
import sys
from datetime import datetime
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
SKILL_ROOT = SCRIPT_DIR.parent

DOMAIN_TEMPLATE_MAP = {
    "role": "role.csv",
    "menu": "menu.csv",
    "tenant": "tenant.csv",
    "user": "用户管理.csv",
    "e2e": "e2e.csv",
    "login": "login-logout.csv",
    "required": "必填字段.csv",
}

DEFAULT_TEMPLATE_DIR = "docs/问题单/模板"
DEFAULT_OUTPUT_DIR = "docs/问题单/{date}"


def resolve_path(raw: str, base: Path) -> Path:
    p = Path(raw)
    if p.is_absolute():
        return p
    return (base / p).resolve()


def list_available_templates(template_dir: Path) -> list[str]:
    if not template_dir.is_dir():
        return []
    return sorted(f.name for f in template_dir.iterdir() if f.suffix == ".csv")


def load_cases(cases_path: Path) -> list[dict]:
    with cases_path.open(encoding="utf-8") as f:
        data = json.load(f)
    if isinstance(data, dict):
        return data.get("cases", [])
    return data


def read_header(template_path: Path) -> list[str]:
    with template_path.open(encoding="utf-8-sig", newline="") as f:
        reader = csv.reader(f)
        return next(reader)


def read_existing_rows(csv_path: Path) -> list[dict]:
    """读取已有 CSV 全部行（含表头）。"""
    with csv_path.open(encoding="utf-8-sig", newline="") as f:
        reader = csv.DictReader(f)
        return list(reader)


def build_ui_rows(header: list[str], field_defaults: dict, cases: list[dict]) -> list[dict]:
    """将 cases 转为 CSV 行，强制功能集合为空。"""
    rows = []
    for case in cases:
        row = dict(field_defaults)
        row["名称"] = case.get("name", "")
        row["前置条件"] = case.get("precondition", "")
        row["测试步骤"] = case.get("steps", "")
        expected = case.get("expected", "")
        row["预期结果"] = expected
        # develop结果 优先用 case 指定值，其次 fieldDefaults（如 "0"），最后兜底预期结果
        row["develop结果"] = case.get("develop_result", row.get("develop结果", expected))
        # 强制留空
        row["功能集合"] = ""
        row["用例ID"] = ""
        # 只保留 header 中的列
        row = {k: row.get(k, "") for k in header}
        rows.append(row)
    return rows


def append(config: dict, skill_root: Path) -> tuple[Path, int, bool]:
    """执行追加写入。返回 (output_path, appended_count, is_new_file)。"""
    repo_root = resolve_path(config.get("repoRoot", "../../.."), skill_root)

    # 解析 domain → 模板文件名
    domain = config.get("domain", "")
    template_filename = DOMAIN_TEMPLATE_MAP.get(domain)
    if not template_filename:
        template_dir = resolve_path(config.get("templateDir", DEFAULT_TEMPLATE_DIR), repo_root)
        available = list_available_templates(template_dir)
        msg = f"Unknown domain '{domain}'. Available templates in {template_dir}:\n"
        msg += "\n".join(f"  - {f}" for f in available) if available else "  (none)"
        raise ValueError(msg)

    template_dir = resolve_path(config.get("templateDir", DEFAULT_TEMPLATE_DIR), repo_root)
    template_path = template_dir / template_filename

    if not template_path.is_file():
        available = list_available_templates(template_dir)
        msg = f"Template not found: {template_path}\nAvailable templates:\n"
        msg += "\n".join(f"  - {f}" for f in available) if available else "  (none)"
        raise FileNotFoundError(msg)

    # 输出路径
    date_str = config.get("date", datetime.now().strftime("%m%d"))
    output_dir_str = config.get("outputDir", DEFAULT_OUTPUT_DIR).format(date=date_str)
    output_path = resolve_path(output_dir_str, repo_root) / template_filename

    # 读取模板表头
    header = read_header(template_path)

    # fieldDefaults 与 cases
    field_defaults = config.get("fieldDefaults", {})
    cases = load_cases(resolve_path(config.get("casesFile", ""), skill_root))

    if not cases:
        print("Warning: cases list is empty, no rows to append.", file=sys.stderr)
        return output_path, 0, False

    is_new = not output_path.exists()

    if is_new:
        # 首次：只写表头（复用模板表头），不复制模板数据行
        output_path.parent.mkdir(parents=True, exist_ok=True)
        with output_path.open("w", encoding="utf-8-sig", newline="") as f:
            writer = csv.writer(f)
            writer.writerow(header)
        print(f"Created {output_path} (header from {template_path}, template data rows excluded)")

    # 读取已有行（首次：仅表头，无数据行）
    existing_rows = read_existing_rows(output_path) if output_path.exists() else []

    # 构建 UI 行
    new_rows = build_ui_rows(header, field_defaults, cases)

    # 追加写入
    with output_path.open("a", encoding="utf-8-sig", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=header, extrasaction="ignore")
        writer.writerows(new_rows)

    return output_path, len(new_rows), is_new


def main() -> int:
    parser = argparse.ArgumentParser(description="追加 UI 用例到问题单 CSV")
    parser.add_argument("--domain", required=True, help="领域标识（如 role/menu/tenant）")
    parser.add_argument("--date", default="", help="日期 MMDD（默认当天）")
    parser.add_argument(
        "--cases",
        required=True,
        help="cases.json 路径（相对 skill 根或绝对路径）",
    )
    parser.add_argument("--output-dir", default="", help="覆盖 outputDir（可选）")
    parser.add_argument(
        "--repo-root",
        default="../../..",
        help="仓库根相对路径（相对 skill 根），默认 ../../..",
    )
    parser.add_argument(
        "--overrides-json",
        default="{}",
        help='fieldDefaults 覆盖 JSON，如 \'{"创建人员":"张三"}\'',
    )
    args = parser.parse_args()

    date = args.date or datetime.now().strftime("%m%d")
    overrides = json.loads(args.overrides_json) if args.overrides_json else {}

    config = {
        "domain": args.domain,
        "date": date,
        "casesFile": args.cases,
        "repoRoot": args.repo_root,
        "fieldDefaults": {
            "标签": "1",
            "执行方式": "4",
            "最新结果": "0",
            "创建人员": "惠岩",
            "用例等级": "0",
            "用例类型": "0",
            "子系统": "8",
            "模块名": "",
            "develop结果": "0",
            "功能集合": "",
            "用例ID": "",
        },
    }
    if args.output_dir:
        config["outputDir"] = args.output_dir
    config["fieldDefaults"].update(overrides)

    # 模块名自动映射：domain→模块名（与 domain-template-map.md 同步）
    DOMAIN_MODULE_NAME_MAP = {
        "role": "角色管理",
        "menu": "菜单管理",
        "tenant": "租户管理",
        "user": "用户管理",
        "e2e": "端到端测试",
        "login": "登录登出",
        "required": "必填字段",
    }
    if not config["fieldDefaults"].get("模块名") and args.domain in DOMAIN_MODULE_NAME_MAP:
        config["fieldDefaults"]["模块名"] = DOMAIN_MODULE_NAME_MAP[args.domain]

    try:
        out_path, count, is_new = append(config, SKILL_ROOT)
        mode = "new (from template)" if is_new else "append"
        print(f"Wrote {count} UI rows ({mode}) to {out_path}")
        return 0
    except (ValueError, FileNotFoundError) as e:
        print(f"Error: {e}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
