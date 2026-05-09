---
name: 编排-i18n迁移
description: 当需要比较多个 i18n 迁移方案、评估改动面与前后链路，并在链路事实充分后给出推荐路径时使用。
---

# 编排-i18n迁移

## RED

- 没有本节点时，agent 容易把“多方案比较”错误压成单条执行路径
- 也容易在链路事实不足时直接推荐某个策略，跳过分析前置
- 常见失败是：
  - 只有推荐，没有备选方案
  - 只有功能序列，没有前后链路和改动面
  - 把单次功能路由误写成总编排

## GREEN

- 本节点负责候选方案矩阵，而不是顶层会话路由
- 在事实不足时，必须先消费 `[[../分析-i18n链路]]`
- 输出必须同时约束：
  - `candidatePlans`
  - `recommendedPlan`
  - `analysisBasis`
  - `changeSurfaceDetails`
  - `featureSkillSequence`

## REFACTOR

- 若只剩 1 条路径，不要伪装成“多方案比较”，应回退到策略或功能路由节点
- 若方案没有 `analysisBasis`，优先补分析前置而不是补文案
- 若用户其实只想知道当前一步选哪个功能节点，回退到 `[[../路由-选择功能子skill]]`

## 作用

这个节点负责总方案编排，而不是顶层会话路由。

适用于：

- 需要比较多个候选方案
- 需要说明改动面大小、前后链路、功能序列与推荐理由
- 当前仓库状态复杂，无法只靠单个策略节点完成推荐

## 分析前置

在输出方案矩阵前，必须先判断链路事实是否足够。

输入契约新增：

- `chainAnalysisAvailable`
- `chainAnalysisSource`
- `analysisConfidence`

若事实不足：

1. 先消费 `[[../分析-i18n链路]]`
2. 再产出候选方案矩阵

## 输出契约

- `planningGoal`
- `candidatePlans`
- `recommendedPlan`
- `whyRecommended`
- `rejectedPlans`
- `sharedPreconditions`
- `verificationStrategy`
- `stopCondition`

每个 `candidatePlan` 必须至少包含：

- `planId`
- `planSummary`
- `intentionPath`
- `featureSkillSequence`
- `changeSurfaceSize`
- `changeSurfaceDetails`
- `beforeChain`
- `afterChain`
- `analysisBasis`
- `verificationPoints`
- `rollbackShape`
- `risks`
- `recommendedFor`
- `notRecommendedFor`

## Workflow

1. 判断链路事实是否足够
2. 若不足，先调用或引用 `[[../分析-i18n链路]]`
3. 列出 1 到 3 个候选方案
4. 对比改动面、前后链路、功能序列、风险与验证点
5. 给出推荐方案与排除理由

## Guardrails

- 不允许在事实不足时直接产出推荐方案
- 不允许只给一条执行路径，却称之为“多方案比较”
- 不允许方案没有 `analysisBasis`
- 不允许把单次功能路由伪装成总编排

## 使用示例

```text
给我多个迁移方案，并比较每种方案的改动面和风险。
```

```text
我需要一份推荐方案，说明为什么不是其他路径。
```

```text
当前链路不明，但我还是要总编排，请先补分析再出方案矩阵。
```

```text
我想比较先退化再新增和带中间态收敛，但当前事实不够，先分析后再给我方案矩阵。
```
