---
name: 分析-流程现状
description: 当进入本套件任一阶段前，需要弄清当前所在分支、草稿是否已推、临时分支/最终提交是否存在、工作树是否干净时使用。
---

# 核心任务

采集仓库事实，输出可供策略判定的现状快照；不执行 push / reset / revert。

## 输入 / 前置

- `repo`（必填）
- 可选：用户口头提到的 `shared_branch` / `temp_branch` / `draft_commit`

## 采集命令（只读）

```bash
git -C "<repo>" status -sb
git -C "<repo>" branch --show-current
git -C "<repo>" status --short
git -C "<repo>" log -5 --oneline
git -C "<repo>" branch --list "temp/*"
git -C "<repo>" branch --list "temp-*"
# remotes
git -C "<repo>" remote
# 若已知远端：
git -C "<repo>" rev-parse --abbrev-ref @{upstream} 2>nul
git -C "<repo>" log -1 --format="%H %s" <shared_branch>
```

## 输出字段

| 字段 | 含义 |
| --- | --- |
| `currentBranch` | 当前检出 |
| `worktreeClean` | `git status --short` 是否为空 |
| `sharedBranchTip` | 共享分支 tip（若可解析） |
| `draftShaKnown` | 对话或用户是否已提供草稿 SHA |
| `tempBranchExists` | 临时审查分支是否存在（`temp/*` 或 `temp-*`） |
| `onTempReviewBranch` | 当前是否在审查临时分支 |
| `hasUpstreamRemote` | 是否存在 `upstream` remote（热修默认双推） |
| `finalShaKnown` | 是否已有最终审查提交 |
| `aheadBehindHint` | 相对 upstream 的 ahead/behind 摘要（若有） |
| `riskFlags` | 如 `on_shared_with_dirty`、`missing_draft_sha`、`dirty_on_temp_needs_stash` |

## 边界

- 不 `pull` / `push` / `reset` / `revert`
- 不猜测未给出的草稿 SHA；标 `draftShaKnown=false`

## 使用示例

```text
repo 在 F:/proj，我想走草稿审查流程，先看现在卡在哪。
使用 $分析-流程现状。
```
