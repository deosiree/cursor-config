# 02-component-route-chain

## 真相源与来源映射
| 节点 | 来源文件 | 来源变量/函数 | 关键属性 | 下游 |
|---|---|---|---|---|
| 页面定义 | `apex_dev/src/registry/sources/role/role.pages.ts` | `roleRegistryPages` | `routeName,path,componentImportPath,meta,parentRouteName,order` | `roleRegistrySource` |
| 页面定义 | `apex_dev/src/registry/sources/profile/profile.pages.ts` | `profileRegistryPages` | `routeName,path,componentImportPath,meta,parentRouteName,order` | `profileRegistrySource` |
| 页面定义聚合 | `apex_dev/src/registry/index.ts` | `getRegistryPages/getRegistryRouteTree` | `pages/tree/path validation` | `routes.ts`、`page-route-registry` |
| Router 消费层 | `apex_dev/src/router/routes.ts` | `constantRoutes/buildRouteRecordFromRegistry` | `path,name,component,meta,children` | Vue Router |
| 页面路由注册 | `apex_dev/src/permissions/registry-route-action/page-route-registry.ts` | `getRegisteredPageRoutes` | `routeName,fullRoutePath,routePath,localRoutePath` | action registry、snapshot |
| 路由路径归一化 | 同上 | `normalizeToLocalRoutePath` | 本地路径语义 | runtime resolver |
| 组件路径字段 | 同上 | `readComponentImportPath/toComponentDisplayPath/toComponentStoragePath` | `componentImportPath/componentDisplayPath/componentStoragePath` | 菜单绑定展示 |
| 页面绑定候选 | `apex_dev/src/views/system/menu/model/binding/menu-type-binding.registry.ts` | `buildPageBindingRows` | `bindingKey,routePath,fullRoutePath` | 菜单弹窗 |

## 单写点
1. 路由到页面元数据：`src/registry/sources/*/*.pages.ts`
2. 模块页面聚合：`src/registry/sources/<module>/index.ts`
3. 全局路由聚合：`src/registry/index.ts`
4. 组件路径转换与 full/local route 归一化：`page-route-registry.ts`

禁止：
- 在 `src/router/routes.ts` 直接新增/删除业务页面
- 在其他模块重复实现 routePath/fullRoutePath 归一化
- 在 UI 层手工拼装组件 display/storage 路径

## 新增页面路由时必须补齐
1. 在 `src/registry/sources/<module>/<module>.pages.ts` 新增页面定义
2. 补齐 `routeName`
3. 补齐 `meta.title`
4. 叶子页面补齐 `meta.componentImportPath`
5. 保证 `path` 与 app scope/base 对齐
6. 在 `src/registry/sources/<module>/index.ts` 暴露 `pages`
7. 在 `src/registry/index.ts` 纳入统一聚合

## 验收点
1. `findRegisteredPageRouteByPath` 能通过 full/local 路径命中
2. 菜单绑定弹窗能展示正确的组件路径
3. `constantRoutes` 能从 `getRegistryRouteTree()` 正常产出路由记录
