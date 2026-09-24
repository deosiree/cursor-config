---
name: 删除本地沙盒分支
description: 当沙盒 worktree 已移除，需要删除本地沙盒分支时使用；已合入用 -d，确认放弃未合入才用 -D。
---

# 核心任务

删除本地 `sandbox_branch`；默认不删远端。

## 前置

- worktree 已移除（否则 `branch -d` 可能因 checked out 失败）
- 非受保护分支名

## 命令

```bash
# 已合入基线或快进可删：
git branch -d "<sandbox_branch>"

# 仅 allow_delete_unmerged=true 且用户确认放弃：
git branch -D "<sandbox_branch>"
```

远端（仅 `delete_remote=true`）：

```bash
git push <remote> --delete "<sandbox_branch>"
```

## 验收

`git branch --list "<sandbox_branch>"` 为空；`git worktree list` 无残留。

## 输入示例值

```text
sandbox_branch=devmgr
allow_delete_unmerged=false   # 已合入 → branch -d
delete_remote=false
```

未合入且用户已确认放弃：

```text
sandbox_branch=devmgr
allow_delete_unmerged=true    # → branch -D
delete_remote=false
```

## 输出（必填 + 示例）

```text
branchDeleted=true
usedForceDelete=false
remoteDeleted=false
```

## 边界

- 禁止在未授权时 `-D`。
- 不 push 其它分支。

## 使用示例

```text
worktree 已删，devmgr 已合入 develop，执行 branch -d。使用 $删除本地沙盒分支。
```
