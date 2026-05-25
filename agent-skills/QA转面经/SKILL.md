---
name: QA转面经
description: 将技术QA对话沉淀为面经风格知识经验贴。触发词：QA转面经、沉淀经验贴、对话总结为面经。支持按structureId或样本文件名选框架；未指定时推荐2～3个行文框架供选择。
---

# QA转面经（对话 → 面经知识文档）

> Skill ID：`QA转面经`。目录：`.cursor/agent-skills/QA转面经/`

## RED（失败基线）

见 `[[template/before/失败基线-流水账QA.md]]`。常漏：步骤 1 未推荐/未等人选 structureId、步骤 1.5、步骤 6 未询问。

## GREEN（执行主线）

| 场景 | 路由 |
|------|------|
| 沉淀经验贴 | `[[intention-skills/编排-QA沉淀为经验贴/SKILL.md]]` |
| 提炼结构/入库 | `[[feature-skills/提炼-文档参考框架/SKILL.md]]` |
| 新增学习方法 | `[[references/方法论库/SKILL.md]]` |

**资源**：`[[references/框架结构库/README.md]]` · `[[references/方法论库/SKILL.md]]` · `[[references/operating-guide.md]]`

**N/K**：`[[../../_shared/references/技术文档-NK与doc_type契约.md]]`

## 入参

| 参数 | 必填 | 说明 |
|------|:---:|------|
| `QA上下文` | 是 | 对话或讨论要点 |
| `输出路径` | 是 | 目标 .md |
| `structureId` | 否 | 行文结构目录名；未指定则步骤 1 推荐 2～3 个 |
| `参考样本文件名` | 否 | `框架结构库/{id}/` 下某篇 .md 原名 |
| `doc_type` / N / K | 否 | 步骤 1.5 可自动 |

## 关键约束

1. 框架按**结构**命名，不按领域；样本**不改文件名**
2. 未指定 structureId → **推荐并等待人类选择**
3. 每知识点 `选择-嵌入学习方法论`（读 `方法论库/`）
4. 全景图 + 快问快答 K + 区分度结尾

## 何时不用

| 需求 | 用 |
|------|-----|
| 开发复盘三件套 | post-mortem |
| 会话摘要 | conversation-summary |
| 已有 md 转播客 | 文档转播客 |
| QA <2 知识点 | 短笔记 |

## REFACTOR

- 新结构 → `框架结构库/{structureId}/`
- 新样本 → 同目录 copy 原名
- 新方法 → `方法论库/references/`

## 资源索引

| 路径 | 用途 |
|------|------|
| `[[references/框架结构库/]]` | structureId 目录 + 框架说明 + 样本 md |
| `[[references/方法论库/SKILL.md]]` | 写作方法路由 |
| `[[intention-skills/分析-参考框架就绪/SKILL.md]]` | 推荐/加载框架 |
| `[[evals/evals.json]]` | 试跑 |

## 使用示例

```text
把 MCP 讨论沉淀成面经 → 未指定结构 → 推荐 面试钩子… / 背景实现… → 人选后继续

用面试钩子-对比递进-答题收束，参考目录内鹅厂面试官 MCP 那篇
```
