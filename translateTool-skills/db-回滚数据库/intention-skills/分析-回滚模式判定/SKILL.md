---
name: 分析-回滚模式判定
description: 当用户请求数据库回滚时，先判定 backup / restore / keep_classify_restore / audit_rollback / adm_matrix_reset / term_day_cleanup，再 Single Dispatch 到对应编排 skill。
version: 1.4.0
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
| `keep_classify_restore` | 用服务器备份还原通用平台部的 mon-cn-1.9.0 和 develop、指定分类保留还原、keep-classify | `编排-指定分类保留还原`（脚本 `restore-keep-classifies.ps1`） |
| `audit_rollback` | 1小时内同意回滚、撤销术语同意、admin-proj 英文 inspect | `分析-回滚范围确认` → `编排-审核副作用回滚` |
| `adm_matrix_reset` | 回滚测试术语、ADM 污染、清理 ADM、retrieval_method 全一样、还原检索路径矩阵、多次预翻译全变 exact | `编排-ADM验收数据还原` |
| `term_day_cleanup` | 按日/时间窗清理术语学习、清今天 audit、term_day_cleanup | `编排-术语学习时间窗清理` |

## 歧义消解

| 用户说法 | 判定 |
|---------|------|
| 「回滚数据库」且上下文为测试后、未提 ADM/术语路径 | `restore` |
| 「回滚数据库」且提到时间窗/任务/语种/audit | `audit_rollback` |
| 「回滚测试术语 / ADM / retrieval 路径」 | `adm_matrix_reset` |
| 「清今天术语学习 / 按时间窗清 audit」（非整库） | `term_day_cleanup` |
| 「测试前」「开始测试」「准备回滚点」 | `backup` |
| 同时提到备份和恢复 | 按当前动作分流 |
| 明确「整库恢复」 | `restore`（即使提到 ADM） |
| 服务器 all-databases dump + 指定分类名（如 mon-cn-1.9.0 / develop） | `keep_classify_restore`（**禁止**整文件直灌） |

## 输入 / 前置条件

- 用户自然语言请求
- 可选：`rollbackMode`（用户显式指定时跳过推断）

## 输出

- `modeDecision`：
  - `rollbackMode`：`backup` | `restore` | `keep_classify_restore` | `audit_rollback` | `adm_matrix_reset` | `term_day_cleanup`
  - `confidence`：`high` | `medium`
  - `dryRun`（ADM / term_day_cleanup：用户说「先看看」时为 true）
  - `routingTarget`（下一 skill 路径）
  - `ambiguityNotes` | null

## 下一步路由

- `backup` → `[[../编排-备份数据库/SKILL.md]]`
- `restore` → `[[../编排-整库恢复/SKILL.md]]`
- `keep_classify_restore` → `[[../编排-指定分类保留还原/SKILL.md]]`
- `audit_rollback` → `[[../分析-回滚范围确认/SKILL.md]]`
- `adm_matrix_reset` → `[[../编排-ADM验收数据还原/SKILL.md]]`
- `term_day_cleanup` → `[[../编排-术语学习时间窗清理/SKILL.md]]`

## 边界

- 只做模式判定，不执行 mysqldump / restore / audit SQL / ADM devtools。
- Single Dispatch：判定后只进入一个编排 skill。
