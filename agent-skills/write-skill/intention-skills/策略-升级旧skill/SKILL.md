---
name: 策略-升级旧skill
description: 当需要把一个已有 skill 从单文件或过时结构升级为更完整、更稳定的套件时使用。
---

# 核心任务
判断旧 skill 的最小升级路径，避免一上来全量重写。

## 何时触发
- 已有旧 skill，但结构不完整或规范过时。
- 需要从单文件升级成完整套件。
- 需要保留旧 skill 中有效规则，同时补齐结构与 supporting files。

## 常用配套
- `[[../../feature-skills/主SKILL瘦身与下沉/SKILL.md]]`
- `[[../../feature-skills/子skill上提与中间层删除/SKILL.md]]`
- `[[../../feature-skills/模板类型判定/SKILL.md]]`
- `[[../../feature-skills/references与evals补全/SKILL.md]]`
- `[[../../feature-skills/历史版本回填为few-shot/SKILL.md]]`
- `[[../../feature-skills/Markdown格式规范收尾/SKILL.md]]`

## 当判定为 `update-skill`
默认推荐依次调用：
1. `[[../../feature-skills/模板类型判定/SKILL.md]]`
2. `[[../../feature-skills/主SKILL瘦身与下沉/SKILL.md]]`
3. `[[../../feature-skills/子skill上提与中间层删除/SKILL.md]]`
4. `[[../../feature-skills/references与evals补全/SKILL.md]]`
5. `[[../../feature-skills/历史版本回填为few-shot/SKILL.md]]`
6. `[[../../feature-skills/Markdown格式规范收尾/SKILL.md]]`

## 输入 / 前置条件
- 现有 `SKILL.md` 或旧套件路径
- 当前结构缺口
- 已知失败或误触发案例

## 输出
- `upgradeStrategy`
- `selectedFeatures`
- `migrationOrder`
- `legacyRulesToKeep`

## 边界
- 它负责升级旧 skill，不负责从零创造一个全新主题。
- 如果问题本质是主 skill 过重但套件已分层，优先转到 `[[../迁移-主skill改造为agent/SKILL.md]]`。

## 使用示例
```text
这个旧 skill 现在只有一个 SKILL.md，我想把它升级成完整套件，但不想把有效规则全推翻。
使用 $策略-升级旧skill 输出升级顺序和需要保留的旧规则。
```
