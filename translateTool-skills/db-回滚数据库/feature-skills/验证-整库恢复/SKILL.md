---
name: 验证-整库恢复
description: 当整库 restore COMMIT 后，需要验收表数量与关键业务表抽样时使用。
version: 1.0.0
tags: [db-回滚数据库, translateTool-skills, mysql, restore, verify]
metadata:
  darwin:
    parent_skill: db-回滚数据库
---

# 核心任务

restore 完成后运行验收查询，确认库可用。

## 何时触发

- `执行-整库恢复` 成功返回后

## 验收项

```powershell
# 1. 表数量（restore 脚本已输出 tableCount，此处复核）
docker exec translation-mysql mysql -uroot -p123456 -N -e `
  "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='translationtool';"

# 2. 关键表存在
docker exec translation-mysql mysql -uroot -p123456 --default-character-set=utf8mb4 translationtool -e `
  "SHOW TABLES LIKE 'term_agent_audit';
   SHOW TABLES LIKE 't_translate';
   SHOW TABLES LIKE 't_entry_info';"

# 3. 抽样行数
docker exec translation-mysql mysql -uroot -p123456 --default-character-set=utf8mb4 translationtool -e `
  "SELECT 'term_agent_audit' AS tbl, COUNT(*) AS cnt FROM term_agent_audit
   UNION ALL SELECT 't_translate', COUNT(*) FROM t_translate WHERE delete_state=0
   UNION ALL SELECT 't_entry_info', COUNT(*) FROM t_entry_info WHERE is_delete=0;"
```

## 输出 verificationReport

| 检查项 | 期望 |
|--------|------|
| `tableCount` | > 0（通常与 init schema 一致，数十张表） |
| 关键表存在 | term_agent_audit、t_translate、t_entry_info |
| 抽样可查询 | 无 ERROR |

- `allPassed`（bool）
- `failures`（列表）

## 下一步

- pass → 提示刷新术语学习 / 工作台 UI
- fail → 若有 pre_restore 备份，建议 restore 到 pre_restore

## 边界

- 不与 audit 逐条 verify 混用。
