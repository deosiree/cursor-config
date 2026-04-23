# Feature Analysis

用于在退化或迁移任何仓库的 i18n 方案之前，先还原该仓库“当前 i18n 是如何工作的”。

## 适用场景

- 仓库已存在一套 i18n 方案，但链路分散在 `runtime`、`store`、`router`、`utils`、`components` 中。
- 退化或迁移前需要先把旧链路讲清楚，避免凭经验改坏。
- 需要把当前方案沉淀成时序图，并标注变量、函数、文件在源码中的落点。

## 输入

- 目标仓库源码。
- i18n 相关入口文件、语言包、store、组件、路由 helper。
- 参考文档：`sequenceDiagram.md`。

## 输出

- 当前 i18n 链路说明文档。
- 至少一张 `sequenceDiagram`，描述核心链路。
- 参与者、变量、函数、文件的源码落点表。
- 风险点与退化/迁移前置约束。

## 与其他 skill 的关系

- `feature-analysis` 是 `feature-deprecation` 的前置 skill。
- `feature-analysis` 也是 `feature-migration` 的前置输入。
- 没有明确旧链路，不允许直接执行退化或迁移。

## 模板说明

`template` 下提供：

- 通用时序图模板。
- 通用源码落点模板。
- `microfb` 的 i18n 现状分析示例。
