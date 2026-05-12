# Few-shot Index

新i18n-纯ts中用i18n.global.t 的每个 few-shot 都对应一次真实成功提交。

## 来源列表

- `opsdeck-453b4aa`：仓库 `opsdeck`，提交 `453b4aa790aef84c915ae2b5ec4535b4f842254f`，侧重点：纯 TS 文件直接使用全局 i18n 实例
- `microfb-8890d7c`：仓库 `microfb`，提交 `8890d7c5f551004a05801ce4f628480ee4b2635a`，侧重点：`formRules.ts` 先通过 `i18n.global.t` 生成校验文案，组件 `computed rules` 再显式订阅 `locale`
