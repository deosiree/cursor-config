# 未命中 `v-hasPerm` 静态路由权限点补齐设计

## 说明

- 覆盖范围：当前“未命中 `v-hasPerm` 的静态路由”全部 12 条。
- 文档层级：`## [路由]` -> 表1/表2 -> `### [权限点]` -> 表3。
- 行号口径：同时提供源码文件行号与业务行说明。
- API 口径：`apiUrl` 使用业务路径（不带 `/direct`、`/forward`、`{direct|forward}` 前缀）；`description` 优先接口 `description`，缺失回退 `summary`，再缺失标注“swagger 未提供接口描述”。

## /Apex/dashboard

表1 路由组件表（总表）

| 路由 | 对应组件 | 组件路径 |
| --- | --- | --- |
| `/Apex/dashboard` | `Dashboard` | `src/views/dashboard/index.vue` |

表2 组件权限点表

| 权限点(按现有风格设计) | 对应哪一行(源码行号+业务行) | 对应什么代码中 |
| --- | --- | --- |
| `sys:dashboard:view` | 859-861（`onBeforeMount` 首次加载）；业务行：进入页面即加载总览 | `onBeforeMount(() => loadDashboardData())` |
| `sys:dashboard:query` | 171-172（模板筛选变更）；809-831（筛选处理） | `@change="handleDeviceFilterChange"` + `handleDeviceFilterChange()` |

### sys:dashboard:view

表3 权限点 API 表

| apiMethod | apiUrl | description |
| --- | --- | --- |
| `POST` | `/device/overview` | swagger 未提供接口描述 |
| `POST` | `/seccenter/v2/tenant/list` | 租户列表 [ready] |
| `POST` | `/seccenter/v2/user/list` | 用户列表 [ready] |
| `POST` | `/dbres/project/list` | 获取项目信息 |
| `POST` | `/device/type/list` | swagger 未提供接口描述 |

### sys:dashboard:query

表3 权限点 API 表

| apiMethod | apiUrl | description |
| --- | --- | --- |
| `POST` | `/device/overview` | swagger 未提供接口描述 |

## /Apex/system/securityConfig

表1 路由组件表（总表）

| 路由 | 对应组件 | 组件路径 |
| --- | --- | --- |
| `/Apex/system/securityConfig` | `SecurityConfig` | `src/views/system/securityConfig/index.vue` |

表2 组件权限点表

| 权限点(按现有风格设计) | 对应哪一行(源码行号+业务行) | 对应什么代码中 |
| --- | --- | --- |
| `sys:securityConfig:view` | 430-432（挂载加载）；389-412（reload） | `onMounted(() => reload())` |
| `sys:securityConfig:save` | 185-194（保存按钮）；414-428（保存提交） | `<FormActionButtons @save="save" />` + `save()` |
| `sys:securityConfig:edit` | 191-193（取消/重置）；381-387（取消） | `@cancel="discardChanges"` / `@reset="reload"` |

### sys:securityConfig:view

表3 权限点 API 表

| apiMethod | apiUrl | description |
| --- | --- | --- |
| `POST` | `/seccenter/v2/config/security/detail` | 获取安全配置 [ready] |
| `POST` | `/seccenter/v2/config/session/detail` | 获取会话配置 [ready] |

### sys:securityConfig:save

表3 权限点 API 表

| apiMethod | apiUrl | description |
| --- | --- | --- |
| `POST` | `/seccenter/v2/config/security/update` | 更新安全配置 [ready] |
| `POST` | `/seccenter/v2/config/session/update` | 更新会话配置 [ready] |

### sys:securityConfig:edit

表3 权限点 API 表

| apiMethod | apiUrl | description |
| --- | --- | --- |
| `-` | `-` | 当前无后端 API 调用（仅前端状态恢复/重载） |

## /Apex/system/auditLog

表1 路由组件表（总表）

| 路由 | 对应组件 | 组件路径 |
| --- | --- | --- |
| `/Apex/system/auditLog` | `AuditLog` | `src/views/system/auditLog/index.vue` |

表2 组件权限点表

| 权限点(按现有风格设计) | 对应哪一行(源码行号+业务行) | 对应什么代码中 |
| --- | --- | --- |
| `sys:auditLog:view` | 244-254（页面初始化加载）；业务行：进入页即拉取条件/列表 | `onMounted(async () => { ... })` |
| `sys:auditLog:query` | 64-66（搜索按钮）；13-15、32-34、49-50、58-60（筛选变更） | `@click="handleQuery"` 与各筛选 `@change/@clear` |

### sys:auditLog:view

表3 权限点 API 表

| apiMethod | apiUrl | description |
| --- | --- | --- |
| `POST` | `/audLog/getcondition` | swagger 未提供接口描述 |
| `POST` | `/audLog/query` | swagger 未提供接口描述 |

### sys:auditLog:query

表3 权限点 API 表

| apiMethod | apiUrl | description |
| --- | --- | --- |
| `POST` | `/audLog/query` | swagger 未提供接口描述 |

## /Apex/system/apiManage

表1 路由组件表（总表）

| 路由 | 对应组件 | 组件路径 |
| --- | --- | --- |
| `/Apex/system/apiManage` | `APIManage` | `src/views/system/api/index.vue` |

表2 组件权限点表

| 权限点(按现有风格设计) | 对应哪一行(源码行号+业务行) | 对应什么代码中 |
| --- | --- | --- |
| `sys:api:view` | 479-481（挂载查询）；282-298（加载列表） | `onMounted(() => fetchData())` |
| `sys:api:query` | 14-17（搜索输入）；272-277（搜索处理） | `@keydown.enter="handleSearchPath"` |
| `sys:api:add` | 19-27（添加按钮）；376-388（新增提交） | `handleAdd()` + `submitApiDialog()` create 分支 |
| `sys:api:edit` | 75-83（编辑按钮）；364-375（更新提交） | `handleEdit()` + `submitApiDialog()` update 分支 |
| `sys:api:delete` | 84-92（行删）；28-37（批删）；407-438、443-476（删除执行） | `deleteApiRow()` / `handleBatchDelete()` |

### sys:api:view

表3 权限点 API 表

| apiMethod | apiUrl | description |
| --- | --- | --- |
| `POST` | `/api/list` | swagger 未提供接口描述 |

### sys:api:query

表3 权限点 API 表

| apiMethod | apiUrl | description |
| --- | --- | --- |
| `POST` | `/api/list` | swagger 未提供接口描述 |

### sys:api:add

表3 权限点 API 表

| apiMethod | apiUrl | description |
| --- | --- | --- |
| `POST` | `/api/add` | swagger 未提供接口描述 |

### sys:api:edit

表3 权限点 API 表

| apiMethod | apiUrl | description |
| --- | --- | --- |
| `POST` | `/api/update` | swagger 未提供接口描述 |

### sys:api:delete

表3 权限点 API 表

| apiMethod | apiUrl | description |
| --- | --- | --- |
| `POST` | `/api/delete` | swagger 未提供接口描述 |

## /Apex/system/alarmConfig

表1 路由组件表（总表）

| 路由 | 对应组件 | 组件路径 |
| --- | --- | --- |
| `/Apex/system/alarmConfig` | `AlarmConfig` | `src/views/system/alarm/index.vue` |

表2 组件权限点表

| 权限点(按现有风格设计) | 对应哪一行(源码行号+业务行) | 对应什么代码中 |
| --- | --- | --- |
| `sys:alarm:view` | 550-552（挂载刷新）；485-488（刷新逻辑） | `onMounted(() => handleRefreshAll())` |
| `sys:alarm:query` | 16-18、28-30、39-41（筛选）；346-349（查询） | `handleQuery()` 与筛选项事件 |
| `sys:alarm:add` | 42-50（新增）；106-114（添加告警项） | `dialogRef.open("create"... )` |
| `sys:alarm:edit` | 95-103（编辑按钮） | `dialogRef.open("edit"... )` |
| `sys:alarm:delete` | 127-135（行删）；51-60（批删）；351-392、407-447（执行） | `handleDeleteNode()` / `handleBatchDelete()` |
| `sys:alarm:subscribe` | 116-119（订阅查看）；542-548（处理） | `handleViewSubscribe()` |

### sys:alarm:view

表3 权限点 API 表

| apiMethod | apiUrl | description |
| --- | --- | --- |
| `POST` | `/alarm/group/tree/list` | swagger 未提供接口描述 |
| `POST` | `/alarm/condition` | swagger 未提供接口描述 |

### sys:alarm:query

表3 权限点 API 表

| apiMethod | apiUrl | description |
| --- | --- | --- |
| `POST` | `/alarm/group/tree/list` | swagger 未提供接口描述 |

### sys:alarm:add

表3 权限点 API 表

| apiMethod | apiUrl | description |
| --- | --- | --- |
| `-` | `-` | 当前文件为弹窗入口，新增接口在 `AlarmFormDialog` 内触发 |

### sys:alarm:edit

表3 权限点 API 表

| apiMethod | apiUrl | description |
| --- | --- | --- |
| `-` | `-` | 当前文件为弹窗入口，编辑接口在 `AlarmFormDialog` 内触发 |

### sys:alarm:delete

表3 权限点 API 表

| apiMethod | apiUrl | description |
| --- | --- | --- |
| `POST` | `/alarm/groupItem/delete` | swagger 未提供接口描述 |

### sys:alarm:subscribe

表3 权限点 API 表

| apiMethod | apiUrl | description |
| --- | --- | --- |
| `-` | `-` | 当前无后端 API 调用（查看订阅弹窗） |

## /Apex/profile

表1 路由组件表（总表）

| 路由 | 对应组件 | 组件路径 |
| --- | --- | --- |
| `/Apex/profile` | `Profile` | `src/views/profile/index.vue` |

表2 组件权限点表

| 权限点(按现有风格设计) | 对应哪一行(源码行号+业务行) | 对应什么代码中 |
| --- | --- | --- |
| `sys:profile:view` | 610-619（挂载加载）；602-608（加载函数） | `onMounted(() => loadUserProfile())` |
| `sys:profile:password` | 72-74（修改密码按钮）；459-481（提交） | `handleSubmit()` PASSWORD 分支 |
| `sys:profile:mobile` | 85-87（手机按钮）；482-495（提交） | `bindOrChangeMobile()` |
| `sys:profile:email` | 98-100（邮箱按钮）；495-508（提交） | `bindOrChangeEmail()` |
| `sys:profile:avatar` | 21（文件选择）；573-589（上传） | `handleFileChange()` |

### sys:profile:view

表3 权限点 API 表

| apiMethod | apiUrl | description |
| --- | --- | --- |
| `POST` | `/seccenter/v2/user/detail` | 获取用户详情 [ready] |

### sys:profile:password

表3 权限点 API 表

| apiMethod | apiUrl | description |
| --- | --- | --- |
| `POST` | `/seccenter/v2/auth/loginSetting` | 获取登录配置（公开接口，无需登录）[ready] |
| `POST` | `/seccenter/v2/user/updatePassword` | swagger 未提供接口描述 |

### sys:profile:mobile

表3 权限点 API 表

| apiMethod | apiUrl | description |
| --- | --- | --- |
| `POST` | `/seccenter/v2/user/update` | 更新用户 [ready] |

### sys:profile:email

表3 权限点 API 表

| apiMethod | apiUrl | description |
| --- | --- | --- |
| `POST` | `/seccenter/v2/user/update` | 更新用户 [ready] |

### sys:profile:avatar

表3 权限点 API 表

| apiMethod | apiUrl | description |
| --- | --- | --- |
| `POST` | `/api/v1/files` | swagger 未提供接口描述 |

## /Apex/report

表1 路由组件表（总表）

| 路由 | 对应组件 | 组件路径 |
| --- | --- | --- |
| `/Apex/report` | `ReportList` | `src/views/report/index.vue` |

表2 组件权限点表

| 权限点(按现有风格设计) | 对应哪一行(源码行号+业务行) | 对应什么代码中 |
| --- | --- | --- |
| `sys:report:add` | 7（新建按钮）；143-145（事件） | `handleCreateReport()` |
| `sys:report:query` | 14、45（查看详情）；148-156（事件） | `handleViewReport()` / `handleSystemViewReport()` |
| `sys:report:edit` | 22（编辑按钮）；159-164（事件） | `handleEditReport()` |
| `sys:report:delete` | 24（删除按钮） | 当前模板仅有按钮，未绑定删除实现 |

### sys:report:add

表3 权限点 API 表

| apiMethod | apiUrl | description |
| --- | --- | --- |
| `-` | `-` | 当前无后端 API 调用（路由跳转到新建页） |

### [/Apex/report/detail/:reportName/:reportType] sys:report:query

表3 权限点 API 表

| apiMethod | apiUrl | description |
| --- | --- | --- |
| `-` | `-` | 当前无后端 API 调用（路由跳转到详情页） |

### [/Apex/report/new] sys:report:edit

表3 权限点 API 表

| apiMethod | apiUrl | description |
| --- | --- | --- |
| `-` | `-` | 当前无后端 API 调用（路由跳转） |

### sys:report:delete

表3 权限点 API 表

| apiMethod | apiUrl | description |
| --- | --- | --- |
| `-` | `-` | 当前无后端 API 调用（删除逻辑未实现） |

## /Apex/report/detail/:reportName/:reportType

表1 路由组件表（总表）

| 路由 | 对应组件 | 组件路径 |
| --- | --- | --- |
| `/Apex/report/detail/:reportName/:reportType` | `ReportDetail` | `src/views/report/components/ReportDetail.vue` |

表2 组件权限点表

| 权限点(按现有风格设计) | 对应哪一行(源码行号+业务行) | 对应什么代码中 |
| --- | --- | --- |
| `sys:report:export` | 40（导出按钮） | 模板按钮未绑定事件 |
| `sys:report:exportRecord` | 41（导出记录按钮） | 模板按钮未绑定事件 |
| `sys:report:query` | 65-66（分页事件）；714-719（分页函数） | `handlePageChange()` |

### sys:report:export

表3 权限点 API 表

| apiMethod | apiUrl | description |
| --- | --- | --- |
| `-` | `-` | 当前无后端 API 调用（按钮未绑定接口） |

### sys:report:exportRecord

表3 权限点 API 表

| apiMethod | apiUrl | description |
| --- | --- | --- |
| `-` | `-` | 当前无后端 API 调用（按钮未绑定接口） |

### sys:report:query

表3 权限点 API 表

| apiMethod | apiUrl | description |
| --- | --- | --- |
| `-` | `-` | 当前无后端 API 调用（本页以本地数据渲染为主） |

## /Apex/report/new

表1 路由组件表（总表）

| 路由 | 对应组件 | 组件路径 |
| --- | --- | --- |
| `/Apex/report/new` | `NewReport` | `src/views/report/components/NewReport.vue` |

表2 组件权限点表

| 权限点(按现有风格设计) | 对应哪一行(源码行号+业务行) | 对应什么代码中 |
| --- | --- | --- |
| `sys:report:edit` | 45-47、56、64（字段勾选）；143-187（勾选逻辑） | `toggleCategory()` / `toggleItem()` / `toggleSelectAll()` |
| `sys:report:add` | 86（保存按钮）；299-360（保存处理） | `handleSave()` |

### sys:report:edit

表3 权限点 API 表

| apiMethod | apiUrl | description |
| --- | --- | --- |
| `-` | `-` | 当前无后端 API 调用（表单配置阶段） |

### [/Apex/report/new] sys:report:add

表3 权限点 API 表

| apiMethod | apiUrl | description |
| --- | --- | --- |
| `-` | `-` | 当前无后端 API 调用（保存接口待接入） |

## /Apex/dataSearch/deviceData

表1 路由组件表（总表）

| 路由 | 对应组件 | 组件路径 |
| --- | --- | --- |
| `/Apex/dataSearch/deviceData` | `DeviceDataSearch` | `src/views/dataSearch/deviceData/index.vue` |

表2 组件权限点表

| 权限点(按现有风格设计) | 对应哪一行(源码行号+业务行) | 对应什么代码中 |
| --- | --- | --- |
| `sys:deviceData:query` | 23（查询动作）；777-846（查询处理）；38/52（树点击）；1278-1322（树节点处理） | `handleSearch()` / `handleNodeClick()` 等数据查询路径 |

### sys:deviceData:query

表3 权限点 API 表

| apiMethod | apiUrl | description |
| --- | --- | --- |
| `POST` | `/seccenter/v2/tenant/list` | 租户列表 [ready] |
| `POST` | `/device/list` | swagger 未提供接口描述 |
| `POST` | `/dbres/bind/projects` | 获取设备已绑定的项目信息 |
| `POST` | `/devicedata/context` | swagger 未提供接口描述 |
| `POST` | `/devicedata/rdb/get` | swagger 未提供接口描述 |
| `POST` | `/devicedata/tsdb/get` | swagger 未提供接口描述 |
| `POST` | `/devicedata/cdb/get` | swagger 未提供接口描述 |
| `POST` | `/devicedata/cdb/getValues` | swagger 未提供接口描述 |

## /Apex/apiDoc

表1 路由组件表（总表）

| 路由 | 对应组件 | 组件路径 |
| --- | --- | --- |
| `/Apex/apiDoc` | `ApiDoc` | `src/views/apiDocument/index.vue` |

表2 组件权限点表

| 权限点(按现有风格设计) | 对应哪一行(源码行号+业务行) | 对应什么代码中 |
| --- | --- | --- |
| `sys:apiDoc:view` | 3（iframe）；11-22（文档 URL 构造） | 文档页访问与地址拼装 |

### sys:apiDoc:view

表3 权限点 API 表

| apiMethod | apiUrl | description |
| --- | --- | --- |
| `GET` | `/swagger-ui/` | 当前无业务 swagger 字段描述（静态文档入口） |

## /Apex/frontConf

表1 路由组件表（总表）

| 路由 | 对应组件 | 组件路径 |
| --- | --- | --- |
| `/Apex/frontConf` | `AppConfig` | `src/views/config/index.vue` |

表2 组件权限点表

| 权限点(按现有风格设计) | 对应哪一行(源码行号+业务行) | 对应什么代码中 |
| --- | --- | --- |
| `sys:frontApp:query` | 278-289（刷新/加载）；业务行：列表初始化与刷新 | `handleReloadConfig()` / `loadConfig()` |
| `sys:frontApp:add` | 7-10（新增按钮）；211-245（提交） | `handleAddApp()` + `handleSubmit()` create |
| `sys:frontApp:edit` | 24-33（编辑按钮）；211-245（提交） | `handleEditApp()` + `handleSubmit()` update |
| `sys:frontApp:delete` | 34-43（删除按钮）；248-276（删除） | `handleDeleteApp()` |
| `sys:frontApp:refresh` | 11-14（重新加载） | `handleReloadConfig()` |

### sys:frontApp:query

表3 权限点 API 表

| apiMethod | apiUrl | description |
| --- | --- | --- |
| `POST` | `/seccenter/v2/frontApp/list` | 获取前台应用列表 [ready] |

### sys:frontApp:add

表3 权限点 API 表

| apiMethod | apiUrl | description |
| --- | --- | --- |
| `POST` | `/seccenter/v2/frontApp/create` | 创建前台应用 [ready] |

### sys:frontApp:edit

表3 权限点 API 表

| apiMethod | apiUrl | description |
| --- | --- | --- |
| `POST` | `/seccenter/v2/frontApp/update` | 更新前台应用 [ready] |

### sys:frontApp:delete

表3 权限点 API 表

| apiMethod | apiUrl | description |
| --- | --- | --- |
| `POST` | `/seccenter/v2/frontApp/delete` | 删除前台应用 [ready] |

### sys:frontApp:refresh

表3 权限点 API 表

| apiMethod | apiUrl | description |
| --- | --- | --- |
| `POST` | `/seccenter/v2/frontApp/list` | 获取前台应用列表 [ready] |
