---
name: 分析-回滚模式判定
description: 当用户请求数据库回滚时，先判定是备份、整库恢复还是 audit 逐条回滚，再 Single Dispatch 到对应编排 skill。
version: 1.1.0
tags: [db-回滚数据库, translateTool-skills, mysql, routing]
metadata:
  darwin:
    parent_skill: db-回滚数据库
---

# 核心任务

在任意 db 回滚请求进入执行层之前，判定 **rollbackMode** 并路由到唯一编排 skill。

## 何时触发

- 套件被调用时的 **第一步**（优先于分析-回滚范围确认）

## 模式判定表

| rollbackMode | 典型用户话术 | 路由 |
|--------------|-------------|------|
| `backup` | 测试前备份、备份数据库、mysqldump、保存当前库 | `编排-备份数据库` |
| `restore` | 恢复到备份、测试完回滚、恢复最新备份、整库恢复 | `编排-整库恢复` |
| `audit_rollback` | 1小时内同意回滚、撤销术语同意、admin-proj 英文 inspect | `分析-回滚范围确认` → `编排-审核副作用回滚` |

## 歧义消解

| 用户说法 | 判定 |
|---------|------|
| 「回滚数据库」且上下文为测试后 | `restore` |
| 「回滚数据库」且提到时间窗/任务/语种/audit | `audit_rollback` |
| 「测试前」「开始测试」 | `backup` |
| 同时提到备份和恢复 | 按当前动作：「先备份」→ backup；「恢复」→ restore |

## 输入 / 前置条件

- 用户自然语言请求
- 可选：`rollbackMode`（用户显式指定时跳过推断）

## 输出

- `modeDecision`：
  - `rollbackMode`：`backup` | `restore` | `audit_rollback`
  - `confidence`：`high` | `medium`
  - `backupPath` | null（restore 时用户指定的 .sql）
  - `useLatest`（restore 缺省路径时为 true）
  - `preRestoreBackup`（默认 true）
  - `routingTarget`（下一 skill 路径）
  - `ambiguityNotes` | null

## 下一步路由

- `backup` → `[[../编排-备份数据库/SKILL.md]]`
- `restore` → `[[../编排-整库恢复/SKILL.md]]`
- `audit_rollback` → `[[../分析-回滚范围确认/SKILL.md]]`

## 边界

- 只做模式判定，不执行 mysqldump / restore / audit SQL。
- Single Dispatch：判定后只进入一个编排 skill。
