# intention-skills

意图层：模式判定、范围确认、流程编排。

| 子 skill | 职责 |
|---------|------|
| 分析-回滚模式判定 | backup / restore / audit_rollback / **adm_matrix_reset** |
| 分析-回滚范围确认 | audit 模式：task_name vs department、语种列 |
| 编排-备份数据库 | 测试前 mysqldump 备份 |
| 编排-整库恢复 | list → 确认 → restore → verify |
| 编排-审核副作用回滚 | audit：inspect → confirm → execute → verify |
| 编排-ADM验收数据还原 | ADM：cleanup → fix_adm → verify strict |
