---
name: 编排-revert并推送最终版
description: 当策略判定 phase=publish_final，需要在共享分支 pull、按新→旧 revert 草稿系列（含热修）、cherry-pick 最终审查版、push，并删除本地临时分支时使用。
---

# 核心任务

在共享分支上用 **revert（不抹历史）** 消除「原始草稿 + 历次热修」整段效果，再合入**整批审查优化后**的最终结果并推送；最后清理临时分支。

最终版 F 应覆盖系列中仍需要保留的修复（例如依赖补齐），因为系列提交将被 revert 掉。

## 编排顺序

1. [[../../feature-skills/确认共享分支与工作树/SKILL.md]]
2. [[../../feature-skills/pull并revert草稿/SKILL.md]]
3. [[../../feature-skills/cherry-pick最终版并push/SKILL.md]]
4. [[../../feature-skills/删除临时分支/SKILL.md]]
5. [[../../feature-skills/输出验收报告/SKILL.md]]

## 前置

- `draft_commit`、`commitsInSeries[]` 或可确认的 `series_tip`、`final_commit` 已知
- 策略 `phase=publish_final`

## 检查点

### 🔴 CHECKPOINT-REVERT · 🛑 STOP

revert 前展示：系列 SHA 列表（新→旧）、共享分支、是否夹杂他人提交、将执行的 `git revert`（非 force）。

### 🔴 CHECKPOINT-FINAL-PUSH · 🛑 STOP

push 前展示：revert 结果、最终提交、目标 `shared_branch`；确认非 force。

### 🔴 CHECKPOINT-DELETE-TEMP · 🛑 STOP

删临时分支前确认最终版已在共享分支 tip 历史中。

## 失败短路

| 条件 | 动作 |
| --- | --- |
| revert/cherry-pick 冲突 | `status=conflict`，等用户选择；禁止擅自 abort 后强推 |
| 缺 final SHA | STOP；可先回本地审查编排提交 |
| 用户改口要 force | `handoff_force_push`，本编排停止写操作 |

## 输出

`orchestration`=`publish_final` | `revertedCommits[]` | `finalSha` | `pushed` | `tempDeleted` | `status`

## 使用示例

```text
系列含草稿+js-yaml 热修；final 已含依赖与审查优化。pull → 新→旧 revert 系列 → cherry-pick final → push → 删 temp。
使用 $编排-revert并推送最终版。
```
