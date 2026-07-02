# Darwin dry_run · db-回滚数据库 v1.1

> 2026-07-02 | backup + restore 增强 | evalMode: dry_run + 脚本 smoke test

## Prompt · backup

**输入：** `使用 db-回滚数据库 测试前备份 translationtool 数据库`

**dry_run 推演：**

1. 分析-回滚模式判定 → `backup`
2. 执行 backup-database.ps1
3. 输出 JSON backupPath

**smoke test（实际执行 backup）：**

```powershell
& "F:\Documents\Default-Obsidian\huiyanSkills\translateTool-skills\db-回滚数据库\scripts\backup-database.ps1" `
  -ProjectRoot "F:\Documents\Repertory\Sieyuan\translationtool" -Label "darwin_smoke"
```

预期：生成 `db/backups/translationtool_*_darwin_smoke.sql`，更新 `.latest`。

---

## Prompt · restore

**输入：** `测试完了，恢复到最新备份`

**dry_run 推演：**

1. rollbackMode=restore
2. list-backups → 展示 latestPath + size
3. 无用户确认 → **不加 -Force**
4. 用户「确认恢复」→ restore -UseLatest -Force → verify

**注意：** dry_run 默认不执行 restore（破坏性）；仅推演命令。

---

## Prompt · audit inspect（回归）

**输入：** `1小时内英文 admin-proj 术语同意 inspect`

**推演：** rollbackMode=audit_rollback → inspect SQL，dryRun=true

**结论：** 三模式路由互不干扰。

---

## 与 v1.0 对比

| 用户诉求 | v1.0 | v1.1 |
|---------|------|------|
| 测试前备份 | 仅文档一行 mysqldump | 专用脚本 + skill 路由 |
| 测试后整库回滚 | 明确「不提供」 | restore 主路径 + -Force 门禁 |
| 精确撤销同意 | audit 四步 | 保留 |

## 结论

v1.1 dry_run **通过**；backup smoke test 建议在实现时跑一次验证文件大小。
