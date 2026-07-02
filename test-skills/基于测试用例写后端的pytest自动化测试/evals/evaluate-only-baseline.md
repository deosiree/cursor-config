# Darwin 100 分制评分（本 skill 专用）

> 与 [[darwin-skill]] 9 维 rubric 对齐；`总分 = Σ(维度分×权重)/10`

## 维度权重

| # | 维度 | 权重 |
|---|------|------|
| 1 | Frontmatter | 7 |
| 2 | 工作流清晰度 | 12 |
| 3 | 失败模式编码 | 12 |
| 4 | 检查点设计 | 6 |
| 5 | 可执行具体性 | 17 |
| 6 | 资源整合度 | 4 |
| 7 | 整体架构 | 12 |
| 8 | 实测表现 | 23 |
| 9 | 反例黑名单 | 6 |

## Round 5 明细（87.6/100）

| # | 维度 | 分(1-10) | 加权 |
|---|------|--------:|-----:|
| 1 | Frontmatter | 9 | 6.3 |
| 2 | 工作流清晰度 | 8 | 9.6 |
| 3 | 失败模式编码 | 8 | 9.6 |
| 4 | 检查点设计 | 8 | 4.8 |
| 5 | 可执行具体性 | 9 | 15.3 |
| 6 | 资源整合度 | 9 | 3.6 |
| 7 | 整体架构 | 8 | 9.6 |
| 8 | 实测表现 | 8 | 18.4 |
| 9 | 反例黑名单 | 9 | 5.4 |

**总分：87.6 / 100**

## Round 6 明细（89.2/100 · 可观测性沉淀后再评）

| # | 维度 | 分(1-10) | 加权 | vs R5 |
|---|------|--------:|-----:|-------|
| 1 | Frontmatter | 9 | 6.3 | — |
| 2 | 工作流清晰度 | 8 | 9.6 | — |
| 3 | 失败模式编码 | 9 | 10.8 | +1.2 |
| 4 | 检查点设计 | 8 | 4.8 | — |
| 5 | 可执行具体性 | 9 | 15.3 | — |
| 6 | 资源整合度 | 10 | 4.0 | +0.4 |
| 7 | 整体架构 | 8 | 9.6 | — |
| 8 | 实测表现 | 8 | 18.4 | — |
| 9 | 反例黑名单 | 9 | 5.4 | — |

**总分：89.2 / 100**（Δ=+1.6，非 hill-climbing 轮；为 plan 落地后再评）

## HL-4 判定

| Round | 总分 | Δ |
|------:|-----:|--:|
| 0 | 72.0 | — |
| 1 | 78.5 | +6.5 |
| 2 | 82.8 | +4.3 |
| 3 | 86.2 | +3.4 |
| 4 | 87.1 | +0.9 |
| 5 | 87.6 | +0.5 |
| 6 | 89.2 | +1.6 |

Round 4–5 连续 Δ < 2 → **HL-4 触顶**（Round 5 已满足停止条件）  
Round 6 为可观测性 plan 落地后再评，**不启动新一轮 hill-climbing**

## 与 14 分制关系

`evals/evaluate-only-baseline.md` 的 14 分制用于 **hytests 产物** 验收；100 分制用于 **skill 文档** Darwin 优化。二者互补，不混用总分。

---

## 附录：hytests 产物 16 分制（feature 质量-覆盖率自检）

| 维度 | 2 分 | 0 分 |
|------|------|------|
| CSV 映射 | marker + registry | 缺 marker |
| pytest 可运行 | node 可 collect | 语法/路径错误 |
| README 格式 | 无 HTML；H4–H6；JSON 顶格 | details 或 text 块 |
| 实现位置 | `#L` + pytest node | 缺表 |
| 步骤解析 | POST→列表+json | text 整块 |
| 覆盖率报告 | csv_coverage 一致 | 未跑 |
| 边界清晰 | 未误写 tests/ 替代 | CSV 只进 tests |
| **可观测性 G6** | implemented 有 case_report + latest.log | 缺 case_report 或无 log |
| **automation_doc** | 复杂用例含 Mermaid+断言表 | 仅实现位置无展开 |

**通过线**：≥14/16 keep；<12 revert → few-shot AFTER

> 原 14 分制于 2026-07 扩展为 16 分制（+G6 +automation_doc），旧记录可对照上表前两列仍适用。

## Round 6 备注（可观测性沉淀）

- 新增 `references/case-report-terminal-spec.md`、`hytests-api-pitfalls.md`
- 新增 `feature-skills/接入-用例验证摘要与中文终端`
- G6 强制：implemented 必须 case_report
- 产物验收扩展为 16 分制

## 日志

[[darwin-results.tsv]] · [[dry-run-evaluation.md]] · [[final-report.md]]
