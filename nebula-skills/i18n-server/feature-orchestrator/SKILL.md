---
name: feature-orchestrator
description: Use when a user needs a single entry point to route among the i18n-server sub-skills and understand the correct execution order with a rendered workflow diagram
---

# Feature Orchestrator

## Overview

这个 skill 是 `i18n-server` 的总入口。它不替代任何子 skill，而是负责把多个子 skill 编排成可执行流程。

## When to Use

- 用户不知道先用哪个 skill。
- 用户只知道“我要改 i18n”，但还不确定该先分析、先退化，还是可以一步到位。
- 需要向团队解释一整套 skill 的消费顺序。

## Managed Skills

- `feature-analysis`
- `feature-strategy`
- `feature-deprecation`
- `feature-migration`
- `feature-direct-migration`

## Workflow

1. 判断用户当前目标
   - 如果还不知道旧链路是什么，先进入 `feature-analysis`
   - 如果旧链路已清楚，但还没决定迁移方式，进入 `feature-strategy`
   - 如果策略结论是“两步走”，进入 `feature-deprecation`
   - 如果策略结论是“两步走”且退化已完成，进入 `feature-migration`
   - 如果策略结论是“一步到位”，进入 `feature-direct-migration`

2. 判断当前仓库状态
   - 是否已产出旧链路时序图
   - 是否已产出策略结论
   - 是否已完成中间态退化
   - 是否已经提交中间态代码

3. 输出推荐顺序
   - 明确“现在该做什么”
   - 明确“现在不该做什么”
   - 明确“下一步是什么”

4. 输出渲染图
   - 必须附带 Mermaid 图
   - 图里要体现互斥分支：两步走 vs 一步到位

## Guardrails

- 不允许跳过 `feature-analysis` 直接给迁移建议。
- 不允许在没有 `feature-strategy` 结论时进入 `feature-deprecation` 或 `feature-direct-migration`。
- 不允许把 `feature-migration` 用于一步到位。
- 不允许把编排器写成子 skill 的重复内容；它只负责路由和顺序。

## Deliverables

- `README.md`
- `SKILL.md`
- 决策模板
- Mermaid 渲染图模板
- `microfb` 编排示例

## MVP Template

优先阅读：

- `template/orchestration-template.md`
- `template/render-diagram.md`
- `template/microfb-orchestration.md`
