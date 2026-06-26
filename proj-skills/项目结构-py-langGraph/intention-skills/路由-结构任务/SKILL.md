---
name: 路由-结构任务
description: Agent 项目结构任务路由器，Single Dispatch 到唯一 intention。Use when LangGraph 项目结构、目录规范、不确定新建还是重构。
---

# 路由-结构任务

## 何时使用

- 用户描述结构/目录需求，但未明确属于新建、增域还是重构
- 需从多个 intention 中选 **唯一** 入口

## 何时不要使用

- 已在某个策略 intention 执行中 → 不要重复路由
- 只改节点业务逻辑、与目录无关

## Single Dispatch 规则

| 用户意图 | dispatch | 输出 |
|----------|----------|------|
| 从 0 新建 Agent | [[../策略-新建Agent项目/SKILL.md]] | 完整 app/ 树 |
| 新增 LangGraph 工作流 | [[../策略-新增图域/SKILL.md]] | graph/<workflow>/ |
| 新增 services 业务域 | [[../策略-新增服务域/SKILL.md]] | services/<domain>/ |
| orchestration/平铺/graph根杂物 | [[../策略-重构反模式/SKILL.md]] | 迁移映射表 |
| 只写/补 graph README | [[../../feature-skills/撰写-graph域README双轨Mermaid/SKILL.md]] | 双轨 README |

## 🔴 CHECKPOINT · 路由决策

1. 读用户描述，匹配上表 **一行**
2. 若匹配 ≥2 行 → 按优先级：`refactor` > `new_project` > `new_graph` > `new_service` > `write_readme`
3. 若 0 行匹配 → 🛑 STOP，输出 5 行菜单请用户选一项
4. 输出 `selectedIntention` + `missingFacts`（缺 `targetRepo` 必列入）

## 输入契约

| 字段 | 必填 |
|------|------|
| `targetRepo` | 是 |
| `taskType` | 否（可推断） |

## 输出契约

- `selectedIntention` — 唯一 intention 路径
- `missingFacts` — 缺字段清单（非空则 STOP）
