---
name: 创建临时分支并reset
description: 当需要从含草稿的 tip 拉出临时分支，并用 mixed/soft reset 取消草稿提交但保留改动供审查时使用。
---

# 核心任务

创建审查用临时分支，然后 `reset` 掉草稿提交，改动回到工作区（或暂存区）。

## 前置

- `draft_commit` 已知
- 当前 tip 应包含该草稿（通常刚在共享分支 tip）
- 已过 🔴 CHECKPOINT-TEMP-RESET
- **禁止** `reset --hard`

## 命令

```bash
git -C "<repo>" checkout -b "<temp_branch>"
# 默认 mixed：改动未暂存，便于逐文件审查
git -C "<repo>" reset HEAD~1
# 仅当用户明确要求 soft：
# git -C "<repo>" reset --soft HEAD~1
```

多 commit 草稿（`draft_commit_count=N`）：

```bash
git -C "<repo>" reset HEAD~N
```

## 验收

```bash
git -C "<repo>" branch --show-current   # == temp_branch
git -C "<repo>" status
# 工作区应出现草稿中的文件变更；log 中草稿提交已不在本分支 tip
```

## 失败模式

| 条件 | 处理 |
| --- | --- |
| 分支名已存在 | STOP 或换名 |
| 用户要 hard | 拒绝 |
| reset 后无任何改动 | 报告异常（可能 tip 不是草稿） |

## 输出

`tempBranch` | `resetMode`∈{`mixed`,`soft`} | `commitsUndone` | `worktreeHasChanges`

## 使用示例

```text
从当前 develop tip 建 temp/review-after-draft，mixed reset 1 个提交。
使用 $创建临时分支并reset。
```
