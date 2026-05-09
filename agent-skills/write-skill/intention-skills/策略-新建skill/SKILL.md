---
name: 策略-新建skill
description: 当需要从 0 创建一个中文 skill，并先决定是否采用单 skill、父级 agent 或 intention/feature 分层时使用。
---

# 核心任务
先定结构，再定命名与模板，不直接跳到写正文。

## 何时触发
- 需要从 0 创建一个新中文 skill。
- 还没决定采用单 skill、父级 agent 还是 intention / feature 分层。
- 当前没有可复用的旧套件结构，需要先确定最小交付形态。

## 常用配套
- `[[../../feature-skills/中文技能命名收敛/SKILL.md]]`
- `[[../../feature-skills/模板类型判定/SKILL.md]]`
- `[[../../feature-skills/references与evals补全/SKILL.md]]`
- `[[../../feature-skills/历史版本回填为few-shot/SKILL.md]]`
- `[[../../feature-skills/Markdown格式规范收尾/SKILL.md]]`

## 当判定为 `add-skill`
默认推荐依次调用：
1. `[[../../feature-skills/模板类型判定/SKILL.md]]`
2. `[[../../feature-skills/中文技能命名收敛/SKILL.md]]`
3. `[[../../feature-skills/references与evals补全/SKILL.md]]`
4. `[[../../feature-skills/历史版本回填为few-shot/SKILL.md]]`
5. `[[../../feature-skills/Markdown格式规范收尾/SKILL.md]]`

## 输入 / 前置条件
- `targetPath`
- `skillTopic`
- 主要触发场景
- 是否需要 Darwin 闭环

## 输出
- `structureDecision`
- `selectedFeatures`
- `artifactPlan`
- `qualityGatePlan`

## 边界
- 它只负责新建策略，不负责把旧结构直接升级。
- 如果现有 skill 已存在且要改造，转到 `[[../策略-升级旧skill/SKILL.md]]`。

## 使用示例
```text
我要从 0 创建一个中文 skill，但还没决定是否要直接做成父级 agent 套件。
使用 $策略-新建skill 先确定结构、命名和模板方向。
```
