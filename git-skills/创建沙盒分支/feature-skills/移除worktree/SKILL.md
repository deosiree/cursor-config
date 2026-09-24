---
name: 移除worktree
description: 当删除检查点已通过，需要从主仓移除沙盒 worktree 目录登记时使用；默认不用 --force。
---

# 核心任务

执行 `git worktree remove`；失败则 STOP，除非二次授权 force。

## 前置

- 编排-安全删除沙盒的 CHECKPOINT 已确认
- 若 `dirty` 且未 `allow_discard_dirty` → 禁止调用本节点
- 若需先 stash：在沙盒内 `git stash push -u -m "..."` 成功后再继续（由编排说明）

## 命令

在主仓：

```bash
git worktree remove "<sandbox_path>"
```

仅当用户明确二次授权 `force_remove_worktree=true`：

```bash
git worktree remove --force "<sandbox_path>"
```

## 验收

`git worktree list` 不再包含该路径；目录应已删除（残留则报告）。

## 失败模式

| 条件 | 处理 |
| --- | --- |
| 脏树拒绝 remove | STOP，提示授权 discard/force 或先提交 |
| 锁/进程占用 | STOP，列占用线索 |
| 路径本就不是 worktree | 报告并跳到删分支（若分支仍在） |

## 输入示例值

```text
sandbox_path=F:/Documents/Repertory/Sieyuan/nebula/apex_devmgr
force_remove_worktree=false
allow_discard_dirty=false
```

## 输出（必填 + 示例）

```text
removed=true
usedForce=false
residualPath=
```

脏树未授权时不得调用；若误调应立即 STOP：

```text
removed=false
usedForce=false
residualPath=F:/Documents/Repertory/Sieyuan/nebula/apex_devmgr
```

## 使用示例

```text
CHECKPOINT 已过，移除 F:/.../apex_devmgr。使用 $移除worktree。
```
