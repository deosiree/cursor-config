---
name: 按顺序cherry-pick到其他分支
description: 当需要把已落地的一个或多个 commit 按从旧到新顺序复制到另一分支（单挑、列表或多连续区间）、禁止用 stash/reset 掏已提交改动、处理 cherry-pick 冲突 continue/abort/quit，以及默认不 push、仅在明确要求时删源分支时使用。
---

# 目标

把**已经落地的 commit**按顺序应用到目标分支，生成新的 commit；不卷进当前分支杂乱历史，也不用 stash 冒充“搬运提交”。

## 何时使用

- 只要某一次或某几次已提交改动，落到 `main` / `develop` 等另一分支
- 临时分支历史“脏”，只需其中连续或离散的若干 commit
- 用户说「cherry-pick」「挪到另一分支」「按顺序捡提交」「不要 stash 搬已落地 commit」

## 何时不要使用

- 改动**尚未 commit**（应走提交/可选 stash 工作流，不是本 skill）
- 用户明确要求整支 `merge` / `rebase` / 交互式改写历史
- 需要拆改单个 commit 内容或 `rebase -i`（超出本 skill）

## 输入契约

尽量收集：

| 字段 | 说明 |
| --- | --- |
| `repo` | 仓库绝对路径 |
| `source_branch` | 源分支（含待挑 commit） |
| `target_branch` | 目标分支 |
| `commits` | hash 列表，或连续区间的 oldest…newest |
| `pull_target` | 是否先 `pull` 目标分支（默认否，用户要求再做） |
| `push` | 是否 push（**默认否**） |
| `delete_source_branch` | 是否删除源分支（**默认否**；用户明确说不要临时分支再做） |

缺 `target_branch` 或无法解析待挑 commit 时：**停下询问**，不猜测。

## 硬约束

1. **工作树必须干净**：有未提交改动 → 列出脏文件并停下；**禁止**用 stash/reset 把已落地 commit「掏出来」再 pop。
2. **顺序固定**：始终 **old → new**；连续区间使用 `oldest^..newest`（**含** oldest 与 newest）。
3. **先清单后执行**：展示 `hash + subject` 表，经用户确认（或用户已给出完整 hash 列表）后再 cherry-pick。
4. **冲突不擅自 abort**：停下指导解决；用户选定后再 `--continue` / `--abort` / `--quit`。
5. **默认不 push**；**默认不删源分支**。
6. **不**做 `rebase -i`、强推、改写无关历史。

## 核心流程

1. 解析 `repo` / 源分支 / 目标分支 / 待挑 commits。
2. `git status`：非干净 → 停下（见硬约束 1）。详见 [[references/为何不用stash.md]]。
   - 若用户只要**历史沙盒测试实跑**（主仓仍脏）：用独立 worktree，见 [[references/Windows-worktree与长路径.md]]（Windows 须短路径 + 临时 `-c core.longpaths=true`）。
3. 列出待挑 commits（old→new），请用户确认。
4. `git checkout <target_branch>`；仅当用户要求时再 `git pull`。在 worktree 沙盒内则 checkout/切到沙盒分支即可。
5. 按形态执行（详见 [[references/多提交与冲突手册.md]]）：
   - 单个：`git cherry-pick <hash>`
   - 离散多个：`git cherry-pick <h1> <h2> ...`（已按旧→新排好）
   - 连续区间：`git cherry-pick <oldest>^..<newest>`
6. 若冲突：报告冲突文件 → 等人解决并 `git add` → `git cherry-pick --continue`；或按用户选择 `--abort`（全撤）/ `--quit`（保留已成功）。
7. 验收：`git log` / `git status` 确认新提交已在目标分支。
8. 可选收尾（须用户明确）：`git push`；`git branch -d <source_branch>`（仅在目标分支已含所需变更后）。

完整命令叙事见 [[template/示例-临时分支到main.md]]；执行清单见 [[assets/执行检查清单.md]]。

## 与 merge 的边界

| 场景 | 做法 |
| --- | --- |
| 只要部分或指定顺序的 commit | **本 skill（cherry-pick）** |
| 整支线性合入且用户明确说 merge | 可提示 merge，**不要强行改用本 skill 替代用户口径** |
| 用户说「合并到 main 但只要某几次提交」 | 仍走本 skill |

## 输出契约

每轮至少给出：

- `currentUnderstanding`：源/目标/挑中的 commits
- `worktreeClean`：是否干净
- `plannedCommand`：将执行或已执行的 cherry-pick 命令
- `status`：`blocked` | `awaiting_confirm` | `in_progress` | `conflict` | `done`
- `nextAction`：下一步（含是否等待用户）

## 使用示例

```text
源分支 auto-optimize/20260715-1605-translate，目标 main，
把相对 main 超前的提交按旧到新 cherry-pick 过去；先不要 push。
工作树干净后再执行。使用 $按顺序cherry-pick到其他分支。
```

## Red flags

| 想法 | 现实 |
| --- | --- |
| 「先 stash 再切分支 pop」 | 已落地 commit 用 cherry-pick，不是 stash |
| 「从新到旧挑」 | 会破坏依赖；必须 old→new |
| 「区间写成 newest^..oldest」 | 错误；oldest 在左 |
| 「冲突我直接 abort」 | 须用户选择；默认停下等人 |
| 「合并完顺便 push/删分支」 | 默认不做，须明确授权 |
