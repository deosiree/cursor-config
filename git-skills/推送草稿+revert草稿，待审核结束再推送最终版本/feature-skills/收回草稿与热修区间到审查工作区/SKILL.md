---
name: 收回草稿与热修区间到审查工作区
description: 当需要把「原始草稿 + 历次热修」整段提交的改动一并收回临时审查分支工作区（mixed reset 到草稿父提交）时使用。调用方可以是 hotfix_during_review（热修后整包收回）或 revert_and_reclaim（推 revert 前回收）。不是 stash pop 回旧 WIP。
---

# 核心任务

以共享分支上 **草稿系列 tip**（含原始草稿 B 与其后热修 H…）为内容来源，把临时审查分支指到该 tip，再 **mixed reset 到草稿父提交 A**，使工作区 = `A..tip` 的全部改动。

- **hotfix 路径**：tip 含已推热修；审查基线是已修 bug 的整包，不是热修前旧 stash。
- **revert_and_reclaim 路径**：须在推 `revert:` **之前**调用；`series_tip` = **`pre_revert_tip`**（revert 前 tip）。若误用 revert 之后的 tip，工作区会空或只剩无关 diff。

## 前置

- `draft_commit`（系列起点 B）已知
- `series_tip` 已知：默认当前 `shared_branch` tip / 刚推上的 `hotfixSha` / `pre_revert_tip`（须祖先包含 B）
- `temp_branch` 已知
- hotfix 路径：热修已 push（至少一侧 remote 成功）
- revert_and_reclaim 路径：远端尚未对本系列完成回滚（或 tip 仍指向含系列内容的 pre-revert SHA）
- 已过 🔴 CHECKPOINT-RECLAIM-SERIES
## 区间定义

```text
A  = draft_commit^     # 推草稿前的父提交
B  = draft_commit      # 原始草稿
H… = B 之后到 series_tip 的热修提交（可多枚）
tip = series_tip       # 通常即 hotfix 后的 develop tip（若中间无他人提交）
```

若 `series_tip` 上夹有**他人无关提交**：STOP，请用户确认 tip 或显式给出「只含本系列」的 tip SHA，禁止把别人的提交 reset 进审查工作区。

## 命令

```bash
# 1) 确认区间
git -C "<repo>" merge-base --is-ancestor <draft_commit> <series_tip>   # 必须成立
git -C "<repo>" log --oneline <draft_commit>^..<series_tip>

# 2) 审查分支快进到系列 tip（内容含 B+H）
git -C "<repo>" checkout -B "<temp_branch>" "<series_tip>"

# 3) mixed reset 到草稿父提交 → 工作区留下 A..tip 全部改动
git -C "<repo>" reset "<draft_commit>^"
# 禁止 reset --hard

# 4) 热修前为切分支而做的 stash：默认 drop（审查基线已重建）
# 仅当用户明确要求保留「仅本地、从未上远端」的额外改动时才 stash pop
git -C "<repo>" stash list
# 默认：git stash drop stash@{0}  （对应本次 hotfix 前那次 wip stash；须核对 message）
```

## 验收

```bash
git -C "<repo>" branch --show-current   # == temp_branch
git -C "<repo>" rev-parse HEAD          # == draft_commit^ （A）
git -C "<repo>" status --short          # 应有大量改动 = 草稿+热修合并效果
```

`draftSha` 记录仍为 B；另记 `seriesTip`、`reviewBase=A`。

## 失败模式

| 条件 | 处理 |
| --- | --- |
| tip 不含 draft 祖先 | STOP |
| tip 含他人提交且用户未确认 | STOP |
| 用户坚持 pop 旧 stash | 警告会与整包 diff 叠加；仅明确授权后 pop |
| 误用 hard reset | 禁止 |

## 输出

`tempBranch` | `reviewBase` | `seriesTip` | `draftSha` | `commitsInSeries[]` | `dirtyCount` | `oldStashDropped`

## 边界

- 不 push；不更新远端
- 不在此节点 `git revert`（那是 publish / revert_and_reclaim 的后续步骤）
- 「收回」= mixed reset 取消本地提交指针，**不是** `git revert` 生成反向提交
- `series_tip` **必须是 revert 前 tip**；revert 后再 reclaim 时仍应传入当时记下的 `pre_revert_tip`，禁止用已回滚后的共享 tip

## 使用示例

```text
草稿 f2e80622，热修 tip 0e14f561。把 A..tip 整包收回 temp-review 工作区继续审查。
使用 $收回草稿与热修区间到审查工作区。
```

```text
phase=revert_and_reclaim：先用 pre_revert_tip 收回 A..tip，再推 revert:。
使用 $收回草稿与热修区间到审查工作区。
```
