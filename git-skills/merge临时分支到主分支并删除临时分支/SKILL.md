---
name: merge临时分支到主分支并删除临时分支
description: 当需要把整条临时/功能分支完整合入主分支（main/master/develop）、验收后删除该临时分支，且不要用 cherry-pick 只挑部分提交时使用。触发词：merge 临时分支、合进 main、删掉临时分支、收工合并。不要用于：只要部分 commit（改用按顺序cherry-pick）、尚未 commit 的本地改动、用户只要开 PR 不要本地 merge、交互式 rebase/-i。
---

# 目标

把**整条**临时分支 merge 进目标主分支，验收后**删除**该临时分支；默认不 push。

## 何时使用

- 临时分支工作已完成，要整支合入 `main` / `master` / `develop`
- 用户说「合并到 main 并删掉临时分支」「不需要这条临时分支了」
- 相对主分支是连续超前历史，**不需要**只挑其中几次提交

## 何时不要使用

- 只要部分 commit → 用 [[../按顺序cherry-pick到其他分支/SKILL.md]]
- 改动尚未 commit
- 用户只要 Push + PR，不要本地 merge
- 用户明确要 `rebase -i` / 丢弃整支工作

## 输入契约

缺必填 → **🛑 STOP** 追问，禁止猜测：

| 字段 | 必填 | 默认 |
| --- | --- | --- |
| `repo` | 是 | — |
| `source_branch` | 是（临时分支） | — |
| `target_branch` | 是 | `main`（若存在；否则询问） |
| `pull_target` | 否 | `false` |
| `merge_mode` | 否 | `--no-ff`（保留合并点；用户要求快进则 `--ff-only`） |
| `push` | 否 | `false` |
| `delete_source_branch` | 否 | `true`（本 skill 默认删；用户说保留则 `false`） |

## 硬约束

1. 工作树必须干净；脏 → 列路径 **🛑 STOP**。
2. 先过 🔴 CHECKPOINT-1（确认源/目标与将合入的 commit 范围摘要），再 checkout/merge。
3. 冲突只走 🔴 CHECKPOINT-2；禁止擅自 `--abort`。
4. 删除临时分支只走 🔴 CHECKPOINT-3；merge 未成功验收前禁止删。
5. 默认不 push；push 须用户明确授权（🔴 CHECKPOINT-4）。
6. 禁止用 stash/cherry-pick 冒充「整支合并」；禁止 `rebase -i`、强推。

## 失败模式（三段式）

| 触发条件 | 一线修复 | 仍失败兜底 |
| --- | --- | --- |
| `git status --short` 非空 | `status=blocked`，列脏路径，**🛑 STOP** | 用户仍要脏树 merge → 拒绝 |
| 缺 `source_branch` / `target_branch` | 追问 | 拒答 → `blocked` 结束 |
| `target_branch` 不存在 | 列本地分支请用户指定 | 仍无 → **🛑 STOP** |
| `source_branch` 不存在 | 列分支/`git branch -a` | 仍无 → **🛑 STOP** |
| `checkout` 失败 | 查分支名与 worktree 占用 | 仍失败 → `blocked` |
| merge 冲突 | 进入 🔴 CHECKPOINT-2 | 无用户选择 → 保持冲突，禁擅自 abort |
| `branch -d` 因未合入拒绝 | 先确认 merge 已在目标分支；必要时报告 `git branch --merged` | 用户明确强制删 → 仅在确认后用 `-D`（须再授权） |
| Windows 路径过长（worktree 场景） | 短路径 + `git -c core.longpaths=true` | 见 cherry-pick skill 的 Windows 说明；正式 merge 优先在主仓干净树执行 |

## 核心流程

1. 解析 `repo` / `source_branch` / `target_branch`。**输出**：字段表。
2. `git status --short` → 必须干净，否则 **🛑 STOP**。
3. 摘要将合入范围：`git log --oneline --reverse <target>..<source>`（条数与 tip）。

### 🔴 CHECKPOINT-1 · 🛑 STOP：确认合并范围

展示：源分支、目标分支、`target..source` 提交列表（或「共 N 个，首尾 hash」）、`merge_mode`、是否删源分支、是否 push。未确认 → 禁止 merge。`status=awaiting_confirm`。

4. `git checkout <target_branch>`。仅 `pull_target=true` 时 `git pull`。
5. 执行 merge：

| 模式 | 命令 |
| --- | --- |
| 默认（保留合并提交） | `git merge --no-ff <source_branch>` |
| 用户要求仅快进 | `git merge --ff-only <source_branch>` |
| 用户明确允许 ff 或建 merge commit | `git merge <source_branch>` |

### 🔴 CHECKPOINT-2 · 🛑 STOP：冲突

| 用户选择 | 命令 |
| --- | --- |
| 继续 | 解决 → `git add <files>` → `git commit`（结束 merge） |
| 放弃整次 merge | `git merge --abort` |

**禁止**在无人授权时 `--abort`。

6. 验收：`git log -5 --oneline`、`git status`；确认源 tip 已在目标历史中（如 `git merge-base --is-ancestor <source_tip> HEAD`）。`status=merged`。

### 🔴 CHECKPOINT-3 · 🛑 STOP：删除临时分支

默认 `delete_source_branch=true`，但仍须展示将删分支名并获确认（用户已说「不要临时分支了」可视为确认）。

```bash
git branch -d <source_branch>
```

`-d` 失败且用户明确要求强制删除 → 再确认后 `git branch -D <source_branch>`。若该分支仍被其他 worktree 占用 → 先处理 worktree。

### 🔴 CHECKPOINT-4 · 🛑 STOP：push

仅用户明确要求：`git push <remote> <target_branch>`。若还要删远端临时分支：`git push <remote> --delete <source_branch>`（须单独确认）。默认跳过。

## 与 cherry-pick 的边界

| 场景 | 用哪个 |
| --- | --- |
| 整支合入 + 删临时分支 | **本 skill** |
| 只要部分/指定顺序 commit | [[../按顺序cherry-pick到其他分支/SKILL.md]] |
| 用户口头「合并」但清单只要中间几次 | cherry-pick |

## 输出契约（每轮必出）

`currentUnderstanding` | `worktreeClean` | `plannedCommand` | `status`∈{`blocked`,`awaiting_confirm`,`in_progress`,`conflict`,`merged`,`done`} | `nextAction`

## 使用示例

```text
当前在 auto-optimize/20260715-1945-cherry-pick-darwin，请 merge 进 main，
我不需要这条临时分支了；先不要 push。
使用 $merge临时分支到主分支并删除临时分支。
```

## Red flags（不要做）

| 不要 | 要 |
| --- | --- |
| 用 cherry-pick 代替整支 merge | `git merge` |
| 脏树强行 merge | **🛑 STOP** 先清干净 |
| merge 未验收就 `branch -D` | 先验收，再过 CHECKPOINT-3 |
| 擅自 push / 删远端分支 | 过 CHECKPOINT-4 |
| 跳过合并范围确认 | 过 CHECKPOINT-1 |
