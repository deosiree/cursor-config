---
name: 按顺序cherry-pick到其他分支
description: 当需要把已落地的一个或多个 commit 按从旧到新顺序复制到另一分支（单挑、列表或多连续区间）、禁止用 stash/reset 掏已提交改动、处理 cherry-pick 冲突 continue/abort/quit，以及默认不 push、仅在明确要求时删源分支时使用。触发词：cherry-pick、按序捡提交、挪到另一分支、不要 stash 搬 commit。
---

# 目标

把已落地 commit 按序应用到目标分支并生成新 commit；禁止 stash 搬运已落地提交。

## 何时使用

- 只要部分已提交改动落到 `main`/`develop`
- 临时分支历史杂乱，只需其中若干 commit
- 用户说 cherry-pick / 按序捡提交 / 挪到另一分支 / 不要 stash 搬 commit

## 何时不要使用

- 改动尚未 commit
- 用户明确要整支 `merge` / `rebase` / `rebase -i`

## 输入契约

缺任一必填 → **🛑 STOP** 追问，禁止猜测：

| 字段 | 必填 | 默认 |
| --- | --- | --- |
| `repo` | 是 | — |
| `source_branch` | 是 | — |
| `target_branch` | 是（正式）/沙盒测试分支名 | — |
| `commits` | 是（列表或 oldest…newest） | — |
| `pull_target` | 否 | `false` |
| `push` | 否 | `false` |
| `delete_source_branch` | 否 | `false` |

## 硬约束

1. 正式合入时工作树必须干净；脏 → 列路径 **🛑 STOP**；禁止 stash/reset 掏已落地 commit。
2. 顺序必须 old→new；区间必须 `oldest^..newest`（含两端）。
3. 先过 🔴 CHECKPOINT-1，再 checkout/cherry-pick。
4. 冲突只走 🔴 CHECKPOINT-2；禁止擅自 `--abort`。
5. push/删源分支只走 🔴 CHECKPOINT-3。
6. 禁止 `rebase -i`、强推、改写无关历史。

## 失败模式（三段式）

| 触发条件 | 一线修复 | 仍失败兜底 |
| --- | --- | --- |
| 正式合入且 `git status --short` 非空 | `status=blocked`，列脏路径，**🛑 STOP** | 仍要脏树挑 → 拒绝；可改沙盒 |
| 缺 `target_branch`/commits | 逐字段追问 | 拒答 → `blocked` 结束 |
| hash `rev-parse` 失败 | `git log --oneline <source>` 重列 | 仍无效 → **🛑 STOP** |
| `checkout` 失败 | 查 `git branch -a` | 仍失败 → `blocked` |
| Windows `Filename too long` | 短路径如 `f:\wt\cp` + `git -c core.longpaths=true`；prune 残局 | 放弃沙盒，改干净主树；见 [[references/Windows-worktree与长路径.md]] |
| cherry-pick 冲突 | 🔴 CHECKPOINT-2 | 无用户选择 → 保持冲突，禁擅自 abort |
| `--continue` 因未 add 失败 | `git add <files>` 后再 `--continue` | 改 abort/quit |
| 新→旧或区间反写 | 纠正后回 🔴 CHECKPOINT-1 | 坚持反序 → 拒绝 |

详见 [[references/为何不用stash.md]]。

## 核心流程

1. 解析输入 → 输出字段表。2. `git status --short` → 干净/脏列表（脏正式合入则 STOP）。3. 列 `hash subject`（old→new）。

### 🔴 CHECKPOINT-1 · 🛑 STOP：确认清单

未确认（且用户未给出完整 hash 列表）→ 禁止 cherry-pick。`status=awaiting_confirm`。

4. 正式：`git checkout <target_branch>`；仅 `pull_target=true` 时 `git pull`。沙盒：不切换主脏树，在 worktree 内操作。
5. 按形态执行（[[references/多提交与冲突手册.md]]）：

| 形态 | 必须执行的命令 |
| --- | --- |
| 单挑 | `git cherry-pick <hash>` |
| 离散 | `git cherry-pick <h_old> … <h_new>` |
| 连续 | `git cherry-pick <oldest>^..<newest>` |
| 沙盒（Windows） | `git -c core.longpaths=true worktree add -b <test_branch> <短路径> <base>` → 在该目录 `git -c core.longpaths=true cherry-pick …` → 测完 `worktree remove --force` + `branch -D <test_branch>` |

### 🔴 CHECKPOINT-2 · 🛑 STOP：冲突

| 用户选择 | 命令 |
| --- | --- |
| 继续 | 解决 → `git add <files>` → `git cherry-pick --continue` |
| 全撤 | `git cherry-pick --abort` |
| 保留已成功 | `git cherry-pick --quit` |

6. 验收：`git log -5 --oneline` + `git status` → `status=done`。

### 🔴 CHECKPOINT-3 · 🛑 STOP：push/删源

仅用户明确要求：`git push <remote> <target_branch>`；`git branch -d <source_branch>`（目标已含变更后）。默认跳过。

模板 [[template/示例-临时分支到main.md]]；清单 [[assets/执行检查清单.md]]。

## 与 merge 的边界

| 场景 | 做法 |
| --- | --- |
| 只要部分/指定顺序 commit | 本 skill |
| 用户明确整支 merge | 尊重 merge |
| 「合并但只要某几次」 | 本 skill |

## 输出契约（每轮必出）

`currentUnderstanding` | `worktreeClean` | `plannedCommand` | `status`∈{`blocked`,`awaiting_confirm`,`in_progress`,`conflict`,`done`} | `nextAction`

## 使用示例

```text
源分支 auto-optimize/…，目标 main，相对 main 超前提交 old→new cherry-pick；不 push。
脏树先停。使用 $按顺序cherry-pick到其他分支。
```

## Red flags（不要做）

| 不要 | 要 |
| --- | --- |
| stash 搬已落地 commit | cherry-pick |
| 新→旧 / `newest^..oldest` | old→new / `oldest^..newest` |
| 擅自 `--abort` | 过 CHECKPOINT-2 |
| 擅自 push/删分支 | 过 CHECKPOINT-3 |
| 跳过清单确认 | 过 CHECKPOINT-1 |
