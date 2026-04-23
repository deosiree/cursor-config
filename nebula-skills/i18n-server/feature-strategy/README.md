# Feature Strategy

用于在完成旧链路分析后，对比“当前 i18n 链路”和“docs 中的新 i18n 链路”，判断项目更适合：

- 先退化，再迁移
- 直接一步到位迁移

## 适用场景

- 已经有 `feature-analysis` 输出，知道旧链路是什么。
- 已经有 docs 中的新 i18n 目标方案。
- 需要在真正动手之前，做一次工程策略判断，而不是默认拆成两步。

## 输入

- `feature-analysis` 产出的旧链路分析文档。
- `docs` 中的新 i18n 方案文档。
- 目标仓库现状，例如 `microfb`。

## 输出

- 当前链路说明。
- 新链路说明。
- 两条链路的重叠与交叉点。
- 差异清单与风险清单。
- 迁移策略建议：两步走或一步到位。
- 给 `feature-deprecation` / `feature-migration` 的执行建议。

## 与其他 skill 的关系

- `feature-analysis` 负责讲清旧链路。
- 本 skill 负责比较旧链路与新链路，并做迁移策略判断。
- 如果结论是“两步走”，再执行 `feature-deprecation` 和 `feature-migration`。
- 如果结论是“一步到位”，则执行 `feature-direct-migration`，而不是复用 `feature-migration`。

## 模板说明

`template` 下提供：

- 对比分析模板。
- 策略决策模板。
- `microfb` 的示例决策文档。
