---
名称: "apex_dev 路由-组件-权限点-API 源码梳理"
仓库路径: "F:\\Documents\\Repertory\\Sieyuan\\nebula\\apex_dev"
输出目录: "F:\\Documents\\Repertory\\Sieyuan\\nebula\\.cursor\\nebula-skills\\gen-perms-apis\\template\\sample-run"
输出文件名: "apex_dev-route-component-perm-api.md"
API契约: "F:\\Documents\\Repertory\\Sieyuan\\nebula\\docs\\api\\seccenter.swagger.json"
补充契约路径:
  - "F:\\Documents\\Repertory\\Sieyuan\\nebula\\docs\\api\\dbres.json"
约束与边界文件: "[[references/default-project-boundary.md]]"
路由入口: "src/router/index.ts"
视图根目录: "src/views"
组件根目录: "src/components"
网关根目录: "src/gateway"
原始API根目录: "src/api"
生成方式: "梳理权限点与apis"
title: "apex_dev 路由-组件-权限点-API 源码梳理"
repo_path: "F:\\Documents\\Repertory\\Sieyuan\\nebula\\apex_dev"
output_dir: "F:\\Documents\\Repertory\\Sieyuan\\nebula\\.cursor\\nebula-skills\\gen-perms-apis\\template\\sample-run"
output_file: "apex_dev-route-component-perm-api.md"
api_contract: "F:\\Documents\\Repertory\\Sieyuan\\nebula\\docs\\api\\seccenter.swagger.json"
extra_api_contracts:
  - "F:\\Documents\\Repertory\\Sieyuan\\nebula\\docs\\api\\dbres.json"
boundary_file: "[[references/default-project-boundary.md]]"
router_entry: "src/router/index.ts"
views_root: "src/views"
components_root: "src/components"
gateway_root: "src/gateway"
raw_api_root: "src/api"
generated_by: "梳理权限点与apis"
---

# 口径说明

- 仅统计源码中已命中的 `v-hasPerm` 权限点。
- `apiUrl` 去掉 `direct` / `forward` / `{direct|forward}` 前缀，统一落业务路径。
- `description` 优先使用默认契约；默认契约未命中时，再使用补充契约 `dbres.json`。
- 若所有已知契约都未命中，则在 API 表中标记为 `待人工确认`，并写入文末 `# 待人工介入`。
- 本次是样本试跑，只覆盖 `/Apex/tenant`、`/Apex/system/user`、`/Apex/system/menu`。
- 正式 skill 必须递归扫描每个路由页面组件及其所有业务子孙组件，本样本仅验证结构和表达方式。

# /Apex/tenant

## 组件

页面组件总表

| 路由 | 对应组件路径 |
| --- | --- |
| `/Apex/tenant` | `src/views/tenant/index.vue` |
| `/Apex/tenant` | `src/views/tenant/components/TenantTable.vue` |

### src/views/tenant/index.vue

- ``v-hasPerm="'sys:tenant:add'"``：顶部“新建”按钮
- ``v-hasPerm="'sys:tenant:delete'"``：顶部“删除”按钮

### src/views/tenant/components/TenantTable.vue

- ``v-hasPerm="'sys:tenant:edit'"``：行内“管理信息”
- ``v-hasPerm="'sys:tenant:edit'"``：行内“管理项目”
- ``v-hasPerm="'sys:tenant:edit'"``：行内“重发激活链接”
- ``v-hasPerm="'sys:tenant:delete'"``：行内“删除”

### 未命中权限控制的组件

#### src/views/tenant/index.vue

- 期望补齐的权限点
  - `sys:tenant:query`
  - `sys:tenant:config`
- 真实调用 API 的交互：页面初始化查询、加载安全配置、加载项目候选项
- 应补权限控制原因：这些交互会真实访问租户列表和安全配置，但当前没有显式只读权限边界
- 建议加权限的位置：列表查询入口、创建前读取配置入口附近增加只读类 `v-hasPerm` 或等价权限守卫

## 权限点

已命中权限点总表

| 权限名称 | 权限标识 |
| --- | --- |
| `新建租户` | `sys:tenant:add` |
| `编辑租户` | `sys:tenant:edit` |
| `删除租户` | `sys:tenant:delete` |

### sys:tenant:add

| 对应功能 | 对应组件路径 | 对应行号 | 对应代码 |
| --- | --- | --- | --- |
| 新建租户 | `src/views/tenant/index.vue` | `24（工具栏新建）` | ``v-hasPerm="'sys:tenant:add'"`` |

| apiMethod | apiUrl | description |
| --- | --- | --- |
| `POST` | `/seccenter/v2/config/security/detail` | `获取安全配置 [ready]` |
| `POST` | `/dbres/project/list` | `获取项目信息` |
| `POST` | `/seccenter/v2/tenant/create` | `创建租户 [ready]` |

### sys:tenant:edit

| 对应功能 | 对应组件路径 | 对应行号 | 对应代码 |
| --- | --- | --- | --- |
| 管理信息 | `src/views/tenant/components/TenantTable.vue` | `40-48（行内编辑）` | ``v-hasPerm="'sys:tenant:edit'"`` |
| 管理项目 | `src/views/tenant/components/TenantTable.vue` | `49-57（行内项目管理）` | ``v-hasPerm="'sys:tenant:edit'"`` |
| 重发激活链接 | `src/views/tenant/components/TenantTable.vue` | `64-68（行内重发激活）` | ``v-hasPerm="'sys:tenant:edit'"`` |

| apiMethod | apiUrl | description |
| --- | --- | --- |
| `POST` | `/seccenter/v2/tenant/detail` | `获取租户详情 [ready]` |
| `POST` | `/seccenter/v2/tenant/projects` | `获取租户关联的项目列表 [ready]` |
| `POST` | `/dbres/project/list` | `获取项目信息` |
| `POST` | `/seccenter/v2/tenant/update` | `更新租户 [ready]` |
| `POST` | `/seccenter/v2/tenant/assignProjects` | `分配租户项目 [ready]` |
| `POST` | `/seccenter/v2/user/resendActivation` | `重新发送激活链接（管理员操作，需登录）[ready]` |

### sys:tenant:delete

| 对应功能 | 对应组件路径 | 对应行号 | 对应代码 |
| --- | --- | --- | --- |
| 顶部批量删除 | `src/views/tenant/index.vue` | `34（顶部删除）` | ``v-hasPerm="'sys:tenant:delete'"`` |
| 行内删除 | `src/views/tenant/components/TenantTable.vue` | `73（行内删除）` | ``v-hasPerm="'sys:tenant:delete'"`` |

| apiMethod | apiUrl | description |
| --- | --- | --- |
| `POST` | `/seccenter/v2/tenant/delete` | `删除租户 [ready]` |

### 未命中权限控制的权限点

| 权限名称 | 权限标识 |
| --- | --- |
| `查询租户列表` | `sys:tenant:query` |
| `读取安全配置` | `sys:tenant:config` |

#### sys:tenant:query

| 对应功能 | 对应组件路径 | 对应行号 | 对应代码 |
| --- | --- | --- | --- |
| 页面初始化/查询列表 | `src/views/tenant/index.vue` | `454（分页查询）` | `建议在列表加载入口增加只读权限守卫或查询按钮级 v-hasPerm` |

| apiMethod | apiUrl                      | description |
| --------- | --------------------------- | ----------- |
| `POST`    | `/seccenter/v2/tenant/list` | `租户列表 [ready]`    |

#### sys:tenant:config

| 对应功能 | 对应组件路径 | 对应行号 | 对应代码 |
| --- | --- | --- | --- |
| 读取安全配置 | `src/views/tenant/index.vue` | `396（加载安全配置）` | `建议在创建流程入口前增加只读权限判定` |

| apiMethod | apiUrl | description |
| --- | --- | --- |
| `POST` | `/seccenter/v2/config/security/detail` | `获取安全配置 [ready]` |

# /Apex/system/user

## 组件

页面组件总表

| 路由 | 对应组件路径 |
| --- | --- |
| `/Apex/system/user` | `src/views/system/user/index.vue` |
| `/Apex/system/user` | `src/views/system/user/components/UserSearchBar.vue` |
| `/Apex/system/user` | `src/views/system/user/components/UserTable.vue` |

### src/views/system/user/components/UserSearchBar.vue

- ``v-hasPerm="'sys:user:add'"``：顶部“新增”
- ``v-hasPerm="'sys:user:delete'"``：顶部“批量删除”

### src/views/system/user/components/UserTable.vue

- ``v-hasPerm="'sys:user:lock'"``：行内“停用用户”
- ``v-hasPerm="'sys:user:unlock'"``：行内“启用用户”
- ``v-hasPerm="'sys:user:unlock'"``：行内“解锁用户”
- ``v-hasPerm="'sys:user:edit'"``：行内“编辑”
- ``v-hasPerm="'sys:user:delete'"``：行内“删除”

### 未命中权限控制的组件

#### src/views/system/user/components/UserTable.vue

- 期望补齐的权限点
  - `sys:user:resendActivation`
  - `sys:user:resetPassword`
- 真实调用 API 的交互：行内“重发激活链接”“重置密码”
- 应补权限控制原因：两个动作都是真实写操作或管理员操作，但当前按钮未挂 `v-hasPerm`
- 建议加权限的位置：两个行操作按钮定义处直接补独立权限标识

#### src/views/system/user/index.vue

- 期望补齐的权限点
  - `sys:user:query`
- 真实调用 API 的交互：页面初始化查询列表、加载角色候选项
- 应补权限控制原因：需要补只读查询权限边界，避免查询链路完全无显式权限
- 建议加权限的位置：列表加载和筛选查询入口附近增加只读权限守卫

## 权限点

已命中权限点总表

| 权限名称 | 权限标识 |
| --- | --- |
| `新增用户` | `sys:user:add` |
| `删除用户` | `sys:user:delete` |
| `停用用户` | `sys:user:lock` |
| `启用或解锁用户` | `sys:user:unlock` |
| `编辑用户` | `sys:user:edit` |

### sys:user:add

| 对应功能 | 对应组件路径 | 对应行号 | 对应代码 |
| --- | --- | --- | --- |
| 新增用户 | `src/views/system/user/components/UserSearchBar.vue` | `50（新增按钮）` | ``v-hasPerm="'sys:user:add'"`` |

| apiMethod | apiUrl | description |
| --- | --- | --- |
| `POST` | `/seccenter/v2/role/list` | `角色列表 [ready]` |
| `POST` | `/seccenter/v2/user/create` | `创建用户 [ready]` |

### sys:user:delete

| 对应功能 | 对应组件路径 | 对应行号 | 对应代码 |
| --- | --- | --- | --- |
| 批量删除 | `src/views/system/user/components/UserSearchBar.vue` | `60（批量删除）` | ``v-hasPerm="'sys:user:delete'"`` |
| 行内删除 | `src/views/system/user/components/UserTable.vue` | `108（行内删除）` | ``v-hasPerm="'sys:user:delete'"`` |

| apiMethod | apiUrl | description |
| --- | --- | --- |
| `POST` | `/seccenter/v2/user/delete` | `删除用户 [ready]` |

### sys:user:lock

| 对应功能 | 对应组件路径 | 对应行号 | 对应代码 |
| --- | --- | --- | --- |
| 停用用户 | `src/views/system/user/components/UserTable.vue` | `42（停用按钮）` | ``v-hasPerm="'sys:user:lock'"`` |

| apiMethod | apiUrl | description |
| --- | --- | --- |
| `POST` | `/seccenter/v2/user/disable` | `停用用户 [ready]` |

### sys:user:unlock

| 对应功能 | 对应组件路径 | 对应行号 | 对应代码 |
| --- | --- | --- | --- |
| 启用用户 | `src/views/system/user/components/UserTable.vue` | `53（启用按钮）` | ``v-hasPerm="'sys:user:unlock'"`` |
| 解锁用户 | `src/views/system/user/components/UserTable.vue` | `64（解锁按钮）` | ``v-hasPerm="'sys:user:unlock'"`` |

| apiMethod | apiUrl | description |
| --- | --- | --- |
| `POST` | `/seccenter/v2/user/enable` | `启用用户（disabled → active）[ready]` |
| `POST` | `/seccenter/v2/user/unlock` | `解锁用户 [ready]` |

### sys:user:edit

| 对应功能 | 对应组件路径 | 对应行号 | 对应代码 |
| --- | --- | --- | --- |
| 编辑用户 | `src/views/system/user/components/UserTable.vue` | `84（编辑按钮）` | ``v-hasPerm="'sys:user:edit'"`` |

| apiMethod | apiUrl | description |
| --- | --- | --- |
| `POST` | `/seccenter/v2/role/list` | `角色列表 [ready]` |
| `POST` | `/seccenter/v2/user/update` | `更新用户 [ready]` |

### 未命中权限控制的权限点

| 权限名称 | 权限标识 |
| --- | --- |
| `查询用户列表` | `sys:user:query` |
| `重发激活链接` | `sys:user:resendActivation` |
| `重置密码` | `sys:user:resetPassword` |

#### sys:user:query

| 对应功能 | 对应组件路径 | 对应行号 | 对应代码 |
| --- | --- | --- | --- |
| 分页查询用户 | `src/views/system/user/index.vue` | `311（列表查询）` | `建议在查询入口增加只读权限守卫或按钮级 v-hasPerm` |

| apiMethod | apiUrl | description |
| --- | --- | --- |
| `POST` | `/seccenter/v2/user/list` | `用户列表 [ready]` |

#### sys:user:resendActivation

| 对应功能 | 对应组件路径 | 对应行号 | 对应代码 |
| --- | --- | --- | --- |
| 重发激活链接 | `src/views/system/user/components/UserTable.vue` | `78（重发激活按钮）` | `建议在该按钮增加 v-hasPerm="\'sys:user:resendActivation\'"` |

| apiMethod | apiUrl | description |
| --- | --- | --- |
| `POST` | `/seccenter/v2/user/resendActivation` | `重新发送激活链接（管理员操作，需登录）[ready]` |

#### sys:user:resetPassword

| 对应功能 | 对应组件路径 | 对应行号 | 对应代码 |
| --- | --- | --- | --- |
| 重置密码 | `src/views/system/user/components/UserTable.vue` | `101（重置密码按钮）` | `建议在该按钮增加 v-hasPerm="\'sys:user:resetPassword\'"` |

| apiMethod | apiUrl | description |
| --- | --- | --- |
| `POST` | `/seccenter/v2/user/resetPassword` | `重置密码（管理员操作）[ready]` |

# /Apex/system/menu

## 组件

页面组件总表

| 路由 | 对应组件路径 |
| --- | --- |
| `/Apex/system/menu` | `src/views/system/menu/index.vue` |
| `/Apex/system/menu` | `src/views/system/menu/components/PermissionConfigDialog.vue` |
| `/Apex/system/menu` | `src/views/system/menu/components/ApiConfigDialog.vue` |
| `/Apex/system/menu` | `src/views/system/menu/components/MenuFormDialog.vue` |

### src/views/system/menu/index.vue

- ``v-hasPerm="'sys:menu:edit'"``：行内“编辑”
- ``v-hasPerm="'sys:menu:add'"``：行内“添加子项”
- ``v-hasPerm="'sys:menu:edit'"``：行内“权限配置”
- ``v-hasPerm="'sys:menu:delete'"``：行内“删除”

### src/views/system/menu/components/PermissionConfigDialog.vue

- ``v-hasPerm="'sys:menu:add'"``：顶部“新增权限”
- ``v-hasPerm="'sys:menu:delete'"``：顶部“批量删除”
- ``v-hasPerm="'sys:menu:edit'"``：行内“编辑”
- ``v-hasPerm="'sys:menu:delete'"``：行内“删除”

### 未命中权限控制的组件

#### src/views/system/menu/components/ApiConfigDialog.vue

- 期望补齐的权限点
  - `sys:menu:configApi`
- 真实调用 API 的交互：新增 API 关联、编辑 API 关联、删除 API 关联
- 应补权限控制原因：三个动作都是真实写操作，但当前无显式 `v-hasPerm`
- 建议加权限的位置：对应新增、编辑、删除按钮定义处直接补独立权限标识

#### src/views/system/menu/index.vue

- 期望补齐的权限点
  - `sys:menu:query`
  - `sys:menu:export`
- 真实调用 API 的交互：导出菜单、项目切换后查询菜单树
- 应补权限控制原因：导出和查询都是真实接口访问，当前没有清晰的只读/导出权限边界
- 建议加权限的位置：导出按钮、项目切换查询入口附近

#### src/views/system/menu/components/MenuFormDialog.vue

- 期望补齐的权限点
  - `sys:menu:query`
  - `sys:menu:createRoot`
- 真实调用 API 的交互：顶部或弹窗提交创建根菜单/子菜单、读取路由候选项
- 应补权限控制原因：创建和查询链路都应受页面域权限约束
- 建议加权限的位置：创建提交入口、路由候选加载入口附近

## 权限点

已命中权限点总表

| 权限名称 | 权限标识 |
| --- | --- |
| `新增菜单或功能项` | `sys:menu:add` |
| `编辑菜单或权限项` | `sys:menu:edit` |
| `删除菜单或权限项` | `sys:menu:delete` |

### sys:menu:add

| 对应功能 | 对应组件路径 | 对应行号 | 对应代码 |
| --- | --- | --- | --- |
| 添加子项 | `src/views/system/menu/index.vue` | `186（添加子项）` | ``v-hasPerm="'sys:menu:add'"`` |
| 新增权限 | `src/views/system/menu/components/PermissionConfigDialog.vue` | `14（新增权限）` | ``v-hasPerm="'sys:menu:add'"`` |

| apiMethod | apiUrl | description |
| --- | --- | --- |
| `POST` | `/seccenter/v2/menu/create` | `创建菜单/目录/页面/功能项 [ready]` |

### sys:menu:edit

| 对应功能 | 对应组件路径 | 对应行号 | 对应代码 |
| --- | --- | --- | --- |
| 编辑菜单 | `src/views/system/menu/index.vue` | `175（编辑按钮）` | ``v-hasPerm="'sys:menu:edit'"`` |
| 打开权限配置 | `src/views/system/menu/index.vue` | `198（权限配置）` | ``v-hasPerm="'sys:menu:edit'"`` |
| 编辑权限项 | `src/views/system/menu/components/PermissionConfigDialog.vue` | `52（编辑权限项）` | ``v-hasPerm="'sys:menu:edit'"`` |

| apiMethod | apiUrl | description |
| --- | --- | --- |
| `POST` | `/seccenter/v2/menu/update` | `更新菜单 [ready]` |
| `POST` | `/seccenter/v2/menu/list` | `菜单列表（树形）[ready]` |
| `POST` | `/seccenter/v2/menu/detail` | `获取菜单详情 [ready]` |

### sys:menu:delete

| 对应功能 | 对应组件路径 | 对应行号 | 对应代码 |
| --- | --- | --- | --- |
| 删除菜单 | `src/views/system/menu/index.vue` | `209（删除菜单）` | ``v-hasPerm="'sys:menu:delete'"`` |
| 批量删除权限项 | `src/views/system/menu/components/PermissionConfigDialog.vue` | `24（批量删除）` | ``v-hasPerm="'sys:menu:delete'"`` |
| 行内删除权限项 | `src/views/system/menu/components/PermissionConfigDialog.vue` | `71（行内删除）` | ``v-hasPerm="'sys:menu:delete'"`` |

| apiMethod | apiUrl | description |
| --- | --- | --- |
| `POST` | `/seccenter/v2/menu/delete` | `删除菜单 [ready]` |

### 未命中权限控制的权限点

| 权限名称 | 权限标识 |
| --- | --- |
| `查询菜单树` | `sys:menu:query` |
| `配置功能项 API` | `sys:menu:configApi` |
| `导出菜单` | `sys:menu:export` |
| `新增根菜单` | `sys:menu:createRoot` |

#### sys:menu:query

| 对应功能 | 对应组件路径 | 对应行号 | 对应代码 |
| --- | --- | --- | --- |
| 查询页面/目录树 | `src/views/system/menu/index.vue` | `472-473（项目切换后加载树）` | `建议在项目切换或查询入口增加只读权限守卫` |
| 读取可用路由列表 | `src/views/system/menu/components/MenuFormDialog.vue` | `406（读取路由候选）` | `建议在路由候选加载入口增加只读权限守卫` |

| apiMethod | apiUrl | description |
| --- | --- | --- |
| `POST` | `/seccenter/v2/menu/list` | `菜单列表（树形）[ready]` |
| `POST` | `/dbres/project/list` | `获取项目信息` |

#### sys:menu:configApi

| 对应功能 | 对应组件路径 | 对应行号 | 对应代码 |
| --- | --- | --- | --- |
| 新增 API 关联 | `src/views/system/menu/components/ApiConfigDialog.vue` | `289（新增关联）` | `建议为新增 API 关联按钮增加 v-hasPerm` |
| 编辑 API 关联 | `src/views/system/menu/components/ApiConfigDialog.vue` | `285（更新关联）` | `建议为编辑 API 关联按钮增加 v-hasPerm` |
| 删除 API 关联 | `src/views/system/menu/components/ApiConfigDialog.vue` | `254（删除关联）` | `建议为删除 API 关联按钮增加 v-hasPerm` |

| apiMethod | apiUrl | description |
| --- | --- | --- |
| `POST` | `/seccenter/v2/menu/api/add` | `添加菜单API关联 [ready]` |
| `POST` | `/seccenter/v2/menu/api/update` | `更新菜单API关联 [ready]` |
| `POST` | `/seccenter/v2/menu/api/delete` | `删除菜单API关联 [ready]` |

#### sys:menu:export

| 对应功能 | 对应组件路径 | 对应行号 | 对应代码 |
| --- | --- | --- | --- |
| 导出菜单 | `src/views/system/menu/index.vue` | `690（导出菜单）` | `建议为导出按钮增加 v-hasPerm` |

| apiMethod | apiUrl | description |
| --- | --- | --- |
| `POST` | `/menu/export` | `待人工确认` |

#### sys:menu:createRoot

| 对应功能 | 对应组件路径 | 对应行号 | 对应代码 |
| --- | --- | --- | --- |
| 新增根菜单 | `src/views/system/menu/components/MenuFormDialog.vue` | `678（创建菜单提交）` | `建议为创建提交入口增加独立权限标识，或复用 sys:menu:add` |

| apiMethod | apiUrl | description |
| --- | --- | --- |
| `POST` | `/seccenter/v2/menu/create` | `创建菜单/目录/页面/功能项 [ready]` |

# 待人工介入

## /menu/export

- 源码消费位置：`src/views/system/menu/index.vue`
- 当前状态：`契约缺失，待人工确认`
- 缺失信息：`现有默认契约 seccenter.swagger.json 与补充契约 dbres.json 中均未找到 /menu/export 的接口描述`
- 建议补充：`提供 /menu/export 对应的 swagger / openapi 契约路径，或直接提供该接口的 method + description`
- 下一轮调用建议：`再次调用 skill 时补充 补充契约路径，或直接给出 /menu/export 的人工确认说明`
