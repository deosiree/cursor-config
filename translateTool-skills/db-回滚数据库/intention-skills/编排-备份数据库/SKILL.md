---
name: 编排-备份数据库
description: 当 rollbackMode=backup 时，编排 mysqldump 备份到 translationtool/db/backups/ 并输出路径与大小。
version: 1.0.0
tags: [db-回滚数据库, translateTool-skills, mysql, backup]
metadata:
  darwin:
    parent_skill: db-回滚数据库
---

# 核心任务

测试操作前创建 **整库 mysqldump 备份**，写入 `db/backups/` 并更新 `.latest` 指针。

## 何时触发

- `分析-回滚模式判定` 输出 `rollbackMode=backup`

## 输入 / 前置条件

- `ProjectRoot`（translationtool 根目录，可自动探测）
- `backupLabel`（可选，如 `before_admin_proj_test`）
- `dbTarget`（默认 `local-docker`）

## 执行顺序

```text
1. 执行-mysqldump备份  → backupResult（path、size、createdAt）
2. 提示用户记录 backupPath，测试后可 restore
3. skill-output-checklist § backup
```

## 执行命令

```powershell
& "<skill>/scripts/backup-database.ps1" -ProjectRoot "F:\Documents\Repertory\Sieyuan\translationtool" -Label "before_admin_proj_test"
```

## 输出

- `orchestrationResult`：
  - `backupPath`
  - `fileName`
  - `sizeHuman`
  - `createdAt`
  - `latestPointer`（`.latest` 内容）

## 人工门禁

| 条件 | 动作 |
|------|------|
| `dbTarget=remote` | 输出命令供用户在本机执行，不自动跑 |
| docker 容器未运行 | 提示 `docker compose up -d mysql` |

## 边界

- 只备份 `translationtool` 库，不含 Redis。
- 不触发 restore 或 audit 回滚。
