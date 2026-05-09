# few-shot 示例：apex_dev 会话浓缩版

这个示例不单独再造一个 `apex_dev` skill 套件，而是把高价值会话压缩成可复用的 few-shot，供顶层父 agent、`分析-i18n链路`、`编排-i18n迁移` 和 `路由-选择功能子skill` 在多轮状态判断时引用。

## 示例覆盖

1. 判断当前模块是硬编码、旧 runtime 还是新 runtime 未收口
2. 旧链路退化，但保留新接缝入口
3. 新 `src/i18n` 结构接入与 `locales/*.json` 收口
4. `transfer` 组件清理本地 translations 映射
5. `formRules.ts` 从静态规则数组改为 `createXxxRules(t)`
6. 动态校验改为 `createConfirmPasswordRules(t, getPassword)`
7. `lang store` / `qiankun/actions.ts` / `utils/i18n.ts` 收口

## analysis-first 索引

- `analysis-first-then-plan`
  - 用户不知道当前链路，但要总方案；先走 `分析-i18n链路`，再进入 `编排-i18n迁移`
- `analysis-first-then-route`
  - 用户只说“下一步改什么”，gap 不明确；先走 `分析-i18n链路`，再进入 `路由-选择功能子skill`
- `analysis-first-then-strategy`
  - 用户以为自己已经能选迁移策略，但事实不足；先走 `分析-i18n链路`，再进入对应迁移/新增策略

对应独立 few-shot：

- `[[analysis-first-then-plan.md]]`
- `[[analysis-first-then-route.md]]`
- `[[analysis-first-then-strategy.md]]`

## 对应 skill 映射

- 退化：`旧i18n-硬切静态化`
- 单次功能路由：`路由-选择功能子skill`
- locale JSON：`新i18n-补充翻译json`
- 模板与组件：`新i18n-Vue模板中使用$t()`
- 表单规则：`新i18n-动态拼接：业务层回调t到函数定义`
- 动态文本：`新i18n-动态拼接：业务层回调t到函数定义`
- 迁移期接缝：`迁移i18n-壳层接缝保留`

## 关键结论

- `trans()` 不是最终翻译；需要展示时必须回到 `t()`
- 规则工厂可集中定义，但导出规则集不能在模块加载时冻结文案
- 动态文本与动态校验最稳的方案是业务层回调 `t`
- 旧 runtime 下线后，允许保留新语言入口、`qiankun language` 协议和 locale 资产

## 使用建议

- 当根层需要证明自己不是一次性 router，而是会先分析再分流时，优先引用这 3 个 `analysis-first` few-shot
- 当用户请求已经非常明确，不需要分析前置时，直接使用根 `README.md` 与对应意图层节点的使用示例即可
