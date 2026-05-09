# 路由-选择功能子skill

这个节点负责单次 router，只回答“当前这一步最应该进入哪个功能 skill”。

## frontmatter 模式

本节点采用“本地中文模式”：

- `name` 使用中文 skill 名
- `description` 使用中文触发描述

## 节点定位

- 属于 `intention-skills/`
- 只做单次功能路由
- 不负责总方案、多方案比较或大策略判断

## 与分析链路的关系

本节点不再假设用户总能说清当前差哪项能力。

- gap 明确时，直接路由
- gap 不明确但仍停留在“当前一步选哪个功能 skill”这一层时，可先借助 `[[../分析-i18n链路]]` 的输出

## 输出重点

- `selectedFeatureSkill`
- `whyThisFeatureSkill`
- `whyNotOtherFeatureSkills`
- `analysisUsed`
- `analysisGapsRemaining`

## 模板定位

本节点属于轻量 router skill，本身不承载源码提交级 before/after 语义。真正的源码改造对照交给各个 `feature-skills/` 节点维护。

## 使用示例

```text
我只想知道当前这一步该进哪个功能 skill，不需要总方案。
```

```text
现在看起来像 locale JSON、模板消费或 TS 运行时问题，帮我选一个最优先的功能节点。
```

```text
如果这个问题其实已经超出单次路由范围，也请告诉我该回退到哪个意图 skill。
```

## 边界提醒

- 如果用户需要多个方案比较，应优先进入 `[[../编排-i18n迁移]]`
- 如果用户还不能确认当前链路是否已有旧 runtime，应先消费 `[[../分析-i18n链路]]`
- 如果用户已经明确是“新增新 i18n 阶段”的整体顺序，应优先进入 `[[../策略-新增新i18n]]`
