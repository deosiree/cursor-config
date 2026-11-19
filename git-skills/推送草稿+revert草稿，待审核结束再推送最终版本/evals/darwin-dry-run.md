# Darwin dry_run 路由推演（含 revert_and_reclaim）

`evalMode`: `dry_run`（阅读套件后推演，非独立子 agent full_test）

| id | 期望 | 推演路径 | 结论 |
| --- | --- | --- | --- |
| P1-happy-full | 多阶段 + 检查点 + 禁 force/hard | 分析→策略→推草稿→本地审查→publish | **pass** |
| P2-publish-final | publish_final | revert 系列 + cherry-pick final | **pass** |
| P3-mis-force-push | handoff_force_push | 硬约束拦截 | **pass** |
| P4-boundary-multi-draft | 多 SHA 新→旧 revert | pull并revert 多段 | **pass** |
| P5-missing-draft-sha | blocked 追问 draft | 失败模式 | **pass** |
| P6-misroute-merge | 改路由 merge | 边界表 | **pass** |
| P7-hotfix-during-review | hotfix + RECLAIM | stash→对齐→热修双推→`checkout -B temp tip`→`reset draft^`；**不** pop 旧 WIP | **pass** |
| P8-mis-hotfix-no-stash | blocked | 脏树禁止裸 checkout | **pass** |
| P9-revert-and-reclaim | revert_and_reclaim | 先 reclaim(pre_revert_tip)→`revert --no-commit`→`revert:` commit→双推；**不上 F** | **pass** |
| P10-publish-after-midstream-revert | publish_final 跳过重复 revert | alreadyReverted→cherry-pick F→push | **pass** |

带 skill vs 无 skill（推演）：

| 场景 | 无 skill 常见失败 | 有 skill |
| --- | --- | --- |
| P7 | stash pop 回修 bug 前；或只拷 package.json | 整包 A..tip；默认 drop 旧 stash |
| P9 | force 抹历史；或只本地 reset 远端仍在；或先 revert 再 tip reclaim 空树 | 先 reclaim 再推 `revert:`；保护分支前进式回滚 |
| P10 | 重复 revert 同一系列 | `alreadyReverted` 跳过，只上 F |
| P8 | 丢审查 WIP | STOP |

**实测维（本轮增补）**: 10/10 dry_run pass（含 midstream revert）；未跑 full_test / Darwin 全量 HL-4。
