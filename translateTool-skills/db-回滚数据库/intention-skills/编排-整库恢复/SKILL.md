---
name: 编排-整库恢复
description: 当 rollbackMode=restore 时，编排 list → 确认 → pre_restore 备份 → DROP/CREATE → 导入 → verify。
version: 1.0.0
tags: [db-回滚数据库, translateTool-skills, mysql, restore]
metadata:
  darwin:
    parent_skill: db-回滚数据库
---

# 核心任务

从 `db/backups/` 中选定备份文件，**整库恢复** translationtool（破坏性操作）。

## 何时触发

- `分析-回滚模式判定` 输出 `rollbackMode=restore`

## 输入 / 前置条件

- `backupPath`（可选；缺省用 `.latest` 或最新 .sql）
- `useLatest`（默认 true 当未指定路径）
- `preRestoreBackup`（默认 true：恢复前再备份当前库为 pre_restore）
- `dbTarget`（默认 `local-docker`）

## 执行顺序

```text
1. 查询-备份清单        → 展示可选备份与 .latest
2. [人工门禁]           → 展示路径、大小；用户「确认恢复」
3. 执行-整库恢复        → -Force（含可选 pre_restore）
4. 验证-整库恢复        → tableCount、关键表抽样
5. skill-output-checklist § restore
```

## 人工门禁规则

| 条件 | 动作 |
|------|------|
| 未展示 backupPath 与 size | 禁止 restore |
| 用户未说「确认恢复 / 直接恢复数据库」 | 只 list + 给命令 |
| `dbTarget=remote` 或生产 | 禁止自动 restore |
| 备份目录为空 | 提示先 backup |

## 输出

- `orchestrationResult`：
  - `restoredFrom`
  - `preRestoreBackup` | null
  - `tableCount`
  - `verificationReport`
  - `executed`（bool）

## 下一步路由

- 成功 → 提示刷新 UI；必要时重启 translationtoolservice / terminology-agent
- 失败 → 报告错误；若有 pre_restore 备份路径，提示可回滚到 pre_restore

## 边界

- **DROP DATABASE** 级覆盖，与 audit 逐条回滚互斥（一次请求只走 restore 主线）。
- Redis 不在 scope；文档提示缓存异常时重启服务。
