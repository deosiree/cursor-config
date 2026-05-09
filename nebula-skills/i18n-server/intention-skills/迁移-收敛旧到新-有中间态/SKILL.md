---
name: 迁移-收敛旧到新(有中间态)
description: 当旧 i18n 负担较小，允许保留中间态，并希望逐步把旧 i18n 收敛到新 i18n 时使用。
---

# 迁移-收敛旧到新(有中间态)

## RED

- 没有本节点时，agent 容易把“可以接受中间态、小步收口”的场景误判成：
  - 必须先大规模退化旧链路
  - 或已经可以直接进入新增阶段
- 结果是改动面被放大，或者中间态风险根本没有被说明

## GREEN

- 本节点只处理“保留中间态、逐步收敛”的策略
- 若 `legacyPresenceAssessment` 或 `candidateFeatureRisks` 不明确，先消费 `[[../分析-i18n链路]]`
- 输出必须包含：
  - 中间态描述
  - 可接受中间态的理由
  - 功能序列
  - 验证与停止条件

## REFACTOR

- 若 legacy 负担过重，不要硬保留中间态，应回退到 `[[../迁移-退化到新增-无中间态]]`
- 若当前已经没有旧 i18n，不要继续讨论收敛旧链路，应回退到 `[[../策略-新增新i18n]]`
- 若用户只想选当前一步功能节点，应回退到 `[[../路由-选择功能子skill]]`

## 核心目标

- 判断是否适合保留中间态
- 给出渐进收口路径
- 直接输出功能 skill 序列，而不是停在抽象策略

## 前置要求

- 若 `legacyPresenceAssessment` 或 `candidateFeatureRisks` 不明确，先消费 `[[../分析-i18n链路]]`

## 输出

- `migrationGoal`
- `bridgeStateDescription`
- `whyIntermediateStateIsAcceptable`
- `candidateFeatureSkills`
- `recommendedFeatureSkillSequence`
- `whyThisConvergencePath`
- `verificationPlan`
- `stopCondition`

## Guardrails

- 不允许把“有中间态”误写成“直接一步到位”
- 不允许只有策略结论，没有功能 skill 序列

## 使用示例

```text
保持中间态没问题，重点是逐步把旧 i18n 收敛到新方案。
```

```text
请直接给我一条有中间态的功能 skill 序列，不要只给抽象建议。
```

```text
如果分析结果显示这个仓库适合保留接缝和中间态，就按渐进收口的路径给我功能序列。
```
