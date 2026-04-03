# 01-function-api-contract-chain

## 真相源与来源映射
| 节点 | 来源文件 | 来源变量 | 关键属性 | 下游 |
|---|---|---|---|---|
| 页面功能动作 | `apex_dev/src/registry/sources/tenant/tenant.actions.ts` | `tenantPageActions` | `perm,gatewayAction,label` | `tenantRegistrySource` |
| 页面功能动作 | `apex_dev/src/registry/sources/role/role.actions.ts` | `rolePageActions` | `perm,gatewayAction,label` | `roleRegistrySource` |
| 网关动作绑定 | `apex_dev/src/registry/sources/tenant/tenant.gateway-bindings.ts` | `tenantGatewayActionBindings` | `gatewayAction -> apiKeys[]` | `tenantRegistrySource` |
| 网关动作绑定 | `apex_dev/src/registry/sources/role/role.gateway-bindings.ts` | `roleGatewayActionBindings` | `gatewayAction -> apiKeys[]` | `roleRegistrySource` |
| API 元数据 | `apex_dev/src/registry/sources/tenant/tenant.api-meta.ts` | `tenantApiMeta` | `apiUrl,apiMethod,description` | `tenantRegistrySource` |
| API 元数据 | `apex_dev/src/registry/sources/role/role.api-meta.ts` | `roleApiMeta` | `apiUrl,apiMethod,description` | `roleRegistrySource` |
| 模块级聚合 | `apex_dev/src/registry/sources/tenant/index.ts` | `tenantRegistrySource` | `routeName,actions,gatewayActionBindings,apiMeta` | `@/registry` |
| 模块级聚合 | `apex_dev/src/registry/sources/role/index.ts` | `roleRegistrySource` | `routeName,actions,gatewayActionBindings,apiMeta` | `@/registry` |
| 统一消费入口 | `apex_dev/src/registry/index.ts` | `registrySources` | `registrySources[]` | `page-action-registry`、`tenant.gateway.ts`、`role.gateway.ts`、API 薄包装 |
| 动作拼装 | `apex_dev/src/permissions/registry-route-action/page-action-registry.ts` | `buildRegisteredActions` | `apis,apiUrls,apiPath` | runtime resolver、snapshot |

## 单写点
1. `perm/gatewayAction`：只在 `src/registry/sources/*/*.actions.ts`
2. `gatewayAction -> apiKeys`：只在 `src/registry/sources/*/*.gateway-bindings.ts`
3. `apiKey -> URL/Method`：只在 `src/registry/sources/*/*.api-meta.ts`
4. `routeName + actions + bindings + apiMeta` 聚合：只在 `src/registry/sources/*/index.ts`
5. 跨层消费入口：只在 `src/registry/index.ts`

禁止：
- 在组件、网关层或业务层写 `gatewayAction -> apiUrl`
- 在 registry 里手写 endpoint 字符串或绕过 `@/registry` 另建聚合入口

## 关键运行时消费
1. `resolveByperm` 按 `routePath + perm` 解析权限。
2. `resolveByGatewayAction` 按 `routePath + gatewayAction` 映射回 perm 再解析。
3. `withGatewayPermissionGuard` 在网关方法调用前执行解析。
4. `tenant.gateway.ts`、`role.gateway.ts`、`tenant.api.ts`、`role.v2.api.ts` 都通过 `@/registry` 读取对应 `*RegistrySource`。

## 新增模块（同微服务）最小改动
1. 新增 `src/registry/sources/<module>/<module>.actions.ts`
2. 新增 `src/registry/sources/<module>/<module>.gateway-bindings.ts`
3. 新增 `src/registry/sources/<module>/<module>.api-meta.ts`
4. 新增 `src/registry/sources/<module>/index.ts` 并导出 `<module>RegistrySource`
5. 在 `src/registry/index.ts` 把 `<module>RegistrySource` 加入统一导出与 `registrySources`
