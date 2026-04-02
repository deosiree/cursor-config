---
name: registry-module-template
description: Use when adding or refactoring a nebula registry domain module and you need the smallest file skeleton under src/registry/sources/* with pages as the route truth source and @/registry as the only aggregation entry.
---

# registry-module-template

## 目标
把“新增一个领域模块”收敛成最少、最集中的 registry 改动，避免再去手改 router、binding snapshot 或页面注册中心；`routes.ts` 与 `page-route-registry.ts` 都应只作为 `@/registry` 的消费者。

## 适用场景
1. 新增一个业务领域，例如 `device`、`project`、`alarm`
2. 现有页面从 `core.pages.ts` 或其它领域拆回自己的 source
3. 想确认哪些文件是必填，哪些文件可以后补

## 最小文件骨架
1. 页面定义：`src/registry/sources/<domain>/<domain>.pages.ts`
2. 页面动作：`src/registry/sources/<domain>/<domain>.actions.ts`
3. 网关动作绑定：`src/registry/sources/<domain>/<domain>.gateway-bindings.ts`
4. API 元数据：`src/registry/sources/<domain>/<domain>.api-meta.ts`
5. 模块聚合：`src/registry/sources/<domain>/index.ts`
6. 统一接入：`src/registry/sources/index.ts` 与 `src/registry/index.ts`

优先参考现成模板：`src/registry/sources/__template__/README.md`

## 单写点
1. 路由/组件/菜单元信息：`*.pages.ts`
2. `actionKey -> gatewayAction`：`*.actions.ts`
3. `gatewayAction -> apiKeys[]`：`*.gateway-bindings.ts`
4. `apiKey -> apiUrl/apiMethod/description`：`*.api-meta.ts`
5. 模块对外暴露：`sources/<domain>/index.ts`
6. 全局聚合与消费：`@/registry`

禁止第二写点：
1. 不要再手改 `src/router/routes.ts` 增页
2. 不要把 `page-route-registry.ts` 当作页面真相源回写页面定义
3. 不要在组件、store、gateway 中重复写 `componentImportPath`
4. 不要在非 `*.api-meta.ts` 文件里散落 endpoint 常量

## 模板来源
直接使用：`src/registry/sources/__template__/`

模板目录必须包含：
1. `module.pages.ts`
2. `module.actions.ts`
3. `module.gateway-bindings.ts`
4. `module.api-meta.ts`
5. `index.ts`

这些文件一起构成“注册上报所需最小集合”，不要只复制其中一部分。

## 可以后补的项
1. `actions`
2. `gatewayActionBindings`
3. `apiMeta`
4. `icon`
5. `alwaysShow`

先把页面挂进 registry，再逐步补权限与 API，不需要一次填满。

## 必做校验
1. `routeName` 全局唯一
2. `path` 全局唯一
3. `parentRouteName` 必须能在 registry 里找到父节点
4. 叶子页面必须有 `componentImportPath`，目录/redirect 节点除外

## 验收
1. `pnpm type-check`
2. `pnpm test:unit src/permissions/registry-route-action/__tests__/registry-sources.test.ts`
3. `pnpm test:unit src/permissions/registry-route-action/__tests__/page-route-registry.test.ts src/permissions/registry-route-action/__tests__/page-action-registry.test.ts`
4. `rg "<domain>RegistrySource|<domain>RegistryPages" apex_dev/src/registry`
