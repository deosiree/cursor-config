---
name: db-回滚数据库
description: 当需要对 translationtool MySQL 做测试前备份、测试后整库恢复，或撤销术语 Agent 批量同意等写入时使用。支持 mysqldump 备份到 db/backups/、基于备份 DROP/CREATE 恢复，以及按时间窗 audit 逐条回滚。
version: 1.1.0
tags: [translationtool, mysql, rollback, backup, restore, mysqldump, term_agent_audit]
metadata:
  darwin:
    parent_skill: db-回滚数据库
    last_eval: 2026-07-02
    baseline_score: 90.2
    eval_mode: evaluate-only
should-trigger:
  - 测试前备份数据库 / mysqldump translationtool
  - 恢复到备份 / 测试完回滚数据库 / 整库恢复
  - 回滚数据库 / 撤销术语同意 / term_agent_audit approved
  - 1 小时内 + 语种 + 任务名 inspect 或 audit 逐条回滚
should-not-trigger:
  - 生产库无授权时自动 restore
  - 未确认 inspect/restore 就要 DELETE FROM 或 DROP
  - 纯改 TermAuditService 等业务代码
---

# 目标

提供 **三种回滚模式**，按场景选型：

1. **backup** — 测试前 mysqldump 整库备份（推荐测试流程第一步）
2. **restore** — 测试后从 `db/backups/` 整库恢复（比逐条找操作更简单）
3. **audit_rollback** — 撤销特定术语同意副作用（inspect → 软删 → 改 pending）

## 何时使用

### 推荐：测试流程（backup + restore）

```text
测试前 → 备份数据库
测试中 → 随意操作（批量同意、预翻译等）
测试后 → 恢复到最新备份
```

### audit 逐条回滚

- 不能整库覆盖，只需撤销部分「术语同意」写入
- 需按 `task_name`、语种、时间窗精确回滚

## 何时不要使用

- **生产 / 共享测试库** 且无授权 → 禁止自动 restore，只输出步骤
- 用户 **未确认** restore 或 audit execute → 保持 dryRun / 无 `-Force`
- 仅需 UI 删术语库单条 → `/Syk/deleteSykEntry`

## 输入契约

| 参数 | 说明 | 默认 |
|------|------|------|
| `rollbackMode` | `backup` / `restore` / `audit_rollback` | 由模式判定 |
| `backupPath` | restore 用的 .sql | 缺省 → `.latest` |
| `backupLabel` | 备份文件名备注 | 可选 |
| `preRestoreBackup` | restore 前是否再备份当前库 | `true` |
| `ProjectRoot` | translationtool 根目录 | 自动探测 |
| `timeWindow` | audit 模式时间窗 | `1 HOUR` |
| `targetLang` | audit 模式语种 | audit 时必填 |
| `taskName` | 翻译任务名（如 admin-proj） | audit 时与 department 至少其一 |
| `dryRun` | audit 只 inspect | `true` |
| `dbTarget` | `local-docker` / `remote` | `local-docker` |

## RED · 失败基线

| 失败模式 | 对策 |
|---------|------|
| 测试后逐条找 audit 回滚 | 改用 **backup + restore** |
| restore 未确认就 DROP | `-Force` 门禁 + 人工确认 |
| 把 admin-proj 当 department | audit 模式：task_name 决策表 |
| 备份提交到 git | `db/backups/*.sql` 已 gitignore |

## GREEN · 执行主线

**0. [[intention-skills/分析-回滚模式判定/SKILL.md]]** — backup / restore / audit_rollback

### 路径 A：backup

1. **[[intention-skills/编排-备份数据库/SKILL.md]]**
2. **[[feature-skills/执行-mysqldump备份/SKILL.md]]** → `db/backups/translationtool_*.sql` + `.latest`

### 路径 B：restore

1. **[[intention-skills/编排-整库恢复/SKILL.md]]**
2. **[[feature-skills/查询-备份清单/SKILL.md]]**
3. **人工门禁** — 展示路径与大小；用户「确认恢复」
4. **[[feature-skills/执行-整库恢复/SKILL.md]]** — `-Force`
5. **[[feature-skills/验证-整库恢复/SKILL.md]]**

### 路径 C：audit_rollback

1. **[[intention-skills/分析-回滚范围确认/SKILL.md]]**
2. **[[intention-skills/编排-审核副作用回滚/SKILL.md]]** → 现有 inspect 四步

详见 **[[references/备份与整库恢复说明.md]]**、**[[references/扩展场景-预翻译与工作台.md]]**。

## 路由表

| 用户意图 | 路由 |
|---------|------|
| 测试前备份 / mysqldump | 模式判定 → 编排-备份数据库 |
| 测试后恢复 / 回滚到备份 | 模式判定 → 编排-整库恢复 |
| 撤销特定术语同意 | 模式判定 → audit 编排 |
| 预翻译 auto_approved | 扩展场景文档（inspect only） |

## 人工门禁

| 条件 | 动作 |
|------|------|
| restore 未展示 backupPath + size | 禁止 `-Force` |
| 用户未说「确认恢复 / 直接恢复数据库」 | 只 list |
| audit 未说「确认执行 / 直接在数据库执行」 | dryRun |
| `dbTarget=remote` | 只输出命令 |

## 使用示例

```text
使用 $db-回滚数据库 测试前备份 translationtool 数据库
```

```text
使用 $db-回滚数据库 测试完了，恢复到最新备份
```

```text
使用 $db-回滚数据库 检查 1 小时内英文 admin-proj 术语同意副作用，先 inspect
```

## Darwin

见 `test-prompts.json`、`darwin-output-baseline.md`（v1.1 复评）。
