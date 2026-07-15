---
name: 按顺序cherry-pick到其他分支
description: 当需要把已落地的一个或多个 commit 按从旧到新顺序复制到另一分支（单挑、列表或多连续区间）、禁止用 stash/reset 掏已提交改动、处理 cherry-pick 冲突 continue/abort/quit，以及默认不 push、仅在明确要求时删源分支时使用。触发词：cherry-pick、按序捡提交、挪到另一分支、不要 stash 搬 commit。
---

# 目标

把**已经落地的 commit**按顺序应用到目标分支，生成新的 commit；不卷进当前分支杂乱历史，也不用 stash 冒充“搬运提交”。

## 何时使用

- 只要某一次或某几次已提交改动，落到 `main` / `develop` 等另一分支
- 临时分支历史“脏”，只需其中连续或离散的若干 commit
- 用户说「cherry-pick」「挪到另一分支」「按顺序捡提交」「不要 stash 搬已落地 commit」

## 何时不要使用

- 改动**尚未 commit**（走提交工作流，不是本 skill）
- 用户明确要求整支 `merge` / `rebase` / 交互式改写历史
- 需要拆改单个 commit 内容或 `rebase -i`（超出本 skill）

## 输入契约

必须解析（缺失则 **🛑 STOP** 询问，不猜测）：

| 字段 | 说明 |
| --- | --- |
| `repo` | 仓库绝对路径 |
| `source_branch` | 源分支（含待挑 commit） |
| `target_branch` | 目标分支 |
| `commits` | hash 列表，或连续区间的 oldest…newest |
| `pull_target` | 是否先 `pull`（默认 `false`） |
| `push` | 是否 push（默认 `false`） |
| `delete_source_branch` | 是否删源分支（默认 `false`） |

## 硬约束

1. **工作树必须干净**：有未提交改动 → 列出脏文件并 **🛑 STOP**；**禁止**用 stash/reset 把已落地 commit「掏出来」再 pop。
2. **顺序固定**：始终 **old → new**；连续区间使用 `oldest^..newest`（**含** oldest 与 newest）。
3. **先清单后执行**：见下方 🔴 CHECKPOINT-1。
4. **冲突不擅自 abort**：见 🔴 CHECKPOINT-2。
5. **默认不 push**；**默认不删源分支**（见 🔴 CHECKPOINT-3）。
6. **不**做 `rebase -i`、强推、改写无关历史。

## 核心流程

1. **输入**：解析 `repo` / 源分支 / 目标分支 / 待挑 commits。**输出**：字段表或缺字段问题。
2. **输入**：`git status --short`。**输出**：干净或脏文件列表。
   - 脏且用户要正式合入 → **🛑 STOP**（硬约束 1）。详见 [[references/为何不用stash.md]]。
   - 脏且用户只要**历史沙盒测试** → worktree 沙盒，见 [[references/Windows-worktree与长路径.md]]（Windows：短路径 + `git -c core.longpaths=true`）。
3. **输入**：源历史上的待挑 commits。**输出**：`hash + subject` 表（old→new）。

### 🔴 CHECKPOINT-1 · 🛑 STOP：确认待挑清单

在 `git checkout` / `git cherry-pick` **之前**必须展示清单并等到用户确认（或用户消息已给出完整 hash 列表）。未确认 → 禁止执行 cherry-pick。`status=awaiting_confirm`。

4. **输入**：已确认清单。**输出**：当前分支为目标分支（或沙盒分支）。
   - 正式：`git checkout <target_branch>`；仅 `pull_target=true` 时再 `git pull`。
   - 沙盒：在 worktree 内操作，不切换主工作区脏树。
5. **输入**：确认后的 commits。**输出**：cherry-pick 进程结果。详见 [[references/多提交与冲突手册.md]]。
   - 单个：`git cherry-pick <hash>`
   - 离散：`git cherry-pick <h1> <h2> ...`（已 old→new）
   - 连续：`git cherry-pick <oldest>^..<newest>`

### 🔴 CHECKPOINT-2 · 🛑 STOP：冲突三叉

若冲突：`status=conflict`，报告冲突文件，**停止**。仅在用户选定后执行其一：

| 用户选择 | 命令 |
| --- | --- |
| 继续 | 解决冲突 → `git add <files>` → `git cherry-pick --continue` |
| 全撤 | `git cherry-pick --abort` |
| 保留已成功并退出 | `git cherry-pick --quit` |

**禁止**在无人授权时执行 `--abort`。

6. **输入**：cherry-pick 结束。**输出**：`git log -5 --oneline` + `git status` 验收。`status=done`。

### 🔴 CHECKPOINT-3 · 🛑 STOP：push / 删源分支

仅当用户**明确**要求时：

- `git push <remote> <target_branch>`
- `git branch -d <source_branch>`（仅当目标分支已含所需变更）

默认跳过。完整叙事见 [[template/示例-临时分支到main.md]]；清单见 [[assets/执行检查清单.md]]。

## 与 merge 的边界

| 场景 | 做法 |
| --- | --- |
| 只要部分或指定顺序的 commit | **本 skill（cherry-pick）** |
| 用户明确说整支 merge | 尊重 merge，不强行改 cherry-pick |
| 「合并到 main 但只要某几次提交」 | 仍走本 skill |

## 输出契约

每轮必须给出：

- `currentUnderstanding`：源/目标/挑中的 commits
- `worktreeClean`：是否干净
- `plannedCommand`：将执行或已执行的命令
- `status`：`blocked` | `awaiting_confirm` | `in_progress` | `conflict` | `done`
- `nextAction`：下一步（含是否等待用户）

## 使用示例

```text
源分支 auto-optimize/20260715-1605-translate，目标 main，
把相对 main 超前的提交按旧到新 cherry-pick 过去；先不要 push。
工作树干净后再执行。使用 $按顺序cherry-pick到其他分支。
```

## Red flags（不要做）

| 想法 | 现实 |
| --- | --- |
| 「先 stash 再切分支 pop」 | 已落地 commit 用 cherry-pick，不是 stash |
| 「从新到旧挑」 | 会破坏依赖；必须 old→new |
| 「区间写成 newest^..oldest」 | 错误；oldest 在左 |
| 「冲突我直接 abort」 | 须过 CHECKPOINT-2 |
| 「合并完顺便 push/删分支」 | 须过 CHECKPOINT-3 |
| 「跳过清单确认直接 cherry-pick」 | 须过 CHECKPOINT-1 |
