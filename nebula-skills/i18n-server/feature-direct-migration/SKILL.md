---
name: feature-direct-migration
description: Use when feature-strategy concludes that a repository can move from the current i18n chain to the target i18n chain in one step without a separate deprecation phase
---

# Feature Direct Migration

## Overview

这个 skill 专门处理“一步到位”迁移。它不是简单复用 `feature-migration`，因为一步到位场景下，同一轮工作里要同时做两件事：

1. 删掉旧链路中不会被新链路继续消费的部分
2. 接入新链路所需的新 runtime、语言包、helper、store 和抽词配置

## When to Use

- `feature-analysis` 已完成。
- `feature-strategy` 明确给出 `migrate-directly` 结论。
- 当前仓库不存在必须单独验证的高风险中间态收益。

## Required Outputs

1. 旧链路裁剪清单
2. 新链路接入清单
3. 共享资产复用清单
4. 一步到位迁移顺序
5. 回滚点与验证点

## Workflow

1. 读取输入
   - 旧链路分析
   - 策略结论
   - 新方案文档

2. 划分三类内容
   - 可直接复用：例如词条资产、部分语言状态约定、部分组件层写法
   - 需要直接替换：例如 runtime 入口、语言码、helper、语言包格式
   - 需要直接删除：例如旧链路中不会被新链路消费的兼容层

3. 组合直迁方案
   - 在同一计划里同时描述旧链路裁剪和新链路接入
   - 避免先做一个长时间存在的中间态

4. 设计迁移顺序
   - 先替换核心状态源与 runtime 入口
   - 同步替换高耦合 helper 与 store
   - 再导入新语言包格式与抽词配置
   - 最后统一组件层和非组件层消费边界

5. 验证与回滚设计
   - 标出每个高风险点的验证动作
   - 标出若失败时应回退到哪一层

## Guardrails

- 不允许在没有 `feature-strategy` 一步到位结论时使用本 skill。
- 不允许把“一步到位”写成“直接执行 feature-migration”。
- 不允许遗漏旧链路裁剪面，只写新链路接入面。
- 不允许忽略回滚点。

## Deliverables

- `README.md`
- `SKILL.md`
- 直迁模板
- `microfb` 直迁策略示例

## MVP Template

优先阅读：

- `template/direct-migration-plan.md`
- `template/direct-migration-checklist.md`
- `template/microfb-direct-migration.md`
