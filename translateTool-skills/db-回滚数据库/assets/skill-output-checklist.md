# skill 输出收尾检查清单

完成一次 `db-回滚数据库` invocation 后，按 **rollbackMode** 勾选对应节。

## 模式判定（所有请求）

- [ ] 已走 **分析-回滚模式判定**（backup / restore / **keep_classify_restore** / audit_rollback / adm_matrix_reset / **term_day_cleanup**）
- [ ] Single Dispatch：只进入一个编排 skill

---

## backup 模式

- [ ] `translation-mysql` 容器可用
- [ ] 运行 `backup-database.ps1`（`--result-file` + docker cp，禁止 PS 管道）
- [ ] `encodingVerify` 通过；失败则坏文件已删且未写 `.latest`
- [ ] 输出 `backupPath`、`sizeHuman`
- [ ] `.latest` 已更新
- [ ] 若 `retentionDue`：已询问用户是否清理（禁静默删）
- [ ] 提示用户测试后可 `-UseLatest` restore

---

## restore 模式

- [ ] 已 **查询-备份清单**，展示路径与大小
- [ ] 已跑 `verify-dump-encoding`；失败则 **不得声称回滚成功**
- [ ] 用户明确「确认恢复 / 直接恢复数据库」后才 `-Force`
- [ ] restore 前 pre_restore 备份（除非用户 Skip）
- [ ] restore 用 docker cp + `mysql < file`（禁止 Get-Content 管道）
- [ ] restore 后 **验证-整库恢复**（tableCount > 0）
- [ ] 提示刷新 UI / 必要时重启服务
- [ ] remote/生产未自动 `-Force`

---

## keep_classify_restore 模式

- [ ] dump 已 `verify-dump-encoding` 通过
- [ ] 若 `--all-databases`：已 extract，**未**整文件直灌
- [ ] rewrite 已把 USE 指到临时库，并消毒 `@OLD_TIME_ZONE=NULL`
- [ ] inspect：两分类名命中；失败则中止
- [ ] apply 后 orphanEntries≈0；classify 业务树≈子树+祖先
- [ ] 本机已灌入；`after_keep_*` 备份已打且 verify 绿
- [ ] 用户/角色/菜单配置仍在

---

## audit_rollback 模式

### 范围确认

- [ ] 已澄清 `task_name` vs `department`
- [ ] 已解析 `targetLang` → `transIdColumn`

### inspect

- [ ] utf8mb4 连接
- [ ] audit / state=3 / state=1 / ref_count 清单

### 人工门禁

- [ ] 未获「确认执行」时未 run audit UPDATE

### execute + verify

- [ ] 四步齐全；无硬 DELETE
- [ ] audit→pending，translate 软删，entry_info 解绑

---

## adm_matrix_reset 模式

### 执行

- [ ] 已在 shell **实际执行**（非仅输出命令）
- [ ] `cleanup_adm_test_data`（dry-run 或 apply）
- [ ] `fix_adm_test_data --apply`
- [ ] `verify_adm_data --strict` 通过
- [ ] `verify_adm_pretranslate --strict` 6 行 OK

### 人工门禁

- [ ] 用户说「先看看」时仅 dry-run cleanup
- [ ] remote/生产未自动 apply

### UI 复测（固定输出）

- [ ] 提示术语学习「清除本地 Mock」
- [ ] 提示重启 terminology-agent（Trie 缓存）
- [ ] 提示工作台 6 场景各预翻译一次（勿重复、勿对 S02/decomposed/T99 确认入库）

### 禁止

- [ ] 未跑 `build_word_index --rebuild`（会清空 term_word 需重种）

---

## term_day_cleanup 模式

- [ ] 库非空且有 `term_agent_audit`（否则先 restore 完好 dump）
- [ ] 先 dry-run inspect，展示计数/样本
- [ ] 用户确认后才 `-ConfirmApply`
- [ ] 未做「本日全库所有表 INSERT」清理
- [ ] 可选 `-IncludeApprovedSideEffects` 已说明副作用范围

---

## 文档引用

- [ ] 测试流程优先 backup+restore（见 `备份与整库恢复说明.md`）
- [ ] ADM 污染见 `扩展场景-ADM矩阵验收污染.md`
- [ ] auto_approved 未与 audit/restore 混 execute
- [ ] 编码红灯/绿灯与月清理见 `DEV_DB_CHECKPOINT.md`
