---
name: db-回滚数据库
description: 当需要对 translationtool MySQL 做测试前备份、测试后整库恢复、撤销术语 Agent 批量同意，或还原 ADM 矩阵验收污染时使用。支持 mysqldump 备份、整库 restore、audit 逐条回滚、ADM 轻量清理+种子+strict 验收。
version: 1.3.0
tags: [translationtool, mysql, rollback, backup, restore, mysqldump, term_agent_audit, adm_matrix, encoding]
metadata:
  darwin:
    parent_skill: db-回滚数据库
    last_eval: 2026-07-07
    eval_mode: evaluate-only
should-trigger:
  - 测试前备份数据库 / mysqldump translationtool / 准备回滚点
  - 恢复到备份 / 测试完回滚数据库 / 整库恢复
  - 回滚数据库 / 撤销术语同意 / term_agent_audit approved
  - 1 小时内 + 语种 + 任务名 inspect 或 audit 逐条回滚
  - 回滚测试术语 / ADM 验收污染 / 清理 ADM 测试数据
  - 多次预翻译全变 exact / retrieval_method 全一样 / 还原检索路径矩阵
  - 按时间窗清理术语学习 / term_day_cleanup
  - 备份保留提醒 / 清理旧 dump（须人审）
  - 用服务器备份还原指定分类（mon-cn-1.9.0 / develop）/ keep_classify_restore
should-not-trigger:
  - 生产库无授权时自动 restore
  - 未确认 inspect/restore 就要 DELETE FROM 或 DROP
  - 静默删除 db/backups/*.sql
  - Windows 上复刻 `mysqldump >` 或 PowerShell 管道写 dump
  - `--all-databases` 整文件直灌本机 MySQL
  - 纯改 TermAuditService / cleanup_adm_test_data.py 等业务代码
  - 修改 devtools 脚本逻辑（走代码任务，非本 skill）
  - 仅为工作台建验数任务 / 灌词条进翻译阶段 / 产品挂任务词条 → 走 `工作台验数播种`
---

# 目标

提供 **六种回滚模式**，按场景选型：

1. **backup** — 测试前 mysqldump 整库备份（`--result-file` + `docker cp` + encoding verify）
2. **restore** — 测试后从 `db/backups/` 整库恢复（先 verify，失败不得声称成功）
3. **keep_classify_restore** — 从服务器/all-databases dump 抽出单库，仅保留指定分类子树+闭包后灌本机
4. **audit_rollback** — 撤销特定术语同意副作用（inspect → 软删 → 改 pending）
5. **adm_matrix_reset** — 清理 ADM/触发句污染 + 重建种子 + strict 矩阵验收（**不 DROP 整库**）
6. **term_day_cleanup** — 术语学习时间窗清理（dry-run → 确认；非整库本日 INSERT）

## 何时使用

### 推荐：测试流程（backup + restore）

```text
测试前 → 备份数据库
测试中 → 随意操作（批量同意、预翻译等）
测试后 → 恢复到最新备份
```

### ADM 矩阵还原（adm_matrix_reset）

多次 Agent 预翻译 / 术语学习「确认」导致 `t_translate(state=3)`、`term_word` 整句入库，6 种 `retrieval_method` 塌缩为全 exact/grep 时：

```text
使用 $db-回滚数据库 回滚测试用的 ADM 术语，替我清理数据库
```

Agent **必须在 shell 实际执行** `reset-adm-matrix.ps1` 或 devtools 四步，不可只输出命令。

### audit 逐条回滚

- 不能整库覆盖，只需撤销部分「术语同意」写入
- 需按 `task_name`、语种、时间窗精确回滚

## 何时不要使用

- **生产 / 共享测试库** 且无授权 → 禁止自动 restore / ADM apply，只输出步骤
- 用户 **未确认** restore 或 audit execute → 保持 dryRun / 无 `-Force`
- 仅需 UI 删术语库单条 → `/Syk/deleteSykEntry`

## 输入契约

| 参数 | 说明 | 默认 |
|------|------|------|
| `rollbackMode` | `backup` / `restore` / `keep_classify_restore` / `audit_rollback` / `adm_matrix_reset` / `term_day_cleanup` | 由模式判定 |
| `ProjectRoot` | translationtool 根目录 | 自动探测 |
| `dryRun` | ADM 仅 preview cleanup；audit 只 inspect | ADM 默认 false（用户说「替我」时） |
| 其余 | 见各模式编排 skill | — |

## RED · 失败基线

| 失败模式 | 对策 |
|---------|------|
| 测试后逐条找 audit 回滚 | 改用 **backup + restore** |
| ADM 路径全变 exact | **adm_matrix_reset** |
| restore 未确认就 DROP | `-Force` 门禁 + 人工确认 |
| PowerShell 管道写 dump → COMMENT 乱码 | 仅 `--result-file` + `docker cp`；`verify-dump-encoding` 失败即 fail |
| 把 admin-proj 当 department | audit 模式：task_name 决策表 |

## GREEN · 执行主线

**0. [[intention-skills/分析-回滚模式判定/SKILL.md]]** — 五模式 Single Dispatch

### 路径 A：backup

1. **[[intention-skills/编排-备份数据库/SKILL.md]]**
2. **[[feature-skills/执行-mysqldump备份/SKILL.md]]**

### 路径 B：restore

1. **[[intention-skills/编排-整库恢复/SKILL.md]]**
2. **[[feature-skills/查询-备份清单/SKILL.md]]** → 人工门禁 → **执行-整库恢复** → **验证-整库恢复**

### 路径 C：audit_rollback

1. **[[intention-skills/分析-回滚范围确认/SKILL.md]]**
2. **[[intention-skills/编排-审核副作用回滚/SKILL.md]]**

### 路径 D：adm_matrix_reset

1. **[[intention-skills/编排-ADM验收数据还原/SKILL.md]]**
2. 一键：`[[scripts/reset-adm-matrix.ps1]]` 或依次 feature skill

### 路径 E：term_day_cleanup

1. **[[intention-skills/编排-术语学习时间窗清理/SKILL.md]]**
2. `[[scripts/term-day-cleanup.ps1]]` dry-run → 确认 → `-ConfirmApply`

详见 **[[references/扩展场景-ADM矩阵验收污染.md]]**、**[[references/备份与整库恢复说明.md]]**。

## 路由表

| 用户意图 | 路由 |
|---------|------|
| 测试前备份 / mysqldump / 准备回滚点 | backup |
| 测试后恢复 / 回滚到备份 | restore |
| 撤销特定术语同意 | audit_rollback |
| 回滚测试术语 / ADM 污染 / retrieval 全一样 | **adm_matrix_reset** |
| 按时间窗清术语学习 | **term_day_cleanup** |
| 预翻译 auto_approved（非 ADM 矩阵） | 扩展场景文档（inspect only） |

## 人工门禁

| 条件 | 动作 |
|------|------|
| restore 未展示 backupPath + size | 禁止 `-Force` |
| ADM「先看看 / dry-run」 | 仅 cleanup preview |
| ADM「替我 / 直接执行」 | `-Apply` 全链 + verify |
| `dbTarget=remote` | 只输出命令 |

## 使用示例

```text
使用 $db-回滚数据库 测试前备份 translationtool 数据库
```

```text
使用 $db-回滚数据库 回滚测试用的 ADM 术语，替我清理数据库
```

```text
使用 $db-回滚数据库 检查 1 小时内英文 admin-proj 术语同意副作用，先 inspect
```

## Darwin

见 `test-prompts.json`、`evals/evals.json`（v1.2 ADM 模式 eval）。
