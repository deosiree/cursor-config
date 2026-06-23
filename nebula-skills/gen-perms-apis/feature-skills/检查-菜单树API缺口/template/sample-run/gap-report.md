---
检查时间: 2026-06-23
targetRepo: apex_dev
menuTreeYaml: docs/menu/菜单树_0623_platform.yaml
focusModules: default（6 模块）
excludeRoutes: /Apex/profile
脚本: check-menu-api-gap.node.js
exitCode: 0
---

# 菜单树 API 缺口检查报告

## 口径说明

- 真源：apex_dev 源码真实 API 调用（views → gateway → api）
- 对照：菜单树 YAML 各 page 下 function 的 `apis[]` 并集
- 个人中心已排除（全局白名单）

## 汇总

| 级别 | 数量 | 说明 |
|------|------|------|
| P0 | 0 | 源码有、菜单树该页面下无任何 perm 收录 |
| P1 | 6 | stale `/api/v2/*` 建议清理 |

**结论**：6 模块功能 API 无 P0 遗漏；建议清理 P1 stale 项。

---

## 各模块结论

| 模块 | P0 | P1 stale |
|------|-----|----------|
| 首页 | 0 | 0 |
| 租户管理 | 0 | 0 |
| 用户管理 | 0 | 0 |
| 角色管理 | 0 | 3 |
| 安全配置 | 0 | 0 |
| 菜单管理 | 0 | 3 |

### P1 stale 明细（建议从菜单树删除）

**角色管理**

- `sys:role:edit` → `/api/v2/roles/{id}`
- `sys:role:delete` → `/api/v2/roles/{id}`
- `sys:role:configPerm` → `/api/v2/roles/{id}/permissions`

**菜单管理**

- `sys:menu:add` → `/api/v2/menus`
- `sys:menu:edit` → `/api/v2/menus/{id}`
- `sys:menu:delete` → `/api/v2/menus/{id}`

---

## 待扩展（非 P0）

- 角色管理：`RoleGroupGateway.*` 未纳入映射表（角色组功能，按需扩展）
- 菜单管理：`MenuGateway.getAncLocks` 为纯前端工具，无后端 API
