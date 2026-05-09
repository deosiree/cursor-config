# 国际化迁移路由模板

| 症状 | 优先意图 skill | 分析是否前置 | 后续节点 | 备注 |
| --- | --- | --- | --- | --- |
| 不清楚旧链路怎么跑 | `[[intention-skills/分析-i18n链路]]` | 必须 | `[[intention-skills/编排-i18n迁移]]` / 迁移类策略 | 先还原事实 |
| 需要总方案、改动面对比、推荐路径 | `[[intention-skills/编排-i18n迁移]]` | 事实不足时必须 | 按方案进入 `feature-skills/` | 先方案后执行 |
| 旧 runtime 还在运行且复杂度高 | `[[intention-skills/迁移-退化到新增-无中间态]]` | 事实不足时必须 | `[[feature-skills/旧i18n-硬切静态化]]` -> `[[intention-skills/策略-新增新i18n]]` | 先退化再新增 |
| 允许保留中间态逐步收口 | `[[intention-skills/迁移-收敛旧到新-有中间态]]` | 事实不足时必须 | 直接进入若干 `feature-skills/` | 边收敛边迁移 |
| 已无旧 i18n，只需接新方案 | `[[intention-skills/策略-新增新i18n]]` | 可跳过 | `[[intention-skills/路由-选择功能子skill]]` 或直接功能序列 | 新增阶段 |
| 不知道当前一步该选哪个功能 skill | `[[intention-skills/路由-选择功能子skill]]` | gap 不明确时必须 | 单个 `feature-skill` | 单次 router |
