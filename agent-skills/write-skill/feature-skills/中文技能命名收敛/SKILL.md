---
name: 中文技能命名收敛
description: 当一个 skill 套件存在英文占位名、commit 风格名或缺少功能语义的节点名时使用。
---

# 核心任务
把节点名、目录名或 frontmatter 名称收敛成长期可维护的中文功能名，而不是提交过程名或英文占位名。

## 何时触发
- 节点名像 `commit-*`、`feature-*`、`fix-*` 或英文目录名直出。
- 多个节点名称风格不统一，读不出功能职责。
- 需要让父 skill、子 skill 与 README 中的称呼保持一致。

## 输入 / 前置条件
- 当前节点列表
- 已知命名痛点
- 节点实际职责

如果职责本身都还没明确，先不要急着改名，先补结构或边界。

## 输出
- `renamedNodes`
- `namingRulesApplied`
- `reservedNames`
- `followupSyncPoints`

## 边界
- 它只收敛名称，不替代结构拆分或中间层删除。
- 如果问题只是 Markdown 格式，不应误触发本节点。
- 如果名称冲突来自职责混乱，先进入 `[[../子skill上提与中间层删除/SKILL.md]]`。

## 常用配套
- `[[../子skill上提与中间层删除/SKILL.md]]`
- `[[../主SKILL瘦身与下沉/SKILL.md]]`
- `[[../references与evals补全/SKILL.md]]`

## 使用示例
```text
这些子skill 现在还是 commit 风格名字，读不出功能语义。
使用 $中文技能命名收敛 把它们统一成中文功能名，并说明命名规则。
```
