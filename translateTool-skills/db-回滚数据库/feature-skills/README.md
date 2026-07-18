# feature-skills

功能层：备份、恢复、audit 查询/执行/验证、ADM 矩阵还原。

| 子 skill | 职责 |
|---------|------|
| 执行-mysqldump备份 | `--result-file` + docker cp + encoding verify → db/backups/ |
| 查询-备份清单 | 列出 .sql 与 .latest；到期时保留提醒 |
| 执行-整库恢复 | verify → DROP/CREATE + docker cp 导入 |
| 验证-整库恢复 | 表数量与关键表抽样 |
| 查询-审核副作用 | audit 只读 inspect |
| 执行-软删除与解绑 | audit 事务 UPDATE |
| 验证-回滚结果 | audit 验收 |
| 执行-ADM污染清理 | devtools.cleanup_adm_test_data |
| 执行-ADM种子重建 | devtools.fix_adm_test_data |
| 验证-ADM矩阵验收 | verify_adm_* --strict |
