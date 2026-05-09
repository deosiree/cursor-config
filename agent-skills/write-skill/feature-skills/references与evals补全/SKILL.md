---
name: references与evals补全
description: 当 skill 套件已经有主流程，但缺少 references、should-trigger、should-not-trigger 或输出验收材料时使用。
---

# 核心任务
补齐 supporting files 中最容易被遗漏的两类资产：长说明 references 与触发/验收 evals。

## 何时触发
- 主 `SKILL.md` 已经存在，但长说明还没下沉到 `references/`。
- 节点能写出流程，却没有 should-trigger / should-not-trigger 校验。
- 文档结构有了，但缺少可复跑的验收材料。

## 输入 / 前置条件
- 当前节点的主文档
- 已知触发场景与误触发场景
- 需要补充的 supporting files 列表

## 输出
- `missingReferences`
- `missingEvals`
- `proposedReferenceTopics`
- `proposedEvalCases`

## 边界
- 它补 supporting files，不替代主文档本身的摘要级输入 / 输出 / 边界说明。
- 若 few-shot 来源不足，继续交给 `[[../历史版本回填为few-shot/SKILL.md]]`。
- 若只是 Markdown 结构问题，不应误判为 references / evals 缺失。

## 常用配套
- `[[../历史版本回填为few-shot/SKILL.md]]`
- `[[../Markdown格式规范收尾/SKILL.md]]`
- `[[../../references/write-skill-callback-guardrails.md]]`

## 使用示例
```text
这个 skill 主流程已经有了，但 references 和 evals 还不完整。
使用 $references与evals补全 列出缺失项，并给出最小补齐方案。
```
