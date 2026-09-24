---
name: 检查沙盒脏树与合并状态
description: 当准备删除沙盒前，需要检查工作树是否脏、分支是否已合入基线、是否有远端跟踪时使用。
---

# 核心任务

产出删除风险画像，不执行删除。

## 检查项

在 `sandbox_path`（或主仓查询分支）：

```bash
git -C "<sandbox_path>" status --short
git -C "<sandbox_path>" rev-parse HEAD
git merge-base --is-ancestor <sandbox_tip> <base_branch>   # 在主仓执行
git -C "<sandbox_path>" rev-parse --abbrev-ref @{upstream} 2>/dev/null
```

受保护名校验：`sandbox_branch` ∉ {develop, main, master} 且 ≠ 主仓当前分支。

## 输出（示例值）

```text
dirty=true
dirtyPaths=["src/api/device/device.api.ts","src/views/.../DeviceTab.vue"]
mergedIntoBase=false
hasUpstream=false
protected=false
riskFlags=["dirty","unmerged"]
baseBranch=develop
sandboxTip=41db9fd9
```

已合入且干净：

```text
dirty=false
dirtyPaths=[]
mergedIntoBase=true
hasUpstream=false
protected=false
riskFlags=[]
```

## 边界

- `protected=true` → 编排必须 `blocked`。
- 不在此节点 remove/branch -d。

## 使用示例

```text
检查 apex_devmgr / devmgr 相对 develop 是否已合入、是否脏。使用 $检查沙盒脏树与合并状态。
```
