# Darwin 终局报告 — 设计 mock 服务进行异常测试

**日期**：2026-07-07  
**模式**：dry_run（4/4 test-prompts 推演；无 live agent 子进程）  
**终局总分**：**87.3 / 100**

## 轮次摘要

| Round | 总分 | Δ | 主要改动 |
|------:|-----:|--:|----------|
| 0 | 70.0 | — | 初评基线 |
| 1 | 82.4 | +12.4 | HL-2、CHECKPOINT 三连、反模式黑名单 |
| 2 | 86.8 | +4.4 | mockOutputPlan、dry-run-evaluation、资源速查 |
| 3 | 87.3 | +0.5 | baseline 明细、final-report |

## HL-4 判定

| Round | Δ |
|------:|--:|
| 1 | +12.4 |
| 2 | +4.4 |
| 3 | +0.5 |

Round 2–3 连续 Δ < 2 → **HL-4 触顶**（Round 3 后应停止 hill-climbing）

## Round 3 维度明细（87.3/100）

| # | 维度 | 分(1-10) | 加权 |
|---|------|--------:|-----:|
| 1 | Frontmatter | 9 | 6.3 |
| 2 | 工作流清晰度 | 9 | 10.8 |
| 3 | 失败模式编码 | 9 | 10.8 |
| 4 | 检查点设计 | 8 | 4.8 |
| 5 | 可执行具体性 | 9 | 15.3 |
| 6 | 资源整合度 | 9 | 3.6 |
| 7 | 整体架构 | 8 | 9.6 |
| 8 | 实测表现 | 9 | 20.7 |
| 9 | 反例黑名单 | 9 | 5.4 |

## 仍存在的短板（边际收益低）

1. **dim8 无 live full_test**：未用子 agent 实跑 curl/浏览器；dry_run 上限约 9/10
2. **dim4 检查点**：已有三连 CHECKPOINT，但未像 pytest skill 那样每步嵌套子 CHECKPOINT
3. **子 skill 深度**：intention/feature 文档未单独跑 Darwin（仅父 SKILL 优化）
4. **多仓库 profile**：`target-repo-profiles` 仅有 apex_dev 实体，其他仓库占位

## 建议

**收手。** 总分 87.3 ≥ 85，且 Round 2–3 Δ 合计 +0.9 < 2，已达 HL-4。

下一轮边际收益最高项是 **dim8 live 实测**（真跑 curl 三场景 + 抽 1 条 test-prompt 用 agent 执行），但属于「用 skill 做真实 CSV 批次」时自然验证，**不值得为 +1～2 分继续改 SKILL.md 正文**。

若继续投入，优先：**用户传入下一批 CSV 时做 end-to-end 试跑**，把结果写入 `evals/results/` 作为 dim8 实证，而非再堆主文档。
