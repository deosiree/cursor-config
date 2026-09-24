---
name: 切共享分支并对齐远端
description: 当热修前需要 checkout 共享分支（默认 develop）并与 origin/upstream 对齐到最新 tip 时使用。
---

# 核心任务

切到 `shared_branch`，fetch，并合入远端最新，使本地 tip 可基于最新再提交热修。

## 前置

- 审查 WIP 已 stash 或确认干净
- `shared_branch` 已解析

## 命令

```bash
git -C "<repo>" checkout "<shared_branch>"
git -C "<repo>" fetch origin "<shared_branch>"
# 若 remote 存在 upstream：
git -C "<repo>" fetch upstream "<shared_branch>"

git -C "<repo>" status -sb
# 与 origin 对齐（快进或 merge，禁 force）
git -C "<repo>" pull --ff-only origin "<shared_branch>" 2>nul
# 若 upstream 领先本地：merge upstream/<shared_branch>（保留历史，禁 force）
git -C "<repo>" merge upstream/<shared_branch> -m "Merge branch '<shared_branch>' of <upstream> into <shared_branch>"
```

若 `pull --ff-only` 失败：改用普通 `git pull origin` 或先报告分叉，等用户确认 merge 策略；**禁止** rebase -i / force。

## 验收

```bash
git -C "<repo>" rev-parse --short HEAD
git -C "<repo>" rev-parse --short origin/<shared_branch>
# upstream 存在时一并核对
```

## 输出

`sharedBranch` | `headSha` | `originSha` | `upstreamSha` | `aligned`

## 边界

- 不在此节点提交业务修复
- 不 push

## 使用示例

```text
WIP 已 stash，对齐 develop 的 origin 与 upstream。使用 $切共享分支并对齐远端。
```
