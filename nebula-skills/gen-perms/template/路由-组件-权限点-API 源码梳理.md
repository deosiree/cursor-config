# 路由-组件-权限点-API 源码梳理

## 说明

- 统计范围仅限 `src/router/index.ts` 中当前可见的静态路由。
- 权限范围仅统计源码里被 `v-hasPerm` 实际消费的权限点。
- API 口径为页面源码真实调用的 `gateway/api`，不扩展到菜单配置后台“理论可绑定 API”。
- 子组件中的权限点归属其父路由页面。
- `src/views/system/organization/index.vue` 虽然被 `rg` 命中，但 `v-hasPerm` 全部在注释中，且该页面不在当前静态路由内，因此不纳入正文统计。

## 未命中 `v-hasPerm` 的静态路由

| Route | Route Name | Route Component |
| --- | --- | --- |
| `/Apex/dashboard` | `Dashboard` | `src/views/dashboard/index.vue` |
| `/Apex/system/securityConfig` | `SecurityConfig` | `src/views/system/securityConfig/index.vue` |
| `/Apex/system/auditLog` | `AuditLog` | `src/views/system/auditLog/index.vue` |
| `/Apex/system/apiManage` | `APIManage` | `src/views/system/api/index.vue` |
| `/Apex/system/alarmConfig` | `AlarmConfig` | `src/views/system/alarm/index.vue` |
| `/Apex/profile` | `Profile` | `src/views/profile/index.vue` |
| `/Apex/report` | `ReportList` | `src/views/report/index.vue` |
| `/Apex/report/detail/:reportName/:reportType` | `ReportDetail` | `src/views/report/components/ReportDetail.vue` |
| `/Apex/report/new` | `NewReport` | `src/views/report/components/NewReport.vue` |
| `/Apex/dataSearch/deviceData` | `deviceData` | `src/views/dataSearch/deviceData/index.vue` |
| `/Apex/apiDoc` | `ApiDoc` | `src/views/apiDocument/index.vue` |
| `/Apex/frontConf` | `AppConfig` | `src/views/config/index.vue` |

## 纳入统计的路由

### `/Apex/tenant`

| Route | Route Component | Permission Consumer Components | Permissions | Actual API Calls | API Endpoint Evidence |
| --- | --- | --- | --- | --- | --- |
| `/Apex/tenant` | `src/views/tenant/index.vue` | `src/views/tenant/index.vue`, `src/views/tenant/components/TenantTable.vue` | `security:tenant:add`, `security:tenant:edit`, `security:tenant:delete` | `ConfigGateway.detail`, `ProjectGateway.getTenantProjectOptions`, `TenantGateway.getPageV2`, `TenantGateway.getDetailV2`, `TenantGateway.getProjectsV2`, `TenantGateway.createV2`, `TenantGateway.updateV2`, `TenantGateway.assignProjectsV2`, `TenantGateway.deleteV2`, `UserGateway.resendActivation`, `resolvePasswordByLoginSetting` | `POST /seccenter/v2/config/security/detail`, `POST /seccenter/v2/tenant/list`, `POST /seccenter/v2/tenant/detail`, `POST /seccenter/v2/tenant/projects`, `POST /seccenter/v2/tenant/create`, `POST /seccenter/v2/tenant/update`, `POST /seccenter/v2/tenant/assignProjects`, `POST /seccenter/v2/tenant/delete`, `POST /seccenter/v2/user/resendActivation`, `POST /seccenter/v2/auth/loginSetting`, `POST /dbres/project/list` |

权限点到 API 映射：

- `security:tenant:add`
  - 入口：`tenant/index.vue` 顶部“新建”按钮。
  - API 明细表：

| apiMethod | apiUrl | description |
| --- | --- | --- |
| `POST` | `/seccenter/v2/config/security/detail` | 获取安全配置 [ready] |
| `POST` | `/dbres/project/list` | 获取项目信息 |
| `POST` | `/seccenter/v2/auth/loginSetting` | 获取登录配置（公开接口，无需登录）[ready] |
| `POST` | `/seccenter/v2/tenant/create` | 创建租户 [ready] |

- `security:tenant:edit`
  - 入口：`TenantTable.vue` 中“管理信息 / 管理项目 / 重发激活链接”。
  - API 明细表：

| apiMethod | apiUrl | description |
| --- | --- | --- |
| `POST` | `/seccenter/v2/tenant/detail` | 获取租户详情 [ready] |
| `POST` | `/seccenter/v2/tenant/update` | 更新租户 [ready] |
| `POST` | `/dbres/project/list` | 获取项目信息 |
| `POST` | `/seccenter/v2/tenant/projects` | 获取租户关联的项目列表 [ready] |
| `POST` | `/seccenter/v2/tenant/assignProjects` | 分配租户项目 [ready] |
| `POST` | `/seccenter/v2/user/resendActivation` | 重新发送激活链接（管理员操作，需登录）[ready] |

- `security:tenant:delete`
  - 入口：`tenant/index.vue` 顶部批量删除、`TenantTable.vue` 行内删除。
  - API 明细表：

| apiMethod | apiUrl | description |
| --- | --- | --- |
| `POST` | `/seccenter/v2/tenant/delete` | 删除租户 [ready] |

### `/Apex/system/user`

| Route | Route Component | Permission Consumer Components | Permissions | Actual API Calls | API Endpoint Evidence |
| --- | --- | --- | --- | --- | --- |
| `/Apex/system/user` | `src/views/system/user/index.vue` | `src/views/system/user/components/UserSearchBar.vue`, `src/views/system/user/components/UserTable.vue` | `sys:user:add`, `sys:user:delete`, `sys:user:lock`, `sys:user:unlock`, `sys:user:edit` | `UserGateway.getPage`, `RoleGateway.getOptions`, `UserGateway.create`, `UserGateway.update`, `UserGateway.deleteByIds`, `UserGateway.disableUser`, `UserGateway.enableUser`, `UserGateway.unlockUser`, `UserGateway.resendActivation`, `UserGateway.resetPassword`, `resolvePasswordByLoginSetting` | `POST /seccenter/v2/user/list`, `POST /seccenter/v2/role/list`, `POST /seccenter/v2/user/create`, `POST /seccenter/v2/user/update`, `POST /seccenter/v2/user/delete`, `POST /seccenter/v2/user/disable`, `POST /seccenter/v2/user/enable`, `POST /seccenter/v2/user/unlock`, `POST /seccenter/v2/user/resendActivation`, `POST /seccenter/v2/user/resetPassword`, `POST /seccenter/v2/auth/loginSetting`, `POST /seccenter/v2/config/security/detail` |

权限点到 API 映射：

- `sys:user:add`
  - 入口：`UserSearchBar.vue` 顶部“新增”。
  - API 明细表：

| apiMethod | apiUrl | description |
| --- | --- | --- |
| `POST` | `/seccenter/v2/role/list` | 角色列表 [ready] |
| `POST` | `/seccenter/v2/auth/loginSetting` | 获取登录配置（公开接口，无需登录）[ready] |
| `POST` | `/seccenter/v2/user/create` | 创建用户 [ready] |

- `sys:user:edit`
  - 入口：`UserTable.vue` 行内“编辑”。
  - API 明细表：

| apiMethod | apiUrl | description |
| --- | --- | --- |
| `POST` | `/seccenter/v2/role/list` | 角色列表 [ready] |
| `POST` | `/seccenter/v2/user/update` | 更新用户 [ready] |

- `sys:user:delete`
  - 入口：`UserSearchBar.vue` 顶部批量删除、`UserTable.vue` 行内删除。
  - API 明细表：

| apiMethod | apiUrl | description |
| --- | --- | --- |
| `POST` | `/seccenter/v2/user/delete` | 删除用户 [ready] |

- `sys:user:lock`
  - 入口：`UserTable.vue` 行内“停用用户”。
  - API 明细表：

| apiMethod | apiUrl | description |
| --- | --- | --- |
| `POST` | `/seccenter/v2/user/disable` | 停用用户 [ready] |

- `sys:user:unlock`
  - 入口：`UserTable.vue` 行内“启用用户 / 解锁用户”。
  - API 明细表：

| apiMethod | apiUrl | description |
| --- | --- | --- |
| `POST` | `/seccenter/v2/user/enable` | 启用用户（disabled → active）[ready] |
| `POST` | `/seccenter/v2/user/unlock` | 解锁用户 [ready] |

补充：

- 页面初始化和查询还会调用 `UserGateway.getPage`，其内部同时访问 `POST /seccenter/v2/user/list` 与 `POST /seccenter/v2/config/security/detail`，用于列表与“是否展示重发激活链接”判断。
- 行内“重发激活链接”“重置密码”未使用 `v-hasPerm`，但它们属于当前路由真实 API 流程：`POST /seccenter/v2/user/resendActivation`、`POST /seccenter/v2/user/resetPassword`、`POST /seccenter/v2/auth/loginSetting`。

### `/Apex/system/menu`

| Route | Route Component | Permission Consumer Components | Permissions | Actual API Calls | API Endpoint Evidence |
| --- | --- | --- | --- | --- | --- |
| `/Apex/system/menu` | `src/views/system/menu/index.vue` | `src/views/system/menu/index.vue`, `src/views/system/menu/components/PermissionConfigDialog.vue` | `sys:menu:add`, `sys:menu:edit`, `sys:menu:delete` | `ProjectGateway.getTenantProjectOptions`, `MenuGateway.getPageByProject`, `MenuGateway.deleteById`, `MenuGateway.getPageFuncByList`, `MenuGateway.getFuncApis`, `MenuGateway.create`, `MenuGateway.update`, `MenuGateway.menuExport`, `MenuGateway.addFuncApi`, `MenuGateway.updateFuncApi`, `MenuGateway.deleteFuncApi`, `MenuGateway.getRoutes` | `POST /dbres/project/list`, `POST /seccenter/v2/menu/list`, `POST /seccenter/v2/menu/detail`, `POST /seccenter/v2/menu/create`, `POST /seccenter/v2/menu/update`, `POST /seccenter/v2/menu/delete`, `POST /seccenter/v2/menu/api/add`, `POST /seccenter/v2/menu/api/update`, `POST /seccenter/v2/menu/api/delete`, `POST /menu/export` |

权限点到 API 映射：

- `sys:menu:add`
  - 入口：根菜单操作“添加子项”、表格“添加子项”、权限配置弹窗“新增权限”。
  - API 明细表：

| apiMethod | apiUrl | description |
| --- | --- | --- |
| `POST` | `/seccenter/v2/menu/create` | 创建菜单/目录/页面/功能项 [ready] |

- `sys:menu:edit`
  - 入口：根菜单操作“编辑 / 权限配置”、表格“编辑 / 权限配置”、权限配置弹窗“编辑”。
  - API 明细表：

| apiMethod | apiUrl | description |
| --- | --- | --- |
| `POST` | `/seccenter/v2/menu/update` | 更新菜单 [ready] |
| `POST` | `/seccenter/v2/menu/list` | 菜单列表（树形）[ready] |
| `POST` | `/seccenter/v2/menu/detail` | 获取菜单详情 [ready] |
| `POST` | `/seccenter/v2/menu/api/add` | 添加菜单API关联 [ready] |
| `POST` | `/seccenter/v2/menu/api/update` | 更新菜单API关联 [ready] |
| `POST` | `/seccenter/v2/menu/api/delete` | 删除菜单API关联 [ready] |

- `sys:menu:delete`
  - 入口：根菜单删除、表格删除、权限配置弹窗批量删除/单条删除。
  - API 明细表：

| apiMethod | apiUrl | description |
| --- | --- | --- |
| `POST` | `/seccenter/v2/menu/delete` | 删除菜单 [ready] |

补充：

- 页面初始化会先加载项目候选项：`ProjectGateway.getTenantProjectOptions` -> `POST /dbres/project/list`。
- 页面查询会调用 `MenuGateway.getPageByProject` -> `POST /seccenter/v2/menu/list`。
- `MenuFormDialog.vue` 为保证路由路径唯一性，还会调用 `MenuGateway.getRoutes`，最终落到 `POST /seccenter/v2/menu/list`。
- 导出按钮没有 `v-hasPerm`，但仍属于当前路由的真实 API 调用：`MenuGateway.menuExport` -> `POST /menu/export`。

### `/Apex/system/role`

| Route | Route Component | Permission Consumer Components | Permissions | Actual API Calls | API Endpoint Evidence |
| --- | --- | --- | --- | --- | --- |
| `/Apex/system/role` | `src/views/system/role/index.vue` | `src/views/system/role/components/role/RoleListTable.vue` | `sys:role:edit`, `sys:role:delete` | `RoleGateway.getPage`, `MenuGateway.getTreeByPage`, `RoleGateway.getDetail`, `RoleGateway.create`, `RoleGateway.update`, `RoleGateway.assignMenuPermissions`, `RoleGateway.assignDevices`, `RoleGateway.deleteById`, `RoleGroupGateway.list`, `RoleGroupGateway.create`, `RoleGroupGateway.update`, `RoleGroupGateway.assignGroups`, `RoleGroupGateway.applyBatchToRoles` | `POST /seccenter/v2/role/list`, `POST /seccenter/v2/menu/tree`, `POST /seccenter/v2/role/detail`, `POST /seccenter/v2/role/create`, `POST /seccenter/v2/role/update`, `POST /seccenter/v2/role/assignMenuPermissions`, `POST /seccenter/v2/role/assignDevices`, `POST /seccenter/v2/role/delete`, `POST /seccenter/v2/roleGroup/list`, `POST /seccenter/v2/roleGroup/create`, `POST /seccenter/v2/roleGroup/update`, `POST /seccenter/v2/role/assignGroups` |

权限点到 API 映射：

- `sys:role:edit`
  - 入口：`RoleListTable.vue` 行内“编辑”。
  - API 明细表：

| apiMethod | apiUrl | description |
| --- | --- | --- |
| `POST` | `/seccenter/v2/menu/tree` | 获取完整菜单树 [ready] |
| `POST` | `/seccenter/v2/role/detail` | 获取角色详情 [ready] |
| `POST` | `/seccenter/v2/role/update` | 更新角色 [ready] |
| `POST` | `/seccenter/v2/role/create` | 创建角色 [ready] |
| `POST` | `/seccenter/v2/role/assignMenuPermissions` | 分配菜单权限 [ready] |
| `POST` | `/seccenter/v2/role/assignDevices` | 分配设备权限 [ready] |

- `sys:role:delete`
  - 入口：`RoleListTable.vue` 行内“删除”。
  - API 明细表：

| apiMethod | apiUrl | description |
| --- | --- | --- |
| `POST` | `/seccenter/v2/role/delete` | 删除角色 [ready] |

补充：

- 该路由还维护角色分组：`RoleGroupGateway.list` -> `POST /seccenter/v2/roleGroup/list`；`RoleGroupGateway.create/update` -> `POST /seccenter/v2/roleGroup/create|update`；`RoleGroupGateway.assignGroups` 实际调用 `POST /seccenter/v2/role/assignGroups`；`RoleGroupGateway.applyBatchToRoles` 内部批量调用 `POST /seccenter/v2/role/assignMenuPermissions` 与 `POST /seccenter/v2/role/assignDevices`。

### `/Apex/device/deviceTypeList`

| Route | Route Component | Permission Consumer Components | Permissions | Actual API Calls | API Endpoint Evidence |
| --- | --- | --- | --- | --- | --- |
| `/Apex/device/deviceTypeList` | `src/views/deviceManage/deviceType/index.vue` | `src/views/deviceManage/deviceType/index.vue` | `deviceManage:deviceType:edit`, `deviceManage:deviceType:delete` | `TypeAPI.list`, `TypeAPI.create`, `TypeAPI.update`, `TypeAPI.delete` | `POST /device/type/list`, `POST /device/type/create`, `POST /device/type/update`, `POST /device/type/delete` |

权限点到 API 映射：

- `deviceManage:deviceType:edit`
  - 入口：行内“编辑”。
  - API 明细表：

| apiMethod | apiUrl | description |
| --- | --- | --- |
| `POST` | `/device/type/update` | （swagger 未提供接口描述） |

- `deviceManage:deviceType:delete`
  - 入口：行内“删除”。
  - API 明细表：

| apiMethod | apiUrl | description |
| --- | --- | --- |
| `POST` | `/device/type/delete` | （swagger 未提供接口描述） |

补充：

- 页面初始化和搜索调用 `TypeAPI.list` -> `POST /device/type/list`。
- 顶部“新增”按钮未使用 `v-hasPerm`，对应 `TypeAPI.create` -> `POST /device/type/create`。

### `/Apex/device/deviceList`

| Route | Route Component | Permission Consumer Components | Permissions | Actual API Calls | API Endpoint Evidence |
| --- | --- | --- | --- | --- | --- |
| `/Apex/device/deviceList` | `src/views/deviceManage/device/index.vue` | `src/views/deviceManage/device/index.vue` | `deviceManage:device:detail`, `deviceManage:device:resource`, `deviceManage:device:delete` | `DeviceAPI.get`, `DeviceAPI.overview`, `DeviceAPI.getDeviceDetailStableByRow`, `DeviceAPI.delete`, `DeviceAPI.deviceActivate`, `DeviceAPI.update`, `DeviceAPI.exportDeviceConfig`, `TypeAPI.list`, `ProjectGateway.getDeviceBindInfo`, `ProjectGateway.getProjectList`, `ProjectGateway.getProjectResourceList`, `ProjectGateway.createOrUpdateProjectBindInfo`, `TenantGateway.getDetailV2`, `TenantGateway.getPageV2` | `POST /device/list`, `POST /device/overview`, `POST /device/delete`, `POST /device/activate`, `POST /device/update`, `POST /device/export`, `POST /device/type/list`, `POST /seccenter/v2/tenant/detail`, `POST /seccenter/v2/tenant/list`, `POST /dbres/devicebind/list`, `POST /dbres/devicebind/createOrUpdate`, `POST /dbres/project/list`, `POST /dbres/project/resource/list` |

权限点到 API 映射：

- `deviceManage:device:detail`
  - 入口：行内“查看”。
  - API 明细表：

| apiMethod | apiUrl | description |
| --- | --- | --- |
| `POST` | `/seccenter/v2/tenant/detail` | 获取租户详情 [ready] |

- `deviceManage:device:resource`
  - 入口：行内“项目资源绑定”。
  - API 明细表：

| apiMethod | apiUrl | description |
| --- | --- | --- |
| `POST` | `/dbres/devicebind/list` | 获取租户绑定信息 |
| `POST` | `/dbres/project/list` | 获取项目信息 |
| `POST` | `/dbres/project/resource/list` | 获取项目版本资源 |
| `POST` | `/dbres/devicebind/createOrUpdate` | 创建设备绑定信息 |

- `deviceManage:device:delete`
  - 入口：行内“删除”。
  - API 明细表：

| apiMethod | apiUrl | description |
| --- | --- | --- |
| `POST` | `/device/delete` | （swagger 未提供接口描述） |

补充：

- 页面初始化和查询调用 `DeviceAPI.get` 与 `DeviceAPI.overview`，分别对应 `POST /device/list`、`POST /device/overview`。
- 分配租户弹窗 `ActivateDialog.vue` 在打开时会拉取租户列表：`TenantGateway.getPageV2` -> `POST /seccenter/v2/tenant/list`；确认时调用 `DeviceAPI.deviceActivate` -> `POST /device/activate`。
- 页面内双击修改设备描述会调用 `DeviceAPI.update` -> `POST /device/update`。
- 顶部导出按钮未使用 `v-hasPerm`，但会调用 `DeviceAPI.exportDeviceConfig` -> `POST /device/export`。

## 命中文件但不纳入正文统计

| File | Reason |
| --- | --- |
| `src/views/system/organization/index.vue` | `v-hasPerm` 仅出现在注释中，当前不会实际消费权限指令。 |
