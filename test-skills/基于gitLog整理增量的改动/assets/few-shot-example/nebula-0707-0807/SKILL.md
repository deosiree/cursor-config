# Few-shot：Nebula 惠岩 0707-0807 gitLog 整理

本目录为**内嵌黄金样本**，skill 可脱离 Nebula 仓独立演示。禁止引用仓外 `humanDocs` 路径。

## before（RED）

`before/RED-baseline.md` — 14 域名级问题根反例。

## after（GREEN）

| 文件 | 说明 |
| --- | --- |
| `after/commits_raw.json` | 106 提交中间 JSON |
| `after/0707-0807.xlsx` | 邻接表 Excel |
| `after/acceptance.md` | 验收数字 |
| `after/extract_commits.py` | 抽取脚本快照 |
| `after/build_excel.py` | 主题聚类脚本快照 |

## 关键决策

1. 问题根 = **主题键**（创建租户流程、查写二分…），域名只做列
2. 全部提交收录，仅排除 Merge；非主域不删行
3. 子问题仅 `route-auth` / `secret-input` 两组
4. 产出落盘 `humanDocs/自测单/gitLog`（运行时），非 harness `docs/`
