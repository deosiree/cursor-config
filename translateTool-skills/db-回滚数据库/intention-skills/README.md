# intention-skills

意图层：模式判定、范围确认、流程编排。

| 子 skill | 职责 |
|---------|------|
| 分析-回滚模式判定 | backup / restore / **keep_classify_restore** / audit_rollback / adm_matrix_reset / term_day_cleanup |
| 分析-回滚范围确认 | audit 模式：task_name vs department、语种列 |
| 编排-备份数据库 | 测试前 mysqldump 备份（verify 编码） |
| 编排-整库恢复 | list → 确认 → restore → verify |
| 编排-指定分类保留还原 | 服务器/all-DB dump → 抽出 → keep 分类子树+闭包 → 本机 |
| 编排-审核副作用回滚 | audit：inspect → confirm → execute → verify |
| 编排-ADM验收数据还原 | ADM：cleanup → fix_adm → verify strict |
| 编排-术语学习时间窗清理 | term_day_cleanup：dry-run → 确认 → apply |
