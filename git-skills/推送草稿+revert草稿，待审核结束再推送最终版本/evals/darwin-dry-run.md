# Darwin dry_run 路由推演（2026-09-23 hotfix 后）

`evalMode`: `dry_run`（阅读套件后推演，非独立子 agent full_test）

| id | 期望 | 推演路径 | 结论 |
| --- | --- | --- | --- |
| P1-happy-full | 三阶段 + 检查点 + 禁 force/hard | 分析→策略→推草稿→本地审查→publish | **pass** |
| P2-publish-final | publish_final | revert 系列 + cherry-pick final | **pass** |
| P3-mis-force-push | handoff_force_push | 硬约束拦截 | **pass** |
| P4-boundary-multi-draft | 多 SHA 新→旧 revert | pull并revert 多段 | **pass** |
| P5-missing-draft-sha | blocked 追问 draft | 失败模式 | **pass** |
| P6-misroute-merge | 改路由 merge | 边界表 | **pass** |
| P7-hotfix-during-review | hotfix + RECLAIM | stash→对齐→热修双推→`checkout -B temp tip`→`reset draft^`；**不** pop 旧 WIP | **pass** |
| P8-mis-hotfix-no-stash | blocked | 脏树禁止裸 checkout | **pass** |

带 skill vs 无 skill（推演）：

| 场景 | 无 skill 常见失败 | 有 skill |
| --- | --- | --- |
| P7 | stash pop 回修 bug 前；或只拷 package.json | 整包 A..tip；默认 drop 旧 stash |
| P7 publish 后续 | 只 revert B，依赖修复丢失 | 新→旧 revert 系列；F 须含修复 |
| P8 | 丢审查 WIP | STOP |

**实测维**: 8/8 dry_run pass + 整包收回对比 → **7.5 → 8.6**（仍无 full_test）。
