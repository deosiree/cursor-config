---
name: component-route-chain
description: Use when documenting or changing nebula's page-to-route registration chain where src/registry/sources/*/*.pages.ts is the truth source and routes.ts, page-route-registry, and menu binding are downstream consumers.
---

# component-route-chain

## 目标
沉淀“页面定义 -> route tree -> 路由注册 -> 菜单绑定候选”的真相源链路。

## 必查节点
1. `src/registry/sources/*/*.pages.ts`
2. `src/registry/index.ts`
3. `src/router/routes.ts`
4. `page-route-registry.ts`
5. `binding-registry-snapshot.ts` 中 routes 输出
6. 菜单绑定 registry 对 route rows 的消费

## 强制输出
1. 路由真相源字段表（`*.pages.ts` + `@/registry` + full/local path）
2. 组件路径字段表（import/display/storage）
3. `routes.ts` 与 `page-route-registry.ts` 的消费者职责
4. 新增页面路由接入步骤
