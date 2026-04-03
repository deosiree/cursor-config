# route-api-gateway-register

## 范围
本目录用于维护 nebula 当前链路文档：
- 功能项 -> registry source -> `@/registry` -> 前端网关/权限层/API 薄包装
- 页面定义 -> registry route tree -> `routes.ts` / 页面注册 / 菜单绑定
- 子应用上送 -> 基座聚合 -> 下发回填
- 新增模块/新增微服务接入

## 当前链路总原则
1. 真相源只落在 `apex_dev/src/registry/sources/*`。
2. 路由真相源同样只落在 `apex_dev/src/registry/sources/*/*.pages.ts`。
3. 模块内聚合走 `apex_dev/src/registry/sources/<module>/index.ts`。
4. 网关层、业务层、权限层、router 或其他消费者统一经 `apex_dev/src/registry/index.ts` 暴露的 `@/registry` 入口消费。
5. 每个节点都可定位到来源文件 + 变量 + 属性。

## 真相源总表（核心）
| 节点 | 真相源文件 | 真相源变量 | 关键属性 | 下游消费 |
|---|---|---|---|---|
| 页面动作定义 | `apex_dev/src/registry/sources/tenant/tenant.actions.ts` | `tenantPageActions` | `perm,label,gatewayAction` | `tenantRegistrySource` |
| 页面动作定义 | `apex_dev/src/registry/sources/role/role.actions.ts` | `rolePageActions` | `perm,label,gatewayAction` | `roleRegistrySource` |
| 页面定义 | `apex_dev/src/registry/sources/system/system.pages.ts` | `systemRegistryPages` | `routeName,path,componentImportPath,meta,parentRouteName,order` | `systemRegistrySource` |
| 页面定义 | `apex_dev/src/registry/sources/role/role.pages.ts` | `roleRegistryPages` | `routeName,path,componentImportPath,meta,parentRouteName,order` | `roleRegistrySource` |
| 页面定义 | `apex_dev/src/registry/sources/tenant/tenant.pages.ts` | `tenantRegistryPages` | `routeName,path,componentImportPath,meta,parentRouteName,order` | `tenantRegistrySource` |
| 网关动作绑定 | `apex_dev/src/registry/sources/tenant/tenant.gateway-bindings.ts` | `tenantGatewayActionBindings` | `gatewayAction -> apiKeys[]` | `tenantRegistrySource` |
| 网关动作绑定 | `apex_dev/src/registry/sources/role/role.gateway-bindings.ts` | `roleGatewayActionBindings` | `gatewayAction -> apiKeys[]` | `roleRegistrySource` |
| API 元数据 | `apex_dev/src/registry/sources/tenant/tenant.api-meta.ts` | `tenantApiMeta` | `apiUrl,apiMethod,description` | `tenantRegistrySource` |
| API 元数据 | `apex_dev/src/registry/sources/role/role.api-meta.ts` | `roleApiMeta` | `apiUrl,apiMethod,description` | `roleRegistrySource` |
| 模块级聚合 | `apex_dev/src/registry/sources/tenant/index.ts` | `tenantRegistrySource` | `domain,routeName,pages,actions,gatewayActionBindings,apiMeta` | `@/registry`、`tenant.gateway.ts`、`tenant.api.ts` |
| 模块级聚合 | `apex_dev/src/registry/sources/role/index.ts` | `roleRegistrySource` | `domain,routeName,pages,actions,gatewayActionBindings,apiMeta` | `@/registry`、`role.gateway.ts`、`role.v2.api.ts` |
| 模块级聚合 | `apex_dev/src/registry/sources/system/index.ts` | `systemRegistrySource` | `domain,pages` | `@/registry` |
| 统一消费入口 | `apex_dev/src/registry/index.ts` | `registrySources/getRegistryPages/getRegistryRouteTree` | `pages/tree/finders/validation` | `router/routes.ts`、`page-route-registry`、`page-action-registry`、网关层 |
| 路由消费层 | `apex_dev/src/router/routes.ts` | `constantRoutes/buildRouteRecordFromRegistry` | `RouteRecordRaw/component loader/path transform` | Vue Router |
| 动作注册中心 | `apex_dev/src/permissions/registry-route-action/page-action-registry.ts` | `registrySources` / `getRegisteredPageActions` | `actions/functions` | `runtime-permission-resolver`、`binding-registry-snapshot` |
| 路由注册中心 | `apex_dev/src/permissions/registry-route-action/page-route-registry.ts` | `getRegisteredPageRoutes` | `routePath/fullRoutePath/component*` | `page-action-registry`、snapshot |
| 运行时权限解析 | `apex_dev/src/permissions/registry-route-action/runtime-permission-resolver.ts` | `resolveByperm/resolveByGatewayAction` | `allowed,reason,gatewayAction,permissionApis` | 网关守卫、指令判权 |
| 子应用上送快照 | `apex_dev/src/permissions/registry-route-action/binding-registry-snapshot.ts` | `buildBindingRegistrySnapshot` | `routes/actions/functions` | `registerBindingRegistry` |
| 子应用上送动作 | `apex_dev/src/plugins/qiankun/lifecycle.ts` | `reportBindingRegistryToHost` | `registerBindingRegistry(snapshot)` | 基座聚合 |
| 基座注册中心聚合 | `microfb/src/store/modules/micro-app-binding-registry.store.ts` | `upsertSnapshot/getPublicState` | `apps[].snapshot` | 基座菜单绑定与透传 |
| 基座向子应用下发 | `microfb/src/plugins/qiankun/apps.ts` | `getBindingRegistryState` | registry public state | 子应用 `syncBindingRegistryFromHost` |

## 单写点定义
1. `perm/gatewayAction` 单写点：`apex_dev/src/registry/sources/<module>/*.actions.ts`
2. `gatewayAction -> apiKeys` 单写点：`apex_dev/src/registry/sources/<module>/*.gateway-bindings.ts`
3. `apiKey -> apiUrl/apiMethod` 单写点：`apex_dev/src/registry/sources/<module>/*.api-meta.ts`
4. 模块聚合单写点：`apex_dev/src/registry/sources/<module>/index.ts`
5. 统一消费入口单写点：`apex_dev/src/registry/index.ts`
6. `route metadata` 单写点：`apex_dev/src/registry/sources/*/*.pages.ts`
7. `snapshot 聚合结构` 单写点：`binding-registry-snapshot.ts`

禁止第二写点：
- 禁止在组件、网关层或业务层额外声明 `gatewayAction -> apiUrl`
- 禁止在非 `*.api-meta.ts` 处维护重复 endpoint 常量
- 禁止在非 `src/registry/sources/*` 处散落 `perm/gatewayAction/apiKeys` 业务定义
- 禁止继续把 `routes.ts` 当作路由真相源直接增删页面
- 禁止跨层绕过 `@/registry` 直接拼装新的 registry source 入口

## 前端/后端持久化边界
1. 前端持久化
   - 菜单缓存：`apex_dev/src/services/menu/menu-repo.ts`（`readMenuCache/writeMenuCache`）
   - 用户上下文：`Storage("userInfo")`
   - 基座 registry 状态：`micro-app-binding-registry` store（内存态）
2. 后端持久化
   - 菜单树与功能项绑定（`perm/apis`）以后端菜单服务落库为准
   - 前端 registry/snapshot 仅用于展示与解析，不替代后端事实

## 子 skill 导航
- `01-function-api-contract-chain/README.md`
- `02-component-route-chain/README.md`
- `03-registry-reporting-flow/README.md`
- `04-module-onboarding-playbook/README.md`
- `05-registry-module-template/README.md`

## 验收标准
以 `TODOLIST.md` 为准，必须能直接回答：
1. 每个节点从哪个文件哪个变量来。
2. 每个节点关键属性是什么。
3. 哪些是真相源，哪些只是 `@/registry` 的消费者。
4. 哪些是单写点，哪里禁止重复写。
5. 新增模块/新增微服务分别改哪些文件。



```
方案2
A. 编辑页面
已关联时：显示路由主信息、组件路径 + “更换关联路由”
前端声明只读：
路由路径（就是带着微服务的那个值，和后端里存的一致）
路由名称
组件路径
B. 编辑功能项
权限标识(perm)
```



```
@.cursor/nebula-skills/create_new_permission-meta_and_used_in_views/SKILL.md  
root: apex_dev
module: 除了user和role的其他模块，有使用了has-perm的其他地方
权限点：参考has-perm是怎么设置的，自行模拟
```



```
后端仅提供权限功能的存储：

增加网关层：业务层不直接消费api层，而是网关层消费api层，业务层消费网关层，在网关层中增加对api的权限校验

菜单列表的”菜单“/"目录"和其他属性均来自于用户的手动编辑设置，前端不存，前端只存它需要消费的
1.路由(路由层 消费 业务层：路由、组件） —— route_path:"Apex/tenant";component:"tenant/index" —— 存至后端menu表中
2.权限标识（业务层 消费 网关层：权限标识、组件、网关方法） —— perm:"system:tenant:add" —— 存至后端menu表中
3.api(网关层 消费 api层：apiUrl、apiMethod) —— POST /tenant/add/ —— 存至后端menu_apis表中
4.消费方比较零散，汇总到了regestry/<domain>/<domain>.pages/actions/gateway-bindings/api-meta
4.1.pages:路由-组件
4.2.actions:权限标识-网关方法，供业务层消费，（权限标识与网管方法是否双持了？业务层根据权限标识判断，同时使用的又是权限标识对应的网关方法）
4.3.gateway-bindings：网关方法-apis,供网关层消费：某个网关方法若是集成使用了多个api接口（有问题，如果使用网关方法绑定apis，那业务层消费时没法实现一个权限标识对应多个网关方法啊？是不是应该是1个权限标识对应多个apis，每个apis对应的）
4.4.api-meta：api对应的apiMethod、apiUrl
分析上述，actions和gateway-bindings的逻辑有点乱，先不落地到代码，基于最小化改动设计



A.菜单列表的”页面“——前端持久化与用户手动可操作的流程如下：
1.前端注册上报了本地页面的路由与组件信息(路由层消费，稳定键为路由地址route_path)，包括有路由、组件、...,
2.在编辑页面中，关联路由实现了将该页面绑定对应的路由和跳转组件，而其他信息仅做前端的UI展示，方便用户选择的，而真正使用的是用户在编辑页面进行的手动编辑，如父级菜单、名称、关联项目、路由参数、显示状态、排序、图标
3.所以注册中心只存储了前端持久化的信息，是相对前端全面的信息，但存储到后端的仅为路由和组件
4.
（用户）新增页面->后端中的menu表新增一行数据；编辑页面->修改后端中的值；删除页面->删除后端中的值。均不影响前端持久化的存储信息
（前端）新增页面->registry/<domain>/<domain>.pages.ts中的<domain>RegistryPages添加对应的元数据，前端持久化的存储信息在注册上报给微服务时就会多一条
5.组件路径是前端持久化的，不可由用户进行更改

B.功能项配置的”功能项“——前端持久化与用户手动可操作的流程如下：
1.前端注册上报了本地网关方法（业务层消费，稳定键为权限标识perm,网关层封装了apis，是api层的消费方）的相关信息，包括有权限标识、...(这部分的绑定信息有点太多太杂，感觉只需要绑定微服务和领域(tenant/project/role/...)即可，分析是否应该精简),
2.在编辑功能项中，关联权限标识实现了将该网关方法绑定对应页面上消费它的按钮、表单等元素，而其他信息仅做前端的UI展示，方便用户选择的，而真正使用的是用户在编辑页面进行的手动编辑，如父级菜单（考虑是否换成”父级页面“，可读性更强）、名称、关联项目（应该继承父级页面的，而不是自己再单独要选）、...(其他是不是都可以精简掉)
3.所以注册中心只存储了前端持久化的信息，是相对前端全面的信息，但存储到后端的仅为路由、组件和权限标识（因为功能项同样存储到menu表中，但是功能项不需要跳转路由和组件，所以路由、组件为空值，主要是绑定了权限标识和父级页面）
4.新增功能项->后端中的menu表新增一行数据；编辑页面->修改后端中的值；删除页面->删除后端中的值。均不影响前端持久化的存储信息
5.权限标识、网关方法是前端持久化的，不可由用户进行更改

C.功能项配置的”api“——前端持久化与用户手动可操作的流程如下：
1.前端注册上报了本地api层元数据（网关层消费，稳定键为api_Url）的相关信息，包括有apiUrl、apiMethod、description
2.在编辑api中，使用的编辑方式是双规，判断状态”仅前端“/"仅后端"/”已关联“，已关联实现了将该apis的元数据信息(apiUrl、apiMethod)绑定至对应功能项的权限标识，确保对应网关方法消费的api，而其他信息仅做前端的UI展示，方便用户选择的，而真正使用的是用户在编辑页面进行的手动编辑，如名称
3.所以注册中心只存储了前端持久化的信息，是相对前端全面的信息，但存储到后端的仅为apiUrl、apiMethod
4.新增功能项->后端中的menu_apis表新增一行数据；编辑页面->修改后端中的值；删除页面->删除后端中的值。均不影响前端持久化的存储信息
5.apiUrl、apiMethod是前端持久化的，不可由用户进行更改
6.menu/api/add|update|delete的口子，是提供给版本迁移时的过度，可以给同个权限标识绑定多个版本的apis，数据库里存储的是全量apis，前端源码则根据git版本来决定网管层消费的是哪个api，避免只改了少量api却要开一个新的菜单的复杂情况

现在所有真相源都已收敛了，但UI/UX交互是否还需要统一？例如功能项-apis的编辑方式与页面和功能项不一致
思考点：
1.Q:用户是否关心功能项的某个apis的权限? A:不关心
2.Q:
```

