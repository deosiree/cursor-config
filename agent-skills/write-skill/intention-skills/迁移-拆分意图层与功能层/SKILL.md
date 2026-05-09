---
name: 迁移-拆分意图层与功能层
description: 当一个 skill 套件已经有多类子skill，但意图判断和功能落地混在一起，需要进一步拆层时使用。
---

# 核心任务
把混在一起的“判断类职责”和“执行类职责”拆开，形成明确的 intention / feature 两层。

## 何时触发
- 同一批节点里既有分析、策略、编排，也有真实功能执行。
- 现有子 skill 平铺摆放，读不出哪些节点负责判断、哪些负责落地。
- 父 skill 和子 skill 在多轮使用中反复混淆职责。

## 输入 / 前置条件
- 当前子 skill 列表
- 各节点职责说明
- 已知混淆点

## 输出
- `intentionNodes`
- `featureNodes`
- `splitReason`
- `migrationOrder`

## 边界
- 它负责拆职责层，不直接完成每个子 skill 的内容补全。
- 如果只是某层多余，优先配合 `[[../../feature-skills/子skill上提与中间层删除/SKILL.md]]`。

## 常用配套
- `[[../../feature-skills/子skill上提与中间层删除/SKILL.md]]`
- `[[../../feature-skills/中文技能命名收敛/SKILL.md]]`
- `[[../../feature-skills/子skill路由决策/SKILL.md]]`

## 使用示例
```text
这个 skill 套件里分析、策略和执行节点都混在一起了。
使用 $迁移-拆分意图层与功能层 输出 intention / feature 拆分方案和迁移顺序。
```
