---
name: 编排-审查中热修草稿
description: 当策略判定 phase=hotfix_during_review，需要先 stash 离开审查分支、在共享分支修 bug 并多远端 push，再把「草稿+热修」整段改动收回审查工作区做整批审查时使用。
---

# 核心任务

审查中发现草稿/CI bug → 先把修复推到共享分支（往前推进）→ 再把 **原始草稿 + 历次热修** 的全部代码改动一并收回本地审查分支工作区，在**已修 bug 的基线**上做整批审查与优化。

**不是** `stash pop` 回到「修 bug 之前」的旧 WIP。

**不** amend 已推送的 `draft_commit`；热修是新提交。日后 `publish_final` 对**整段系列**（B 与 H…）做 revert（新→旧），再推最终审查版 F。

## 编排顺序

1. [[../../feature-skills/确认共享分支与工作树/SKILL.md]]（记录 `temp_branch`、`draft_commit`）
2. [[../../feature-skills/stash审查WIP/SKILL.md]]（仅保护切分支；事后默认 drop，不作审查基线）
3. [[../../feature-skills/切共享分支并对齐远端/SKILL.md]]
4. （完成代码/依赖修复）
5. [[../../feature-skills/提交热修并多远端push/SKILL.md]]
6. [[../../feature-skills/收回草稿与热修区间到审查工作区/SKILL.md]]
7. [[../../feature-skills/输出验收报告/SKILL.md]]

## 前置

- 策略 `phase=hotfix_during_review`
- `shared_branch`、`commit_message`、`temp_branch`、`draft_commit` 齐备
- `series_tip` 默认为热修后共享分支 tip

## 检查点

### 🔴 CHECKPOINT-HOTFIX-STASH · 🛑 STOP

stash 前确认：`temp_branch`、脏文件摘要；并告知：**回来后审查基线将重建为草稿+热修整包，默认不 pop 此 stash。**

### 🔴 CHECKPOINT-HOTFIX-PUSH · 🛑 STOP

push 前确认：`commit_message`、`push_remotes`、`force=false`、非 amend 草稿。

### 🔴 CHECKPOINT-RECLAIM-SERIES · 🛑 STOP

收回前展示：`git log --oneline <draft>^..<series_tip>`、确认无他人夹杂提交（或用户已授权范围）、将执行 `checkout -B temp tip` + `reset draft^`（mixed）。

## 失败短路

| 条件 | 动作 |
| --- | --- |
| 缺 `commit_message` / `draft_commit` | STOP |
| 用户要 amend / force | STOP |
| 系列 tip 含他人提交未确认 | STOP |
| 仅一侧 remote 失败 | 报告；不回滚已成功侧 |

## 输出

`orchestration`=`hotfix_during_review` | `hotfixSha` | `draftSha` | `seriesTip` | `reviewBase` | `tempBranch` | `remotesPushed[]` | `status`

## 使用示例

```text
审查中 Jenkins 缺 js-yaml。修到 develop 并双推后，把草稿+热修整包收回 temp-review 继续审查优化。
使用 $编排-审查中热修草稿。
```
