---
name: 解析沙盒路径与命名惯例
description: 当需要根据主仓目录名与 sandbox_branch 推导 sibling 沙盒路径，或解析用户给出的 sandbox_path 时使用。
---

# 核心任务

产出规范化的 `sandbox_path`（绝对路径）与 `sandbox_branch`，不改仓库。

## 算法（按序，命中即停）

1. **用户显式路径**：若提供 `sandbox_path` → 规范化为绝对路径；`namingRuleApplied=user_explicit`。
2. **项目 worktrees 目录**：若主仓存在 `.worktrees/` 或 `worktrees/` 且已被 ignore →  
   `sandbox_path = <repoRoot>/<dir>/<sandbox_branch>`；`namingRuleApplied=project_worktrees`。
3. **Sibling 默认**（本仓库族惯例）：

```text
parent = dirname(repoRoot)
base   = basename(repoRoot)
if base matches ^(.+_)dev$ :
  leaf = capture1 + sandbox_branch          # apex_dev + devmgr → apex_devmgr
else:
  leaf = base + "_" + sandbox_branch        # myapp + feat → myapp_feat
sandbox_path = parent + "/" + leaf
namingRuleApplied = sibling_dev_suffix | sibling_append
```

## 样例映射

| repoBasename | sandbox_branch | leaf | namingRuleApplied |
| --- | --- | --- | --- |
| `apex_dev` | `devmgr` | `apex_devmgr` | `sibling_dev_suffix` |
| `apex_dev` | `menu-io` | `apex_menu-io` | `sibling_dev_suffix` |
| `nebula` | `hotfix` | `nebula_hotfix` | `sibling_append` |

## 碰撞检查

```bash
test -e "<sandbox_path>" || true
git -C "<repoRoot>" worktree list
git -C "<repoRoot>" branch --list "<sandbox_branch>"
```

任一占用 → `collision=true`（编排 STOP）。

## 输出（必填字段 + 示例值）

```text
sandboxPath=F:/Documents/Repertory/Sieyuan/nebula/apex_devmgr
sandboxBranch=devmgr
namingRuleApplied=sibling_dev_suffix
collision=false
```

## 边界

- 不创建目录、不 `worktree add`。
- 显式路径若指向受保护分支的唯一 worktree（主仓本身）→ `collision=true` 并标注 `protected_main_tree`。

## 使用示例

```text
repo=F:/.../apex_dev，分支=devmgr。使用 $解析沙盒路径与命名惯例。
```
