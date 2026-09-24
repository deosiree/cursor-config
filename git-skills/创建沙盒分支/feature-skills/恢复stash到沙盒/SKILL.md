---
name: 恢复stash到沙盒
description: 当沙盒已创建且用户要求把指定 stash 恢复到沙盒工作树时使用；无冲突才 drop。
---

# 核心任务

在沙盒目录对共享对象库执行 `stash apply`；成功且无冲突才 `stash drop`。

## 前置

- 沙盒 worktree 已存在且干净（相对刚创建）
- `stash_ref` 已指定（如 `stash@{0}`）；未指定但用户描述可唯一匹配 stash list 第一条相关项时可用，否则 STOP 追问

## 命令

```bash
git -C "<sandbox_path>" stash apply "<stash_ref>"
# 检查冲突：
git -C "<sandbox_path>" diff --name-only --diff-filter=U
```

- 无冲突 → `git stash drop "<stash_ref>"`（注意 drop 在共享 stash 栈上按索引变化；drop 前再次确认仍是目标条目）
- 有冲突 → **禁止 drop**；报告冲突文件；`status=conflict`

## 硬约束

- 用 `apply` 而非默认 `pop`（便于冲突时保留）
- 不 `stash clear`
- 不在主仓工作树 apply（除非用户明确只要主仓——本套件默认沙盒）

## 输出（示例值）

成功：

```text
stashRef=stash@{0}
applied=true
dropped=true
conflictFiles=[]
```

冲突（禁止 drop）：

```text
stashRef=stash@{0}
applied=true
dropped=false
conflictFiles=["src/views/tenant/components/BindDeviceDialog.vue"]
status=conflict
```

## 使用示例

```text
在 apex_devmgr 上 apply stash@{0}（场站名称），无冲突再 drop。使用 $恢复stash到沙盒。
```
