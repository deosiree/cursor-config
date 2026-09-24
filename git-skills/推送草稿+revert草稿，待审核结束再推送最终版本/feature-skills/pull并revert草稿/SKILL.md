---
name: pull并revert草稿
description: 当发布最终版时，需要在共享分支 pull 后，按新→旧 revert「原始草稿 + 历次热修」整段系列（保留历史）时使用。
---

# 核心任务

切到共享分支，拉取远端，对**草稿系列**执行 `git revert`（不是只 revert 第一枚草稿）。

系列 = `draft_commit`（B）及其后属于本需求的热修提交 H…，直到用户确认的 `series_tip`（若 tip 上无他人提交，可用当前共享 tip 之前本系列最后一枚）。

## 前置

- `draft_commit` 精确已知
- `commitsInSeries[]` 已知（新→旧），或可由 `git log --oneline <draft>^..<series_tip>` 列出并经用户确认
- 已过 🔴 CHECKPOINT-REVERT
- 工作树干净

## 命令

```bash
git -C "<repo>" checkout "<shared_branch>"
git -C "<repo>" pull origin "<shared_branch>"
# 若有 upstream 且需对齐：fetch/merge 策略同热修编排

# 新 → 旧 逐个 revert（含草稿 B 与热修 H…）
git -C "<repo>" revert --no-edit <sha_newest>
# …
git -C "<repo>" revert --no-edit <draft_commit>
```

用户明确授权一次性区间时：

```bash
git -C "<repo>" revert --no-commit <draft_commit>^..<series_tip>
git -C "<repo>" commit -m "Revert draft series …"
```

夹有他人提交时：**禁止**整段 range revert；只 revert 本系列 SHA 列表。

## 冲突

| 用户选择 | 动作 |
| --- | --- |
| 继续 | 解决 → `git add` → `git revert --continue` |
| 放弃 | 仅授权后 `git revert --abort` |

禁止 abort 后改强推。

## 输出

`pulled` | `revertedCommits[]` | `revertSha`（最后一次或合并 revert）| `conflictFiles[]`

## 边界

- 不 cherry-pick 最终版（下一节点）
- 最终版 F 应已包含对 B+H 的审查优化结果（含仍需要的热修内容）

## 使用示例

```text
系列：f2e80622（草稿）+ 0e14f561（js-yaml 热修）。pull 后按新→旧 revert，再上最终版。
使用 $pull并revert草稿。
```
