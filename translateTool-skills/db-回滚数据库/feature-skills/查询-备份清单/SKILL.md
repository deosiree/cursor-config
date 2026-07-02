---
name: 查询-备份清单
description: 当 restore 前需要列出 db/backups/ 下可用 .sql 文件及 .latest 指针时使用。
version: 1.0.0
tags: [db-回滚数据库, translateTool-skills, mysql, backup]
metadata:
  darwin:
    parent_skill: db-回滚数据库
---

# 核心任务

调用 `scripts/list-backups.ps1`，输出人类可读备份清单。

## 何时触发

- `编排-整库恢复` 步骤 1
- 用户问「有哪些备份」「最新备份是哪个」

## 输入 / 前置条件

- `ProjectRoot`（translationtool 根目录）

## 执行方式

```powershell
& "<skill>/scripts/list-backups.ps1" -ProjectRoot "F:\Documents\Repertory\Sieyuan\translationtool"
```

## 输出 backupList

| 字段 | 说明 |
|------|------|
| `backupDir` | db/backups 绝对路径 |
| `latestPath` | .latest 指向的文件 |
| `count` | 备份数量 |
| `backups[]` | fileName、fullPath、sizeHuman、modifiedAt、isLatest |

## 下一步路由

- `count = 0` → 提示先 `编排-备份数据库`
- `count > 0` → 展示清单，等待 restore 确认

## 边界

- 只读，不修改备份文件。
