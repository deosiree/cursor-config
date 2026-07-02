---
name: 执行-整库恢复
description: 当用户已确认备份文件且授权后，DROP/CREATE translationtool 并导入 mysqldump 时使用。
version: 1.0.0
tags: [db-回滚数据库, translateTool-skills, mysql, restore]
metadata:
  darwin:
    parent_skill: db-回滚数据库
---

# 核心任务

调用 `scripts/restore-database.ps1` 执行破坏性整库恢复。

## 何时触发

- 用户明确「确认恢复 / 直接恢复数据库」
- `编排-整库恢复` 步骤 3

## 输入 / 前置条件

- `backupPath` 或 `-UseLatest`
- `preRestoreBackup`（默认 true）
- 用户已确认（脚本需 `-Force`）

## 执行方式

```powershell
& "<skill>/scripts/restore-database.ps1" `
  -ProjectRoot "F:\Documents\Repertory\Sieyuan\translationtool" `
  -UseLatest `
  -Force
```

或指定文件：

```powershell
& "<skill>/scripts/restore-database.ps1" `
  -BackupPath "F:\...\db\backups\translationtool_20260702_143052.sql" `
  -Force
```

## 输出 restoreResult

| 字段 | 说明 |
|------|------|
| `restoredFrom` | 使用的备份路径 |
| `preRestoreBackup` | 恢复前快照路径（若启用） |
| `tableCount` | information_schema 表数量 |
| `restoredAt` | 完成时间 |

## 边界

- **无 `-Force` 不得执行**（脚本硬门禁）。
- remote / 生产：只输出命令，不自动 `-Force`。
- 失败时若有 pre_restore，告知用户可再 restore 到 pre_restore 文件。
