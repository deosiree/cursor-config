# skill 输出收尾检查清单

完成一次 `db-回滚数据库` invocation 后，按 **rollbackMode** 勾选对应节。

## 模式判定（所有请求）

- [ ] 已走 **分析-回滚模式判定**（backup / restore / audit_rollback）
- [ ] Single Dispatch：只进入一个编排 skill

---

## backup 模式

- [ ] `translation-mysql` 容器可用
- [ ] 运行 `backup-database.ps1` 成功
- [ ] 输出 `backupPath`、`sizeHuman`（文件 > 1KB）
- [ ] `.latest` 已更新
- [ ] 提示用户测试后可 `-UseLatest` restore

---

## restore 模式

- [ ] 已 **查询-备份清单**，展示路径与大小
- [ ] 用户明确「确认恢复 / 直接恢复数据库」后才 `-Force`
- [ ] restore 前 pre_restore 备份（除非用户 Skip）
- [ ] restore 后 **验证-整库恢复**（tableCount > 0）
- [ ] 提示刷新 UI / 必要时重启服务
- [ ] remote/生产未自动 `-Force`

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

## 文档引用

- [ ] 测试流程优先 backup+restore（见 `备份与整库恢复说明.md`）
- [ ] auto_approved 未与 audit/restore 混 execute
