---
name: 分析-沙盒现状
description: 当需要先摸清主仓/沙盒的 worktree、分支、脏树、stash 与目标路径占用情况，再决定创建或删除沙盒时使用。
---

# 核心任务

产出可路由的现状快照，不执行创建或删除。

## 何时触发

- 父级已激活，但尚未选定创建/删除编排
- 用户只说「看看现在有哪些沙盒」

## 必跑命令（在 `repo` 主仓）

```bash
git rev-parse --show-toplevel
git branch --show-current
git status -sb
git worktree list
git stash list
```

若用户给出了候选 `sandbox_path` / `sandbox_branch`，额外检查：

- 路径是否已在 `worktree list` 中
- 分支是否已存在（本地/远端）
- 若路径存在：该树 `git status --short`、相对 `base_branch` 是否已合入（`git merge-base --is-ancestor <sandbox_tip> <base>`）

## 输出（必填 + 示例值）

```text
repoRoot=F:/Documents/Repertory/Sieyuan/nebula/apex_dev
currentBranch=develop
mainClean=true
worktrees=[apex_dev@develop, apex_menu-io@menu-io, apex_devmgr@devmgr?]
stashHead=stash@{0}: 显示设备的地方增加场站名称...
targetPathExists=false
targetBranchExists=false
riskFlags=
```

## 边界

- 只分析，不 `worktree add/remove`，不改 stash。
- 下一步交给 [[../策略-创建或删除/SKILL.md]]。

## 使用示例

```text
先看一下 apex_dev 现在有哪些 worktree 和 stash，再决定能不能开 devmgr。
使用 $分析-沙盒现状。
```
