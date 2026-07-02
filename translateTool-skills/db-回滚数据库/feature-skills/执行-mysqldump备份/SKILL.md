---
name: 执行-mysqldump备份
description: 当需要把 translationtool 库 mysqldump 到 db/backups/ 并更新 .latest 指针时使用。
version: 1.0.0
tags: [db-回滚数据库, translateTool-skills, mysql, backup]
metadata:
  darwin:
    parent_skill: db-回滚数据库
---

# 核心任务

调用 `scripts/backup-database.ps1` 生成整库 SQL 备份。

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

## 输出 backupResult

| 字段 | 说明 |
|------|------|
| `backupPath` | 绝对路径 |
| `fileName` | 文件名 |
| `sizeBytes` / `sizeHuman` | 大小 |
| `createdAt` | 本地时间 |

## 边界

- 备份失败（文件 < 1KB）必须报错，不得声称成功。
- 不执行 restore。
