---
name: stash审查WIP
description: 当审查临时分支上有未提交改动，需要临时离开去共享分支热修前，先 stash（含 untracked）保护切分支时使用。热修返回后默认 drop，不作审查基线。
---

# 核心任务

切去 `shared_branch` 热修前，把当前脏工作区 stash 起来，避免 checkout 丢文件。

**重要：** 热修完成后审查基线由 [[../收回草稿与热修区间到审查工作区/SKILL.md]] **重建为草稿+热修整包**；本 stash **默认 drop**，不要 `stash pop` 成「修 bug 前」的旧审查状态。

## 前置

- 当前在 `temp_branch`
- 已过 🔴 CHECKPOINT-HOTFIX-STASH

## 命令

```bash
git -C "<repo>" branch --show-current
git -C "<repo>" status --short
git -C "<repo>" stash push -u -m "wip: review before hotfix (will drop after reclaim)"
```

干净则 `stashed=false`。

## 输出

`tempBranch` | `stashed` | `stashMessage` | `willDropAfterReclaim`=`true`

## 使用示例

```text
切 develop 前先 stash；回来会整包收回，不 pop 这个 stash。
使用 $stash审查WIP。
```
