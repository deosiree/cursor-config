---
name: 编排-revert并收回本地审查
description: 当策略判定 phase=revert_and_reclaim，需要把远端仍展示的待审最新版改动收回临时分支本地审查、且本阶段不推 revert、不改远端 tip 时使用。审完后走 publish_final 成对推送 revert: + 最终版。
---

# 核心任务

远端继续展示**未审通过的最新版**；本地把该版改动收回临时审查分支，先审。  
本阶段：**禁止 push**、**禁止**在共享分支提交/推送 `revert:`。

审完后再走 [[../编排-revert并推送最终版/SKILL.md]]：在一次发布里**连续**推送两笔——① `revert:` 回滚待审系列；② 审核后的最终版 F。保护分支不能改历史，只能用前进式 `revert:` + F，但**两笔都在审核通过后才推**。

**不是** `local_review` 的日常「只本地 reset」话术时，仍可用本编排强调「记系列 SHA → 日后成对 publish」。  
**不是**「先推 revert 让远端立刻变旧」——那是错误路径（他人统编会看到旧码）。

## 编排顺序

1. [[../../feature-skills/确认共享分支与工作树/SKILL.md]]（记下 `draft_commit` / `commitsInSeries[]` / `series_tip=pre_revert_tip`、`temp_branch`；**确认远端 tip 保持待审最新**）
2. [[../../feature-skills/收回草稿与热修区间到审查工作区/SKILL.md]]（`series_tip` = 当前待审 tip）
3. [[../../feature-skills/输出验收报告/SKILL.md]]

停在：本地临时支有整包 diff；**远端 tip 未变**。不 cherry-pick F，不推 revert。

若切共享支做其它事须先 stash 审查 WIP，回来再 pop 到**同一临时支**；默认不 pop 无关旧 stash。

## 前置

- 策略 `phase=revert_and_reclaim`
- 待审系列 SHA 经用户确认（可单 tip）
- `temp_branch` 已知

## 检查点

### 🔴 CHECKPOINT-RECLAIM-SERIES · 🛑 STOP

收回前展示：`series_tip`、提交列表、将 `checkout -B temp tip` + `reset draft^`；并写明：**本阶段不 push、远端继续显示待审最新版；审完后 publish 才成对推 revert:+F。**

## 失败短路

| 条件 | 动作 |
| --- | --- |
| 缺系列 SHA | STOP |
| tip 夹他人未授权 | STOP |
| 用户要求本阶段就推 `revert:` | STOP；解释会让他人立刻看到旧码；改走审完后 `publish_final` |
| 用户要 force / hard | STOP |

## 输出

`orchestration`=`revert_and_reclaim` | `draftSha` | `seriesTip` | `tempBranch` | `reviewBase` | `remoteUnchanged=true` | `status`

## 使用示例

```text
远端先保持最新待审版给别人看；我把这一版改动收回本地审，审完再一起推 revert: 和最终版。现在不要推 revert。
使用 $编排-revert并收回本地审查。
```
