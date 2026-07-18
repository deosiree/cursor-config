---
name: 编排-工作台验数就绪
description: 当 verifyTarget 已就绪时，按固定顺序完成备份委托、建任务、设计词条、挂产品、下发进翻译并验证。
version: 1.0.0
tags: [工作台验数播种, translateTool-skills, orchestrate]
metadata:
  darwin:
    parent_skill: 工作台验数播种
---

# 核心任务

把验数目标落地为「产品 → 任务 → 翻译阶段词条」，并输出验数卡。

## 何时触发

- `分析-验数目标确认` 产出 `verifyTarget` 且 `blockedReason` 为空

## 输入 / 前置条件

- `verifyTarget`（见分析节点）
- 用户授权：`dryRun=false` 或明确「替我执行 / 直接灌」

## 执行顺序（Single Dispatch，禁止并行）

```text
0. [可选] doBackup=true → 委托 db-回滚数据库 scripts/backup-database.ps1
1. 执行-创建验数任务
2. 设计-验数词条矩阵（custom 必跑；种子档案可核对矩阵后跳过手写）
3. 执行-产品挂载词条
4. 执行-任务下发到翻译阶段
5. 验证-翻译阶段就绪
6. 输出 assets/skill-output-checklist.md + 验数卡摘要给用户
```

### 一键种子（推荐 syk_glossary / adm_matrix）

当用户授权写库时，步骤 1–4 可用脚本一次落地：

```powershell
$skillRoot = "F:\Documents\Default-Obsidian\huiyanSkills\translateTool-skills\工作台验数播种"
# syk_glossary / adm_matrix
& "$skillRoot\scripts\apply-workbench-verify-seed.ps1" `
  -ProjectRoot "<ProjectRoot>" -SeedProfile "syk_glossary"
# custom：先 new-custom-seed.ps1，再
& "$skillRoot\scripts\apply-workbench-verify-seed.ps1" `
  -ProjectRoot "<ProjectRoot>" -SeedProfile custom -SeedSqlPath "<seedSqlPath>"
```

脚本成功后仍必须跑步骤 5（验证）。Agent 须在 shell **实际执行**，不得只贴命令假装完成。

步骤 5 一键：

```powershell
& "$skillRoot\scripts\verify-workbench-translate-ready.ps1" `
  -ProjectRoot "<ProjectRoot>" -TaskId "<taskId>" -ProductId "<productId>" -ExpectedEntryCount <n>
```

exit 1 → STOP，贴 FAIL 行，不声称就绪。

### 委托备份

```powershell
$dbSkill = "F:\Documents\Default-Obsidian\huiyanSkills\translateTool-skills\db-回滚数据库"
& "$dbSkill\scripts\backup-database.ps1" -ProjectRoot "<ProjectRoot>" -Label "before_workbench_verify"
```

encoding verify 失败 → **STOP**，不得继续灌数。

## 人工门禁

🔴 CHECKPOINT · 🛑 STOP：写库前必须满足「已备份或用户跳过」且「用户授权执行」。

| 条件 | 动作 |
|------|------|
| `dryRun=true` | 只输出步骤计划 + 种子路径，停在步骤 0/1 前 |
| 用户未授权写库 | 停问 |
| 任一步 feature 失败 | 失败即 Human Loop，不擅自换 skill |
| `dbTarget=remote` | 全程只输出 PowerShell，不 execute |
| backup encoding verify 失败 | 停止灌数 |

## 输出 workbenchSeedResult

| 字段 | 说明 |
|------|------|
| `backupPath` | 若做了备份 |
| `taskId` / `productId` | |
| `entryIds` / `relationCount` | |
| `verifyPassed` | 验证 feature 布尔 |
| `uiPath` | 如：产品 admin → 任务 verify-syk-admin → 翻译 |
| `cardSummary` | 给用户的验数要点 |

## 下一步路由

- 通过 → [[../../assets/skill-output-checklist.md]]
- 字段细节 → [[../../references/任务人员与词条状态机.md]]
- 表顺序 → [[../../references/表写入顺序与关联.md]]

## 边界

- 不 DROP 整库、不跑 ADM cleanup（那是 `db-回滚数据库`）
- 不改 Java；发现 `entry_state=0` 导致 getTaskPending 201 → 本编排步骤 4/5 修复数据，不改代码除非用户另开任务

## 使用示例

```text
verifyTarget 已确认 product=admin、seedProfile=syk_glossary、doBackup=true。
使用 $编排-工作台验数就绪 全链执行并验证。
```
