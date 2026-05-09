---
name: 迁移-主skill改造为agent
description: 当一个主 skill 已经承担过多职责，需要瘦身为父级 agent，并把细节下沉到子skill时使用。
---

# 核心任务
把过重的主 skill 改造成父级 agent 入口，让主文件只保留高频路由规则，细节下沉到子 skill。

## 何时触发
- 主 `SKILL.md` 同时承担现状分析、策略判断、功能执行和质量评估。
- 主文件已经过重，继续堆内容会影响激活质量。
- 需要显式引入 intention / feature 分层。

## 输入 / 前置条件
- 当前主 `SKILL.md`
- 现有 supporting files 和子能力列表
- 已知必须保留的高频规则

## 输出
- `agentRefactorPlan`
- `retainedMainRules`
- `newSubskillLayout`
- `followupFeatures`

## 边界
- 它负责主 skill agent 化，不替代具体 feature 节点的细节补齐。
- 如果问题只是主文件示例过多，可先进入 `[[../../feature-skills/主SKILL瘦身与下沉/SKILL.md]]`。

## 常用配套
- `[[../../feature-skills/主SKILL瘦身与下沉/SKILL.md]]`
- `[[../../feature-skills/子skill路由决策/SKILL.md]]`
- `[[../../feature-skills/子skill上提与中间层删除/SKILL.md]]`

## 使用示例
```text
主 SKILL.md 越来越重，我想把它改造成父级 agent 入口，并把执行细节下沉到子skill。
使用 $迁移-主skill改造为agent 输出新的主文件职责和子skill 布局。
```
