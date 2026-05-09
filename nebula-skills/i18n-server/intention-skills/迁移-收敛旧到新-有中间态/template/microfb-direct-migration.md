# microfb Direct Migration Note

## Decision

当前 `microfb` 不建议一步到位，因此本文件主要作为反例模板。

## Why It Is Not Recommended For microfb

- 非组件层直接依赖 `i18n.global.t`
- store 与 runtime 存在双写
- 旧语言包格式与新 JSON 词条格式差异明显
- 先退化能显著降低 helper/store/runtime 同改的耦合风险

## When A Similar Repo Could Use Direct Migration

- 组件层是主要改造面
- helper 很少
- store 不双写语言状态
- 语言包与语言码差异很小
