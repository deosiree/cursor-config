---
name: 主SKILL瘦身与下沉
description: 当主 SKILL.md 已承载过多正文、示例、细则或案例，需要瘦身为高频规则入口并把细节下沉时使用。
---

# 核心任务
把过重的主 `SKILL.md` 收敛成 agent 高频入口，并把长示例、模板细节、补充说明下沉到对应 supporting files。

## 何时触发
- 主 `SKILL.md` 越写越长，已经变成总说明书。
- 大段示例、案例、模板细节直接堆在主文件中。
- 主文件既做路由又做完整实现说明，激活上下文过重。

## 输入 / 前置条件
- 当前主 `SKILL.md`
- 已知需要下沉的内容类型
- 目标 supporting files 位置

## 输出
- `retainedMainRules`
- `movedContent`
- `targetSupportingFiles`
- `postTrimChecks`

## 边界
- 它负责瘦主文件，不负责删除必要的摘要级说明。
- callback 约束要求主文档仍保留任务、输入、输出、边界和示例，不能瘦成空壳。
- 如果问题是层级本身多余，继续交给 `[[../子skill上提与中间层删除/SKILL.md]]`。

## 常用配套
- `[[../references与evals补全/SKILL.md]]`
- `[[../Markdown格式规范收尾/SKILL.md]]`
- `[[../../references/write-skill-single-guardrails.md]]`

## 使用示例
```text
主 SKILL.md 现在既有路由规则，又塞了大量示例和实现细则。
使用 $主SKILL瘦身与下沉 只保留高频规则，并说明哪些内容应下沉到 template、references 或 assets。
```
