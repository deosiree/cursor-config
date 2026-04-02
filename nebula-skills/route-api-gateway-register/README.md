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
| 页面动作定义 | `apex_dev/src/registry/sources/tenant/tenant.actions.ts` | `tenantPageActions` | `actionKey,label,gatewayAction` | `tenantRegistrySource` |
| 页面动作定义 | `apex_dev/src/registry/sources/role/role.actions.ts` | `rolePageActions` | `actionKey,label,gatewayAction` | `roleRegistrySource` |
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
| 运行时权限解析 | `apex_dev/src/permissions/registry-route-action/runtime-permission-resolver.ts` | `resolveByActionKey/resolveByGatewayAction` | `allowed,reason,gatewayAction,permissionApis` | 网关守卫、指令判权 |
| 子应用上送快照 | `apex_dev/src/permissions/registry-route-action/binding-registry-snapshot.ts` | `buildBindingRegistrySnapshot` | `routes/actions/functions` | `registerBindingRegistry` |
| 子应用上送动作 | `apex_dev/src/plugins/qiankun/lifecycle.ts` | `reportBindingRegistryToHost` | `registerBindingRegistry(snapshot)` | 基座聚合 |
| 基座注册中心聚合 | `microfb/src/store/modules/micro-app-binding-registry.store.ts` | `upsertSnapshot/getPublicState` | `apps[].snapshot` | 基座菜单绑定与透传 |
| 基座向子应用下发 | `microfb/src/plugins/qiankun/apps.ts` | `getBindingRegistryState` | registry public state | 子应用 `syncBindingRegistryFromHost` |

## 单写点定义
1. `actionKey/gatewayAction` 单写点：`apex_dev/src/registry/sources/<module>/*.actions.ts`
2. `gatewayAction -> apiKeys` 单写点：`apex_dev/src/registry/sources/<module>/*.gateway-bindings.ts`
3. `apiKey -> apiUrl/apiMethod` 单写点：`apex_dev/src/registry/sources/<module>/*.api-meta.ts`
4. 模块聚合单写点：`apex_dev/src/registry/sources/<module>/index.ts`
5. 统一消费入口单写点：`apex_dev/src/registry/index.ts`
6. `route metadata` 单写点：`apex_dev/src/registry/sources/*/*.pages.ts`
7. `snapshot 聚合结构` 单写点：`binding-registry-snapshot.ts`

禁止第二写点：
- 禁止在组件、网关层或业务层额外声明 `gatewayAction -> apiUrl`
- 禁止在非 `*.api-meta.ts` 处维护重复 endpoint 常量
- 禁止在非 `src/registry/sources/*` 处散落 `actionKey/gatewayAction/apiKeys` 业务定义
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
