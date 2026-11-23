# Darwin 最终报告 · revert_and_reclaim 后（HL-4）

> `mode`: optimize（逐轮单维）  
> `evalMode`: `dry_run`  
> `date`: 2026-09-29  
> `darwinIntegrationMode`: `write-skill/darwin质量评估与迭代`（外部 darwin-skill 未找到，降级闭环）  
> 相对旧 HL-4（87.8 / hotfix）已增 `revert_and_reclaim`，**重新基线**  
> 轨迹：[[darwin-r0-baseline-20260929-reclaim.md]] · [[darwin-r1-workflow-20260929.md]] · [[darwin-r2-boundary-20260929.md]] · [[darwin-r3-specificity-20260929.md]] · [[darwin-dry-run.md]]  
> 旧终态备份：[[bak-20260929-darwin-reclaim/darwin-hl4-final-pre-reclaim-87.8.md]]

## 轮次轨迹

| 轮次 | 维度 | 旧总分 | 新总分 | Δ | 判定 |
| --- | --- | ---: | ---: | ---: | --- |
| R0 baseline | — | — | 84.7 | — | baseline |
| R1 | 工作流清晰度 | 84.7 | 85.9 | +1.2 | keep |
| R2 | 边界条件覆盖 | 85.9 | 86.5 | +0.6 | keep |
| R3 | 指令具体性 | 86.5 | 87.4 | +0.9 | keep |

## 最终 8 维（R3 后）

总分 = Σ(维度分 × 权重) / 10。

| 维度 | 权重 | 分 | 加权 | 备注 |
| --- | ---: | ---: | ---: | --- |
| Frontmatter 质量 | 8 | 8.8 | 7.0 | 含 revert_and_reclaim 触发 |
| 工作流清晰度 | 15 | 8.8 | 13.2 | R1 三易混对照 |
| 边界条件覆盖 | 10 | 8.8 | 8.8 | R2 midstream 失败模式 |
| 检查点设计 | 7 | 9.0 | 6.3 | 含 REVERT-PUSH |
| 指令具体性 | 15 | 9.0 | 13.5 | R3 alreadyReverted 命令 |
| 资源整合度 | 5 | 9.0 | 4.5 | refs/evals 齐 |
| 整体架构 | 15 | **8.5** | 12.8 | **并列最低**；父级偏厚 |
| 实测表现 | 25 | **8.5** | 21.3 | dry_run 10/10；无 full_test |
| **总分** | | | **87.4** | |

## dry_run 终态

| id | 结论 |
| --- | --- |
| P1–P8 | pass |
| P9-revert-and-reclaim | pass（先 reclaim 再推 revert:，不上 F） |
| P10-publish-after-midstream-revert | pass（跳过重复 revert） |

## HL-4 拐点判定

| 信号 | 结果 |
| --- | :---: |
| 总分 ≥ 85/100 | ✅ 87.4 |
| 连续 2 轮提升 ≤ 3 分 | ✅ R2 +0.6、R3 +0.9 |
| 最低维无显著塌陷 | ✅ 架构/实测 8.5 ↔ 次低多项 8.8，差距 <1 |
| 下一跳高成本 | ✅ full_test 或父级大瘦身 |

**结论：已达到 HL-4 拐点。**

## 最值得优化的剩余点

| 排名 | 方向 | 预期收益 | 成本 | 现在做？ |
| :---: | --- | :---: | :---: | :---: |
| 1 | **full_test**：沙盒真实 git 跑 P9/P10（先 reclaim 再 push revert: / alreadyReverted） | 实测 8.5→9.0+（约 +1~2 总分） | 高 | 否 |
| 2 | **父级瘦身**：输出样例/口令下沉编排，压架构 8.5→9.0 | +0.5~0.8 | 中 | 否 |
| 3 | Frontmatter 再收紧 description 长度 | +0.1~0.3 | 低 | 否 |

## 建议

**建议收手。** `revert_and_reclaim` 主路径、三易混对照与 midstream 失败模式已落地；R2/R3 边际仅 +0.6 / +0.9。继续改文案收益低于 full_test 成本，且最大缺口在实测环境而非流程语义。
