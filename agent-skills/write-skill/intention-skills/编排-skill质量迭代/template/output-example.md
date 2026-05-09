# Darwin 编排卡片示例

- `darwinIntegrationMode`: `external_bridge`
- `baselinePlan`: 先记录没有该 skill 时的失败基线
- `trialPlan`: 选 2 到 3 个真实 prompt 做受控试跑
- `keepOrRevertRule`: 只有结构更清晰、命中更稳定才保留
- `realCaseSource`: `darwin-skill`
