---
name: 迁移-退化->新增(无中间态)
description: 当旧 i18n 负担较重，需要先退化旧链路，再快速进入新增新 i18n 阶段，并且不推荐长期保留中间态时使用。
---

# 迁移-退化->新增(无中间态)

## RED

- 没有本节点时，agent 容易把“legacy 很重”的场景误判成：
  - 可以直接保留中间态收敛
  - 或者已经进入新增新 i18n 阶段
- 结果是旧 runtime 还没退化干净，就过早进入新增阶段

## GREEN

- 本节点只回答“为什么先退化，再 handoff 到新增阶段”
- 若 `legacyPresenceAssessment` 或 `chainConfidence` 不明确，先消费 `[[../分析-i18n链路]]`
- 输出必须包含：
  - legacy 复杂度证据
  - 不适合保留中间态的理由
  - 退化步骤
  - handoff 到 `[[../策略-新增新i18n]]`

## REFACTOR

- 若用户其实接受中间态且改动面较小，回退到 `[[../迁移-收敛旧到新-有中间态]]`
- 若当前已经没有旧 i18n，不要继续讨论退化，应回退到 `[[../策略-新增新i18n]]`
- 若用户只想选当前一步的功能节点，不要伪装成迁移策略，应回退到 `[[../路由-选择功能子skill]]`

## 核心目标

- 先确认 legacy 复杂度是否足够高
- 先退化旧 i18n
- 退化完成后，将新增阶段交给 `[[../策略-新增新i18n]]`

## 前置要求

- 若 `legacyPresenceAssessment` 或 `chainConfidence` 不明确，先消费 `[[../分析-i18n链路]]`

## 输出

- `migrationGoal`
- `legacyComplexityEvidence`
- `whyNoIntermediateConvergence`
- `recommendedDeprecationSteps`
- `handoffToNewI18nStage`
- `candidateFeatureSkills`
- `recommendedFeatureSkillSequence`
- `verificationPlan`
- `stopCondition`

## Guardrails

- 不允许在 legacy 事实不清楚时直接下结论
- 不允许把新增新 i18n 阶段继续混写在旧链路退化结论里
- 退化完成后的下一阶段必须显式交给 `[[../策略-新增新i18n]]`

## 使用示例

```text
这个仓库 legacy 负担很重，帮我规划先退化、再新增的路径。
```

```text
如果必须先退化旧 i18n，请把后续 handoff 到新增阶段也一起说清楚。
```

```text
如果事实还不够证明 legacy 负担重，你先分析；一旦确认，就按先退化再新增的路径给我。
```
