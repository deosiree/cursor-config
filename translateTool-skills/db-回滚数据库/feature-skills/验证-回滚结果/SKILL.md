---
name: 验证-回滚结果
description: 当回滚事务 COMMIT 后，需要验收 audit、translate、entry_info 状态是否符合预期时使用。
version: 1.0.0
tags: [db-回滚数据库, translateTool-skills, mysql, verify]
metadata:
  darwin:
    parent_skill: db-回滚数据库
---

# 核心任务

对回滚后的库状态跑验收查询，对照 checklist 给出 pass / fail。

## 何时触发

- `执行-软删除与解绑` 成功 COMMIT 后
- 或 dry_run 模式下模拟预期结果（不连库）

## 输入 / 前置条件

- `rollbackPlan`（原 inspect 清单）
- `executeResult`（可选）

## 验收 SQL

```sql
SET NAMES utf8mb4;

-- 审核记录应为 pending
SELECT id, review_status, review_comment
FROM term_agent_audit
WHERE id IN (... auditIds ...);

-- translate 应 delete_state=1
SELECT id, entry, translate_state, delete_state
FROM t_translate
WHERE id IN (... glossaryTranslateIds ..., ... workbenchTranslateIds ...);

-- entry_info 外键应为 NULL
SELECT id, entry, en_trans_id  -- 按实际 transIdColumn 替换
FROM t_entry_info
WHERE id IN (... entryInfoIds ...);
```

## 输出 verificationReport

| 检查项 | 期望 |
|--------|------|
| audit.review_status | `pending` |
| audit.review_comment | NULL |
| translate.delete_state | `1` |
| entry_info.{transIdColumn} | NULL |

- `allPassed`（bool）
- `failures`（未达标项列表）

## 下一步路由

- `allPassed = true` → 告知用户刷新术语学习页 / 工作台
- `allPassed = false` → 列出 failures，禁止声称回滚完成

## 边界

- 只验证本次 rollbackPlan 涉及的 ID，不做全库扫描。
- dry_run 时输出 **预期** 状态表，不执行 COMMIT。
