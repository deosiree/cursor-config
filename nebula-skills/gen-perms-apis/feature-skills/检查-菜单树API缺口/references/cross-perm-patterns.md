# 跨 perm 依赖模式

以下模式来自 apex_dev 实战；检查脚本/agent 发现源码调用但菜单未收录时，优先按此表建议归属 perm。

| 模式 ID | 描述 | 源码锚点 | 应挂 perm | API |
|---------|------|----------|-----------|-----|
| `role-create-chain` | 新增角色提交链路 | `views/system/role/components/role/index.vue` `handleRoleFormSubmit` | `sys:role:add` | `/seccenter/v2/role/create`、`assignMenuPermissions`、`assignDevices` |
| `role-dialog-tree` | 打开新增/编辑弹窗加载权限树 | 同上 `openRoleEditCreate` / `openRoleEditEdit` | `sys:role:add` / `sys:role:edit` | `/seccenter/v2/menu/tree` |
| `role-perm-tab-func` | 权限 Tab 加载页面功能项 | `PermissionTab.vue` `getPageFunc` / `getPermissionSubtree` | `sys:role:edit` | `/seccenter/v2/menu/tree` |
| `role-device-tab` | 关联设备 Tab | `DeviceTab.vue` `DeviceGateway.getBind` | `sys:role:edit` | `/devmgr/device/list` |
| `user-list-config` | 用户列表并行拉配置 | `user.gateway.ts` `getPage` | `sys:user:query` | `/seccenter/v2/config/security/detail` |
| `user-role-filter` | 列表页角色筛选项 | `user/index.vue` `onMounted` → `fetchRoleOptions` | `sys:user:query` | `/seccenter/v2/role/list` |
| `user-add-role-config` | 新增/编辑用户弹窗 | `user/index.vue` + `UserFormFields` | `sys:user:add` / `sys:user:edit` | `/seccenter/v2/role/list`、`/seccenter/v2/config/security/detail` |
| `tenant-list-config` | 租户列表并行拉配置 | `tenant.gateway.ts` `getPageV2` | `sys:tenant:query` | `/seccenter/v2/config/security/detail` |
| `tenant-add-config` | 新增租户激活方式 | `tenant/index.vue` `fetchActivationMode` | `sys:tenant:add` | `/seccenter/v2/config/security/detail` |
| `menu-config-api-detail` | API 配置弹窗预读 | `PermissionConfigDialog.vue` `getFuncApis` | `sys:menu:configApi` | `/seccenter/v2/menu/detail` |
| `dashboard-overview` | 首页 KPI | `dashboard/index.vue` `loadDashboardData` | `sys:dashboard:view` | 见 scope 内 device/tenant/user/project API |

## 判定规则

1. API 出现在页面任意 function 的 `apis` 中 → 不算 P0（可能 perm 归属不优，仅 INFO）。
2. API 在源码中被调用、且页面下**所有** function 均未收录 → **P0**。
3. `/api/v2/*` 路径在前端 `src/api` 无对应调用 → **P1 stale**，建议从菜单树删除。
