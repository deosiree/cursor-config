---
name: 编排-ADM验收数据还原
description: 当 rollbackMode=adm_matrix_reset 时，编排 cleanup → fix_adm → verify strict → UI 复测清单；Agent 必须在 shell 实际执行。
version: 1.2.0
tags: [db-回滚数据库, translateTool-skills, mysql, adm]
metadata:
  darwin:
    parent_skill: db-回滚数据库
---

# 核心任务

清理 ADM/触发句污染、重建验收种子、strict 矩阵验收，**不 DROP 整库**。

## 何时触发

- `分析-回滚模式判定` 输出 `rollbackMode=adm_matrix_reset`

## 输入 / 前置条件

- `ProjectRoot`：默认 `F:/Documents/Repertory/Sieyuan/translationtool`
- `dryRun`：用户说「先看看 / inspect / dry-run」时为 true；说「替我 / 直接执行」时为 false
- `dbTarget`：`local-docker`（默认）| `remote`

## 执行顺序

```text
1. [可选] 执行-ADM污染清理（dry-run 预览）
2. [人工门禁] dryRun=false 或用户已授权「替我」
3. 执行-ADM污染清理（--apply）
4. 执行-ADM种子重建（--apply）
5. 验证-ADM矩阵验收（两条 --strict）
6. 输出 UI 复测清单 + skill-output-checklist adm 节
```

### 一键入口（推荐）

```powershell
$skillRoot = "F:\Documents\Default-Obsidian\huiyanSkills\translateTool-skills\db-回滚数据库"
& "$skillRoot\scripts\reset-adm-matrix.ps1" -ProjectRoot "<ProjectRoot>" -DryRun   # 预览
& "$skillRoot\scripts\reset-adm-matrix.ps1" -ProjectRoot "<ProjectRoot>" -Apply    # 全链
```

## 人工门禁

| 条件 | 动作 |
|------|------|
| `dryRun=true` | 仅 cleanup preview，停在步骤 1 |
| 用户说「替我 / 直接执行 / 还原」 | `-Apply` 全链 |
| `dbTarget=remote` | 只输出 PowerShell 命令，不 execute |
| verify `--strict` exit 1 | 停止，报告 FAIL 行，提示重启 Agent 后重试 |

## UI 复测清单（编排末尾固定输出）

1. 术语学习 →「**清除本地 Mock**」→ 刷新
2. 若 Agent 在 cleanup 前已运行 → **重启 terminology-agent**（清 Trie 缓存）
3. 工作台 admin-proj，部门 `通用平台部`，对 6 场景**各预翻译一次**：
   - R01/R04 → exact，进翻译审核不进术语学习
   - S02 / 文件、系统、资源 / 文件与系统 / T99 → 不同 retrieval_method
4. **勿**对 S02、decomposed 触发句、T99 在术语学习点「确认入库」

## 输出

- `admResetResult`：
  - `cleanupSummary`（删 audit 数、软删 translate 数、deprecate term_word 数）
  - `seedApplied`（bool）
  - `verifyDataPassed` / `verifyPretranslatePassed`
  - `uiRetestChecklist`（已输出给用户）

## 下一步路由

- 正常完成 → `[[../../assets/skill-output-checklist.md]]` adm_matrix_reset 节
- 污染原理 → `[[../../references/扩展场景-ADM矩阵验收污染.md]]`

## 边界

- 不执行整库 restore；用户要整库覆盖 → 改走 `编排-整库恢复`
- Single Dispatch：feature skill 顺序调用，不并行
- **禁止** `python -m scripts.build_word_index --rebuild`
