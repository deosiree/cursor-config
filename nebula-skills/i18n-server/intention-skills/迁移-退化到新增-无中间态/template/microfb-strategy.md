# microfb Strategy

## Current Recommendation

对于 `microfb`，当前推荐顺序是：

1. `分析-i18n链路`
2. `迁移-退化->新增(无中间态)`
3. `旧i18n-硬切静态化`
4. 验证当前开发环境正常
5. `策略-新增新i18n`
6. `路由-选择功能子skill` 或直接进入新增阶段的功能 skill 序列

## Why

- `microfb` 当前旧链路里有 runtime/store 双写
- 非组件层直接依赖 `i18n.global.t`
- 旧语言包结构和新方案差异不小
- 先退化，再进入新增新 i18n，风险更可控
