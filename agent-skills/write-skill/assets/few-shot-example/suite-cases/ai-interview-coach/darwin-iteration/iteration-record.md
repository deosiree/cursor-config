# ai-interview-coach Darwin 迭代记录

> 4 轮 hill-climbing，从 69.8 → 85.6

## 轮次速览

| 轮次 | 前分 → 后分 | Δ | 关键改动 |
|------|-------------|---|---------|
| Baseline | — → 69.8 | — | 初始干燥评估 |
| R1 fallback+checkpoint+antipattern | 69.8 → 83.9 | **+14.1** | 加 `🛟` fallback 树 + `🔴` CHECKPOINT + `🚫` 反模式 |
| R2 面经沉淀+自我迭代子skill | 83.9 → 86.0 | +2.1 | 新增 4 个子 skill（沉淀/写入/诊断/设计） |
| R3 重评触顶 | 83.5 → 84.0 | -0.5* | 结构调整后微调 |
| R4 软话清理+evals | 84.0 → 85.6 | +1.6 | 清理 6 处软话 + 4 组 evals + 6 条 full_test |
| **拐点** | **R2→R4 连续 Δ<2** | **break** | |

## 达成的优化项

- `🛟` 失败模式与 fallback 树（7 行 × 3 列三段式）
- `🔴` CHECKPOINT · 关键决策点表（5 行）
- `🚫` 反模式表（面经沉淀 + Darwin 评估各 1 张）
- 面经沉淀流程（检测 → 人类回环 → 写入）
- Darwin 自我迭代机制（诊断 → 草图 → 人类回环 → 创建）
- 全子 skill evals + 14 条测试 prompt

## ⚠️ 注意

此案例的 Darwin 迭代全为 **dry_run**。进一步提质需要 **full_test**（真实用户测试），这也是 write-skill 的 `Darwin-集成评估闭环` 标注的内部简化闭环典型退化场景。
