---
name: 子skill路由决策
description: 当父级或意图层已经识别任务类型，但还需要决定最少调用哪些功能型子skill时使用。
---

# 核心任务
根据当前缺口选择最少必要的 feature 组合与执行顺序，避免一上来把所有功能节点全部拉进来。

## 何时触发
- 当前任务类型已经明确，但还不确定应先走哪几个 feature 节点。
- 用户只想补某几类能力，例如命名、模板、few-shot、evals 或 Markdown 收尾。
- 需要明确“先做什么、后做什么、哪些暂时不做”。

## 输入 / 前置条件
- `skillTaskClassification`
- `currentStructure`
- `goalState`
- `knownPainPoints`
- 当前最明显的能力缺口

如果连任务类型都还不清楚，先回到 `[[../../intention-skills/分析-skill现状/SKILL.md]]`。

## 输出
- `currentGaps`
- `selectedFeatures`
- `executionOrder`
- `skippedFeatures`
- `routingReason`

## 边界
- 它负责“选 feature 组合”，不负责重做现状分析。
- 它不替代具体 feature 节点本身的执行说明。
- 如果用户已经明确只补一个 feature，直接路由到对应节点，不要重复展开整套组合分析。

## 常用配套
- `[[../中文技能命名收敛/SKILL.md]]`
- `[[../模板类型判定/SKILL.md]]`
- `[[../历史版本回填为few-shot/SKILL.md]]`
- `[[../references与evals补全/SKILL.md]]`
- `[[../Markdown格式规范收尾/SKILL.md]]`

## 使用示例
```text
这个 skill 套件已经确定要升级，但我不想一口气把所有 feature 节点都走一遍。
使用 $子skill路由决策 判断最少需要哪几个功能节点，并给出顺序。
```
