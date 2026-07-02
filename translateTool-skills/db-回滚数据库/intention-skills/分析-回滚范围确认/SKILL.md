---
name: 分析-回滚范围确认
description: 当需要解析术语 Agent 回滚的时间窗、语种、task_name 与 department 区别，并产出可执行的 inspect 参数时使用。
version: 1.0.0
tags: [db-回滚数据库, translateTool-skills, mysql]
metadata:
  darwin:
    parent_skill: db-回滚数据库
---

# 核心任务

把用户自然语言（如「1 小时内、英文、admin-proj」）收敛为结构化 inspect 参数，**重点澄清 task_name 与 department 不可混用**。

## 何时触发

- 套件被调用时的第一步
- 用户给出的筛选条件含糊（只说项目名、没说语种或时间）

## 输入 / 前置条件

- `timeWindow` — 如 `1 HOUR`（默认）
- `targetLang` — 英文 / 俄文 / 法文 / 西文 / 中文
- `taskName` — 翻译任务名（常见如 admin-proj）
- `department` — 部门可见范围（常见如 通用平台部）
- `reviewStatus` — 默认 `approved`
- `dryRun` — 默认 `true`

## 决策表：task_name vs department

| 用户说法 | 映射字段 | 示例 |
|---------|---------|------|
| 「admin-proj 任务 / 项目」 | `term_agent_audit.task_name` | `admin-proj` |
| 「通用平台部 / 部门」 | `term_agent_audit.department` | `通用平台部` |
| 只说「admin-proj」未说部门 | **优先 task_name** | 本次真实案例即如此 |

若按 `department='admin-proj'` 查询结果为 0，**必须**改用 `task_name='admin-proj'` 重查。

## 语种 → entry_info 外键列

| targetLang | trans_id 列 |
|------------|-------------|
| 英文 | `en_trans_id` |
| 俄文 | `ru_trans_id` |
| 法文 | `fra_trans_id` |
| 西文 | `spa_trans_id` |
| 中文 | `zh_trans_id` |

## 输出

- `rollbackScope` 对象：
  - `timeWindow`
  - `targetLang`
  - `transIdColumn`（如 `en_trans_id`）
  - `taskName` | null
  - `department` | null
  - `reviewStatus`
  - `dryRun`
  - `dbTarget`（`local-docker` | `remote`）
  - `action`（`proceed` | `abort`）
  - `missingFacts`（缺失项列表）
  - `ambiguityNotes`（歧义说明，如 task_name 纠正记录）

## 下一步路由

- `action = proceed` → `[[../编排-审核副作用回滚/SKILL.md]]`
- `action = abort` → 向用户反馈 `missingFacts`

## 边界

- 只负责参数澄清，不执行 SQL。
- 不猜测 `timeWindow` 超过 24 小时而不提醒用户范围过大。
