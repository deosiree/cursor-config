---
name: 判定-页面门控权限点
description: 按页面类型输出 pageGatePerm、computed 命名与数据加载守卫点。触发词：页面门控权限、canQuery、canViewDashboard、pageGatePerm。
---

# 判定-页面门控权限点

## RED

- 没有本 skill 时，agent 对列表页误用 `view` 或对看板误用 `query`
- 常见失败：
  - computed 命名不一致（`canQuery` vs `pageAllowed`）
  - 只写 UI 分支，不标 `fetchData` 守卫点
  - 把操作级 perm 当作 pageGate

## 输入契约

- `路由` 或 `页面类型`：必填
- `权限设计方案`：可选（有则直接引用 perm）

## GREEN — 判定步骤

### Step 1：匹配页面类型

| 页面类型 | pageGatePerm 示例 | computed | 守卫函数 |
|----------|-------------------|----------|----------|
| Dashboard / KPI | `sys:dashboard:view` | `canViewDashboard` | `loadDashboardData` |
| 列表页 | `sys:tenant:query` | `canQuery` | `fetchData` / `loadPageData` |
| 设备数据（参考） | `sys:device:searchAndUpdate` | `pageAllowed` | `onMounted` |

### Step 2：区分操作级 perm

有 pageGate 但缺 `add`/`edit`/`delete` → **不**更换 pageGate，仅 `v-hasPerm` 藏按钮。

### Step 3：输出

- `pageGatePerm`
- `canGateComputed`
- `dataLoadGuardPoints`（`文件` + `函数名`）
- 若 perm 不在设计方案 → 标 `待补设计`

## 失败分支与兜底

| 触发条件 | 一线修复 | 兜底 |
|----------|----------|------|
| 路由类型模糊（详情+列表混合） | 问用户或查设计方案 | 不猜测 perm |
| perm 不在菜单树 | 链 `策略-设计权限点` | 禁止无 perm 改码 |
| 用户给错 gateType | 对照 Step 1 表纠正 | 出示 few-shot |

## 反例黑名单

- ❌ 列表页用 `*:view` 作唯一门控（除非设计方案明确）
- ❌ 输出无 `dataLoadGuardPoints`
- ❌ 把 `sys:tenant:add` 标为 pageGate

## 参考

- `[[assets/few-shot-gate-perm.md]]`
- `[[../../references/page-no-permission-pattern.md]]`

## REFACTOR

- 门控 perm 必须可追溯到设计方案或菜单树

## 使用示例

```text
/Apex/tenant 和 /Apex/dashboard 的门控 perm 和 computed 怎么命名？
```
