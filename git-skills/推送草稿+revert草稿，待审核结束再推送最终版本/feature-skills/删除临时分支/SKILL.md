---
name: 删除临时分支
description: 当最终版已推上共享分支并验收后，需要删除仅用于审查的本地临时分支时使用。
---

# 核心任务

删除本地 `temp_branch`；默认不删远端（临时分支通常从未 push）。

## 前置

- 已过 🔴 CHECKPOINT-DELETE-TEMP
- 最终版已在 `shared_branch` 历史中（如 `git merge-base --is-ancestor <final_commit> <shared_branch>`）
- 当前不要停在即将删除的分支上 → 先 `checkout <shared_branch>`

## 命令

```bash
git -C "<repo>" checkout "<shared_branch>"
git -C "<repo>" branch -d "<temp_branch>"
```

若 `-d` 因「未完全合并」拒绝：先复核最终内容是否已通过 cherry-pick 上共享分支；用户明确强制删时再用：

```bash
git -C "<repo>" branch -D "<temp_branch>"
```

## 硬约束

- 禁止删除 `develop` / `main` / `master` / 当前共享分支名
- 默认不 `push --delete` 远端临时分支（若曾误 push，须单独确认）

## 输出

`tempBranch` | `deleted` | `usedForceDelete`

## 使用示例

```text
最终版已在 develop，删除 temp/review-after-draft。使用 $删除临时分支。
```
