# 集中式改动模式

> 完整规则见父级 `[[../../../references/centralized-diff-rules.md]]` 与 `[[../../../references/page-perms-static-budget.md]]`。  
> 本文件聚焦各模块典型改动模式。

## 改动优先级

| 优先级 | 场景 | 做法 |
|--------|------|------|
| **P0 模式 S** | 列表页 / 多行 OpItem | `xxxPagePerms` + boolean props |
| P1 | 单元素、无行内二次鉴权 | `v-hasPerm` |
| P2 | 整块共享 perm | `v-if="xxxPagePerms.action"` |
| P3 | pageGate 缺失 | PageNoPermission |

## 各模块典型模式

### 首页（Dashboard）

- API 守卫：`loadDashboardData` 读 `dashboardPagePerms.value.view`
- UI 显隐：顶层 `v-if="dashboardPagePerms.view"` 包裹整页

### 租户管理（Tenant）

- 类型：`tenant.models.ts`（`TenantPagePerms` + `DEFAULT_TENANT_PAGE_PERMS`）
- 单一 `tenantPagePerms` computed（见 `after-04`）
- 模板 `v-if="tenantPagePerms.xxx"`，无 v-hasPerm 撒点
- 子组件 `TenantTable`：收 boolean `:perms`，OpItem 无 `:perm`
- 弹窗/API 守卫读同一 `tenantPagePerms`

### 个人中心（Profile）

- `assertProfilePerm()` 单点守卫
- 主区域一层 `v-if`

### 用户管理（User）

- 类型：`user.models.ts`（`UserPagePerms` + `UserToolbarPerms`）
- `index.vue` 定义 `userPagePerms` computed
- 子组件 `UserTable` / `UserSearchBar` 收 `:perms`（boolean）

### 角色管理（Role）

- `useRoleList.fetchData` 一处守卫
- 表/弹窗尽量不扩散

### 安全配置（SecurityConfig）

- 简单 Tab + 保存栏：可用 `v-hasPerm` 或小型 pagePerms
- **不改**三个 Card 内部

### 菜单管理（Menu）

- 工具栏 pagePerms 或少量 canXxx（待迁移至 pagePerms）
- `fetchMenuList` 入口守卫
- 行内 PermissionConfigDialog 等已有合理子级 perm，不强行上提

## 例外

已有合理子级 perm 不强行上提：
- 菜单 `PermissionConfigDialog` / `ApiConfigDialog`
- **注意**：用户表 OpItem 若传 `:perm` 字符串属反面模式，应改为 pagePerms + v-if
