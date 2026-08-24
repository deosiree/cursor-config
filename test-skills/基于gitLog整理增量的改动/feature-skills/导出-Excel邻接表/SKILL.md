---
name: 导出-Excel邻接表
description: 中文三 Sheet xlsx；openpyxl。
---

# Feature：导出 Excel 邻接表

## 何时使用

- `策略-整理gitLog增量` 步骤 4（extract 之后）
- raw 或 theme/domain config 变更后

## 何时不要使用

- raw json 不存在（先 extract）
- 跳过 verify 直接宣称完成

## 命令

```bash
pip install openpyxl
python scripts/build_excel.py --config configs/{profile}.config.json
```

## 规格

见 `references/excel-output-spec.md`

## 输出

`{outDir}/{xlsxName}` — 节点表、域名字典、使用说明

## 失败模式（HL-2）

| 触发条件 | 一线修复 | 仍失败兜底 |
| --- | --- | --- |
| 缺 openpyxl | `pip install openpyxl` | 不手工拼 xlsx |
| xlsx 被占用 | 关 Excel 或改 `xlsxName` | `_verify-live.xlsx` 旁路 |
| 节点数异常 | 对照 list_commits | 查 cluster_key 顺序 |

## 调试

`python scripts/list_commits.py --config ...`

## 验收

导出后立即 → `feature-skills/质量-输出验收/SKILL.md`
