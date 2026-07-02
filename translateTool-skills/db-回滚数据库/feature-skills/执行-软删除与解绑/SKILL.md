---
name: 执行-软删除与解绑
description: 当 rollbackPlan 已获用户确认且 dryRun=false 时，在事务内软删除 t_translate、解绑 entry_info、改回 audit pending 时使用。
version: 1.0.0
tags: [db-回滚数据库, translateTool-skills, mysql, execute]
metadata:
  darwin:
    parent_skill: db-回滚数据库
---

# 核心任务

在 **单事务** 内完成四步回滚，禁止硬 DELETE。

## 何时触发

- 用户明确「确认执行 / 直接在数据库中执行」
- `dryRun = false`
- `rollbackPlan.auditCount > 0`

## 输入 / 前置条件

- `rollbackPlan`（含 4 类 ID 与 `transIdColumn`）

## 执行顺序（事务内）

```sql
START TRANSACTION;

-- ① 软删除术语库（state=3，同意时 merge_to_store 写入）
UPDATE t_translate SET delete_state = 1
WHERE id IN (... glossaryTranslateIds ...);

-- ② 解除工作台关联（动态列名，如 en_trans_id）
UPDATE t_entry_info SET {transIdColumn} = NULL
WHERE id IN (... entryInfoIds ...);

-- ③ 软删除工作台挂载翻译（state=1）
UPDATE t_translate SET delete_state = 1
WHERE id IN (... workbenchTranslateIds ...);

-- ④ 审核记录改回 pending
UPDATE term_agent_audit
SET review_status = 'pending', review_comment = NULL
WHERE id IN (... auditIds ...);

COMMIT;
```

使用 `[[../../scripts/execute-audit-rollback.sql]]`，填入 inspect 得到的 ID。

## 执行方式

```powershell
docker exec translation-mysql mysql -uroot -p123456 --default-character-set=utf8mb4 translationtool -e "
SET NAMES utf8mb4;
START TRANSACTION;
-- ... 填入 ID ...
COMMIT;
"
```

## 输出

- `executeResult`：
  - `rowsAffected`（各 UPDATE 影响行数）
  - `committed`（bool）
  - `error` | null

## 下一步路由

- `committed = true` → `[[../验证-回滚结果/SKILL.md]]`
- 失败 → ROLLBACK，报告错误，不部分提交

## 边界

- **禁止** `DELETE FROM`；统一 `delete_state=1`。
- **禁止** 在无 inspect 清单时 execute。
- `glossaryTranslateIds` 与 `workbenchTranslateIds` 可能重叠或为空，IN 列表去重。
- 远程库无备份时 **不得** 调用本 skill。
