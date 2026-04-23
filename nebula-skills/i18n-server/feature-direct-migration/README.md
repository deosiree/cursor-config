# Feature Direct Migration

用于在 `feature-strategy` 判断“可以一步到位”时，直接从旧链路迁到新链路。

这个 skill 不等于 `feature-migration`。它要同时处理两类工作：

- 清理旧链路中不会被新链路继续消费的部分
- 接入新链路中的新 runtime、新资产结构、新消费边界

## 适用场景

- `feature-analysis` 已完成。
- `feature-strategy` 明确判断当前项目适合一步到位。
- 旧链路与新链路重叠较高，拆成“先退化再迁移”反而增加中间态成本。

## 输入

- `feature-analysis` 输出的旧链路分析。
- `feature-strategy` 输出的一步到位结论。
- docs 中的新 i18n 方案文档。
- 目标仓库源码。

## 输出

- 旧链路裁剪清单。
- 新链路接入方案。
- 一步到位迁移顺序。
- 风险与回滚点。
- `microfb` 或其他仓库的一步到位模板。

## 与其他 skill 的关系

- `feature-analysis` 是前置。
- `feature-strategy` 决定是否使用本 skill。
- 当使用本 skill 时，不再先执行 `feature-deprecation`。
- `feature-migration` 只服务“两步走”场景，不服务一步到位。

## 模板说明

`template` 下提供：

- 直迁计划模板。
- 旧链路裁剪与新链路接入的组合模板。
- `microfb` 的一步到位策略示例。
