# 集中式改动模式

> 完整规则见父级 `[[../../../references/centralized-diff-rules.md]]`。
> 本文件聚焦各模块典型改动模式。

## 改动优先级

1. 单元素 → `v-hasPerm="'perm'"`（最优，不新增 ref）
2. 多元素共享 → 父层 `v-if="canXxx"` + 一个 computed
3. 子组件感知 → `props.perms`

## 各模块典型模式

### 首页（Dashboard）

- API 守卫：`loadDashboardData` 内一处 `checkHasPerm`
- UI 显隐：顶层 `<div v-if="canViewDashboard">` 包裹整页

### 租户管理（Tenant）

- 权限集中在 `index.vue`：`canQuery` / `canAdd` / `canEdit` / `canDelete`
- 工具栏：一个 `v-if="canQuery"` 包裹整块
- 子组件 `TenantTable`：收 `actionPerms` prop
- 弹窗：父组件 `v-if` 控制挂载

### 个人中心（Profile）

- `assertProfilePerm()` 单点守卫
- 主区域一层 `v-if`

### 用户管理（User）

- `index.vue` 定义 `toolbarPerms`
- `UserSearchBar`：用 `props.perms` 替代内部 `v-hasPerm`
- **不**给搜索框再加 perm

### 角色管理（Role）

- `useRoleList.fetchData` 一处守卫
- 表/弹窗尽量不扩散

### 安全配置（SecurityConfig）

- `useSecurityConfigPage` 按 perm 分支 reload/save
- `index.vue` 过滤 Tab、控制保存栏 `v-if="canSave"`
- **不改**三个 Card 内部

### 菜单管理（Menu）

- 工具栏：`canQuery` / `canAdd` / `canImport` / `canExport`
- `fetchMenuList` 入口守卫
- 行内保持现有 `checkHasPerm`（已合理的子级 perm，不强行上提）

## 例外

已有合理子级 perm 不强行上提：
- 菜单 `PermissionConfigDialog` / `ApiConfigDialog`
- 用户表 `OpItem`
