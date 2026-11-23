---
name: pull并revert草稿
description: 当需要在共享分支 pull 后，按新→旧对「原始草稿 + 历次热修」整段系列生成 revert（保留历史）时使用；可由 publish_final 或 revert_and_reclaim 调用。
---

# 核心任务

切到共享分支，拉取远端，对**草稿系列**执行 `git revert`（不是只 revert 第一枚草稿）。

系列 = `draft_commit`（B）及其后属于本需求的热修提交 H…，直到用户确认的 `series_tip`（若 tip 上无他人提交，可用当前共享 tip 之前本系列最后一枚）。

## 前置

- `draft_commit` 精确已知
- `commitsInSeries[]` 已知（新→旧），或可由 `git log --oneline <draft>^..<series_tip>` 列出并经用户确认
- 已过 🔴 CHECKPOINT-REVERT
- 工作树干净（在**共享分支**上；临时审查支的脏树不影响，故须先 checkout 共享支）
- `revertMode`：`auto_commit`（默认，旧 publish 路径）| `no_commit`（`revert_and_reclaim`：交给 [[../提交revert并push/SKILL.md]] 写 `revert:` 文案）

## 若系列已被 midstream revert

判定 `alreadyReverted=true`（须在 CHECKPOINT-REVERT 前执行并展示证据）：

```bash
# 对本系列每个 sha，看其后是否已有指向它的 revert 提交
git -C "<repo>" log --oneline --grep="revert:" "<shared_branch>" -20
git -C "<repo>" log --oneline --grep="Revert" "<shared_branch>" -20
# 或：工作树相对 draft^ 的菜单相关路径是否已回到回滚后状态
git -C "<repo>" merge-base --is-ancestor <draft_commit> <shared_branch>  # 仍为祖先
# 若 tip 历史含「回滚 <短 sha>」且 diff 相对 pre_revert 已抵消系列效果 → alreadyReverted
```

用户确认后：

- 输出 `alreadyReverted=true`、`skippedRevert=true`
- **不再**重复 `git revert` 同一批 SHA
- 由调用方（通常 `publish_final`）直接进入 cherry-pick F

## 命令

```bash
git -C "<repo>" checkout "<shared_branch>"
git -C "<repo>" pull origin "<shared_branch>"
# 若有 upstream 且需对齐：fetch/merge 策略同热修编排
```

### `revertMode=auto_commit`（默认）

```bash
# 新 → 旧 逐个 revert（含草稿 B 与热修 H…）
git -C "<repo>" revert --no-edit <sha_newest>
# …
git -C "<repo>" revert --no-edit <draft_commit>
```

### `revertMode=no_commit`（保护分支 midstream / 自定义文案）

```bash
# 仅生成逆补丁；提交文案由「提交revert并push」写成 revert: …
git -C "<repo>" revert --no-commit <sha_newest>
# 然后立即交给提交节点 commit；或对本节点循环：每 SHA no-commit → 由下一节点 commit
# …
git -C "<repo>" revert --no-commit <draft_commit>
```

用户明确授权一次性区间且**无**他人夹杂时：

```bash
git -C "<repo>" revert --no-commit <draft_commit>^..<series_tip>
# auto_commit：commit -m "Revert draft series …"
# no_commit：交提交revert并push，文案须带 revert: 前缀
```

夹有他人提交时：**禁止**整段 range revert；只 revert 本系列 SHA 列表。  
**禁止** revert merge 提交（如中间 `Merge branch develop…`），除非用户显式授权并指定 `-m`。

## 冲突

| 用户选择 | 动作 |
| --- | --- |
| 继续 | 解决 → `git add` → `git revert --continue` |
| 放弃 | 仅授权后 `git revert --abort` |

禁止 abort 后改强推。

## 输出

`pulled` | `revertedCommits[]` | `revertSha`（最后一次或合并 revert；`no_commit` 时可为 pending）| `alreadyReverted` | `revertMode` | `conflictFiles[]`

## 边界

- 不 cherry-pick 最终版（下一节点或其它编排）
- `no_commit` 时不 push（下一节点 [[../提交revert并push/SKILL.md]]）
- 最终版 F 应已包含对 B+H 的审查优化结果（含仍需要的热修内容）——仅对随后还要 publish 的路径成立

## 使用示例

```text
系列：f2e80622（草稿）+ 0e14f561（js-yaml 热修）。pull 后按新→旧 revert，再上最终版。
使用 $pull并revert草稿。
```

```text
phase=revert_and_reclaim；revertMode=no_commit，随后提交 revert: 文案并 push。
使用 $pull并revert草稿。
```
