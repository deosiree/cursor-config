# feature-skills

功能层：备份、恢复、audit 查询/执行/验证。

| 子 skill | 职责 |
|---------|------|
| 执行-mysqldump备份 | docker mysqldump → db/backups/ |
| 查询-备份清单 | 列出 .sql 与 .latest |
| 执行-整库恢复 | DROP/CREATE + 导入 |
| 验证-整库恢复 | 表数量与关键表抽样 |
| 查询-审核副作用 | audit 只读 inspect |
| 执行-软删除与解绑 | audit 事务 UPDATE |
| 验证-回滚结果 | audit 验收 |
