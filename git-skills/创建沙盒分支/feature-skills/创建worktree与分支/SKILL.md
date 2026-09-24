---
name: 创建worktree与分支
description: 当路径已解析且主仓干净，需要执行 git worktree add -b 从基线分支创建沙盒时使用。
---

# 核心任务

在主仓执行创建 worktree + 新分支；成功后沙盒检出该分支。

## 前置

- 主仓 `git status --short` 为空
- `sandbox_path` 不存在或不在 worktree list
- `sandbox_branch` 本地不存在（若已存在 → STOP，除非用户明确复用已有分支且路径空闲——默认不复用）

## 命令

在主仓：

```bash
git worktree add "<sandbox_path>" -b "<sandbox_branch>" "<base_branch>"
```

`base_branch` 默认 `develop`。需要先与远端对齐时，仅用户授权才 `git fetch` / `git pull`。

## 验收

```bash
git worktree list
# 沙盒内：
git -C "<sandbox_path>" branch --show-current   # == sandbox_branch
git -C "<sandbox_path>" status -sb
```

主仓仍应停留在原分支且干净。

## 失败模式

| 条件 | 处理 |
| --- | --- |
| 路径非空/已占用 | STOP |
| 分支名已存在 | STOP |
| Windows 长路径 | `git -c core.longpaths=true worktree add ...` |

## 输出（示例值）

```text
worktreeCreated=true
headSha=41db9fd9
mainStillClean=true
sandboxPath=F:/.../apex_devmgr
sandboxBranch=devmgr
```

## 使用示例

```text
path=../apex_devmgr，branch=devmgr，base=develop。使用 $创建worktree与分支。
```
