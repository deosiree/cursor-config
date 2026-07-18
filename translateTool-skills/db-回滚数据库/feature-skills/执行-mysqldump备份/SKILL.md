---
name: 执行-mysqldump备份
description: 当需要把 translationtool 库 mysqldump 到 db/backups/ 并更新 .latest 指针时使用。
version: 1.1.0
tags: [db-回滚数据库, translateTool-skills, mysql, backup]
metadata:
  darwin:
    parent_skill: db-回滚数据库
---

# 核心任务

调用 `scripts/backup-database.ps1`：容器内 `mysqldump --result-file` + `docker cp`，再 `verify-dump-encoding`。

## 何时触发

- `编排-备份数据库` 步骤 1
- restore 前的 `pre_restore` 快照（由 restore 脚本内部调用）

## 输入 / 前置条件

- `ProjectRoot`（translationtool 根目录）
- `backupLabel`（可选）
- `ContainerName`（默认 `translation-mysql`）

## 执行方式

```powershell
$skillRoot = "F:\Documents\Default-Obsidian\huiyanSkills\translateTool-skills\db-回滚数据库"
& "$skillRoot\scripts\backup-database.ps1" `
  -ProjectRoot "F:\Documents\Repertory\Sieyuan\translationtool" `
  -Label "before_admin_proj_test"
```

**禁止** PowerShell `>` / `Set-Content` 接 mysqldump 管道。

## 输出 backupResult

| 字段 | 说明 |
|------|------|
| `backupPath` | 绝对路径 |
| `fileName` | 文件名 |
| `sizeBytes` / `sizeHuman` | 大小 |
| `createdAt` | 本地时间 |
| `encodingVerify` | 必须为 true |
| `method` | `result-file+docker-cp` |

## 边界

- verify 失败：删除坏文件、不写 `.latest`、不得声称成功。
- 若 `retentionDue`：先问用户是否清理旧备份（禁静默删）。
- 不执行 restore。
