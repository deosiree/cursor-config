---
name: cherry-pick最终版并push
description: 当草稿已在共享分支被 revert 后，需要把临时分支上的最终提交 cherry-pick 上来并普通 push 时使用。
---

# 核心任务

将 `final_commit` 应用到共享分支，并在确认后 push。

## 前置

- revert 已成功（工作树干净或仅含已解决状态）
- `final_commit` 已知
- 已过 / 即将过 🔴 CHECKPOINT-FINAL-PUSH

## 命令

```bash
git -C "<repo>" checkout "<shared_branch>"
git -C "<repo>" cherry-pick <final_commit>
# 确认后：
git -C "<repo>" push origin "<shared_branch>"
```

若最终改动不在独立 commit而在 stash/工作区：先回到临时分支走 [[../提交最终审查版/SKILL.md]]，再 cherry-pick；不要用 force 覆盖。

## 冲突

| 用户选择 | 动作 |
| --- | --- |
| 继续 | 解决 → `git add` → `git cherry-pick --continue` |
| 放弃 | 仅授权后 `git cherry-pick --abort` |

## 硬约束

- push **禁止** `--force` / `--force-with-lease`
- 非快进被拒时：报告并与用户讨论 pull/rebase；不强推

## 输出

`cherryPickSha` | `pushed` | `sharedBranchTip` | `conflictFiles[]`

## 使用示例

```text
final=def5678，cherry-pick 到 develop 并 push。使用 $cherry-pick最终版并push。
```
