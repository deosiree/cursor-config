# Darwin R0 Baseline · 推送草稿+revert…（revert_and_reclaim 后）

> `mode`: evaluate-only → optimize  
> `evalMode`: `dry_run`  
> `date`: 2026-09-29  
> `darwinIntegrationMode`: `write-skill/darwin质量评估与迭代`（外部 darwin-skill 路径未找到，降级闭环）  
> `note`: 相对 HL-4（87.8 / hotfix）已增 `revert_and_reclaim`，**重新开基线**  
> 备份：[[bak-20260929-darwin-reclaim/SKILL-R0.md]]

## 失败基线

| 项 | 内容 |
| --- | --- |
| 典型提法 | 推草稿；本地审；热修整包收回；保护分支推 revert: 拿回本地审；再上最终版 |
| 易跳过 | 先 revert 后 tip reclaim；local_review 与 revert_and_reclaim 混淆；publish 重复 revert |
| 误触发 | force；hard reset；脏树裸 checkout |
| 资产缺口 | dry_run 已有 P9/P10，但父级仍易把五阶段串混；`alreadyReverted` 判定未写死 |

## 8 维（0–10）

总分 = Σ(维度分 × 权重) / 10。

| 维度 | 权重 | 分 | 加权 | 依据 |
| --- | ---: | ---: | ---: | --- |
| Frontmatter 质量 | 8 | 8.8 | 7.0 | 含 revert:/整包/热修触发 |
| 工作流清晰度 | 15 | **8.0** | 12.0 | 五阶段易混；缺「一眼对照」 |
| 边界条件覆盖 | 10 | **8.2** | 8.2 | midstream 失败模式未进父级表 |
| 检查点设计 | 7 | 9.0 | 6.3 | 含 REVERT-PUSH |
| 指令具体性 | 15 | **8.4** | 12.6 | 有命令骨架；alreadyReverted 检测步骤虚 |
| 资源整合度 | 5 | 9.0 | 4.5 | refs/evals/编排齐 |
| 整体架构 | 15 | 8.5 | 12.8 | intention/feature；父级偏厚 |
| 实测表现 | 25 | 8.5 | 21.3 | dry_run 10/10 已列；无 full_test |
| **总分** | | | **84.7** | |

## 最弱维度（优化顺序）

1. **工作流清晰度 (8.0)**  
2. **边界条件覆盖 (8.2)**  
3. **指令具体性 (8.4)**  

## nextAction

R1：只改工作流 — 父级/策略增加「三易混 phase」对照，抬清晰度。
