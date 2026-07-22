# few-shot：t-cloud 菜单导出扫描（2026-07-15 会话）

## 场景

用户导出多项目菜单 YAML 至 `docs/menu/t-cloud/`，要求对照《菜单管理校验规则》做只读扫描（不以本地 seccenter perm 全表唯一为准）。

## 动作

1. 本 skill `scripts/convert-menu-yaml-to-json.py` → `_scan_json/`
2. 分文件 `node scripts/scan-menu-rules.mjs --input ...`
3. 再扫 `_all.json`
4. 扫描脚本不落在 `apex_dev`

## 结果（文档口径；历史会话曾用旧码 `page.combo`，现统一为 `route.combo`）

| 范围 | 结果 |
|------|------|
| platform / xxxproject / test / test_data（单文件） | **0** 违规 |
| 合并 `_all` | 大量 `route.combo`（几乎全是 platform↔xxxproject 克隆；另含 test↔test_data `/testpage`；含 directory 跨项目同 path 空 params） |

## 决策话术（正确）

- 单项目合规：看分文件 → 本批通过。
- 跨页复用同一 perm：文档允许（非同级），不要报 `perm.global`。
- 删克隆项目：可清掉绝大部分合并 `route.combo`，仍余真实跨项目冲突对。
- 勿把跨项目 combo 当成单项目脏数据去改 platform。

## 反例（错误）

- 用 seccenter `validatePerm` 全表唯一扫出 96 条后，要求拆分所有跨页 perm。
- 未转 YAML、直接扫 snake_case 字段导致假通过/假失败。
- 继续输出旧码 `page.combo`。
