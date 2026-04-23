# Feature Migration

用于把仓库迁移到统一的新国际化方案：`src/i18n + locale JSON + extract config + trans/t helper + language store`。

本 skill 只服务“两步走”场景，即先退化、验证、提交，再迁移。

## 适用场景

- 已经完成旧方案退化，并且当前仓库已经处于“消费侧脱钩、可独立验证”的中间态，或者仓库本来就没有稳定 i18n 方案。
- 需要把所有前端微服务收敛到同一套结构、语言码、抽词命令和消费边界。
- 需要提供一个可扩展到其他仓库的标准模板。

## 输入

- 新国际化设计文档。
- `feature-deprecation` 输出的遗产资产映射。
- `feature-strategy` 输出的策略建议。
- 已脱钩的中间态源码。
- 当前仓库中的组件、路由、常量、枚举、Element Plus locale 需求。

## 不适用场景

- `feature-strategy` 判断应一步到位。
- 需要在同一轮里同时处理旧链路裁剪和新链路接入。
- 这类场景应使用 `feature-direct-migration`。

## 输出

- 新标准目录结构。
- 新 runtime 初始化方式。
- 组件内与非组件文件的调用约定。
- 词条抽取配置与脚本约定。
- `microfb` MVP 模板源码。

## 模板说明

`template` 下提供：

- 迁移计划模板。
- 新目录结构模板。
- `microfb` 迁移后示例源码。
