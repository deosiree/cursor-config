---
name: 查询-审核副作用
description: 当 rollbackScope 已确认后，需要只读查询 term_agent_audit、t_translate、t_entry_info 副作用清单时使用。
version: 1.0.0
tags: [db-回滚数据库, translateTool-skills, mysql, inspect]
metadata:
  darwin:
    parent_skill: db-回滚数据库
---

# 核心任务

运行 inspect SQL，输出待回滚的 **4 类 ID** 与人类可读摘要表。

## 何时触发

- `编排-审核副作用回滚` 步骤 1

## 输入 / 前置条件

- `rollbackScope`（含 timeWindow、targetLang、transIdColumn、taskName、department、reviewStatus）

## 执行方式

优先使用 `[[../../scripts/inspect-audit-rollback.sql]]`，通过 shell 传入变量：

```powershell
docker exec translation-mysql mysql -uroot -p123456 --default-character-set=utf8mb4 translationtool -e "
SET NAMES utf8mb4;
SET @hours = 1;
SET @target_lang = '英文';
SET @task_name = 'admin-proj';
SET @department = NULL;
SET @review_status = 'approved';
SOURCE /path/in/container/inspect-audit-rollback.sql;
"
```

若无法 SOURCE，将脚本内 SELECT 段逐段 inline 执行（见脚本注释）。

连接约定见 `[[../../references/连接与执行约定.md]]`。

## 输出 rollbackPlan

| 字段 | 说明 |
|------|------|
| `auditIds` | `term_agent_audit.id` 列表 |
| `glossaryTranslateIds` | 术语库 state=3、`delete_state=0`，匹配 audit 的 entry+translate+lang+dept |
| `workbenchTranslateIds` | 工作台当前挂载的 `t_translate.id`（state 通常 1） |
| `entryInfoIds` | `t_entry_info.id` 列表 |
| `transIdColumn` | 如 `en_trans_id` |
| `auditRows` | 审核记录摘要（source_text、suggested_translation、updated_at） |
| `duplicateWarnings` | 同一 entry 多条 translate 的提示 |
| `auditCount` | 命中审核条数 |

## inspect 必查项

1. **审核记录** — `term_agent_audit` 按 timeWindow + targetLang + taskName/department
2. **术语库** — JOIN audit，找 `translate_state=3` 且 `delete_state=0`
3. **工作台** — `entry_info_id` → `{transIdColumn}` → `t_translate`
4. **引用计数** — 各 translate id 被多少 entry_info 引用

## 下一步路由

- `auditCount > 0` → 展示摘要，等待人工门禁
- `auditCount = 0` 且 taskName 曾当 department 查过 → 提示改用 task_name 重查

## 边界

- **只读**，禁止 UPDATE / DELETE。
- 不自动 expand 时间窗；0 条时交还编排层处理。
