# intention / feature 拆层矩阵示例

- `before`: 平铺子skill，意图判断与功能落地混在一起
- `after`: `intention-skills/` 负责判断，`feature-skills/` 负责落地
- `intentionExamples`:
  - `分析-i18n链路`
  - `策略-新增新i18n`
- `featureExamples`:
  - `新i18n-样板代码`
  - `旧i18n-硬切静态化`
- `realCaseSource`: `i18n-server`
