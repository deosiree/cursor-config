---
name: route-api-gateway-register
description: 用于新增/迁移业务模块时，建立“页面动作 -> 网关方法 -> gatewayAction -> 权限 meta -> 运行时 resolver/注册中心”的一致链路，并收敛 mock 入口为 Vite 插件全局单写点。
---

# 目标
在 nebula 中为每个业务模块建立稳定的“动作注册与权限解析链路”，让后续修改只发生在少数单写点文件，并避免：
- gateway 内写 `env` 分支导致 mock/real 行为漂逸
- 权限字符串散落在组件/业务层
- permission meta 与解析/注册中心职责错位

## 适用场景
1. 新增一个模块（例如 `tenant/menu/role` 之外的 domain），需要接入：
   - 页面按钮的权限守卫（`v-confirmPerm` / `v-hasPerm`）
   - runtime resolver 解析（`routePath + actionKey` -> `allowed + apiUrls + gatewayAction`）
   - 注册中心/菜单绑定展示（用于配置 `menu.perm`）
2. 现有模块仍有版本 fallback、`*V2` 方法名、或权限字符串散落，需要迁移到“收敛模型”。

## MVP 固化约束（先做对，再做全）
1. **全局 mock 单写点**：mock 只由 `vite.config.ts` 中 `vite-plugin-mock-dev-server` 的 `include` 装配决定。
2. **gateway 兼容壳**：gateway 只暴露业务层稳定方法名（可由方法集合派生 `TenantGatewayAction`/`XGatewayAction`）。
3. **permission-meta 声明型数据**：`gatewayAction -> apiUrls` 由 `src/permissions/permission-meta/*` 维护。
4. **解析/注册中心在 `src/permissions/**`**：`page-action-registry` 与 `runtime-permission-resolver` 完成组装与解析。

## 执行步骤（模块迁移模板）
1. **收口页面动作**
   - 在目标页面目录新增或更新 `*.actions.ts`
   - 每个动作至少包含：
     - `actionKey`（后端权限标识，如 `sys:xxx:create`）
     - `label`
     - `gatewayAction`（只引用 gateway 导出的类型/方法名；避免复制字符串 union）
2. **实现/瘦身网关兼容壳**
   - 在 `src/gateways/{module}/{module}.gateway.ts`（或同等落点）：
     - 保留稳定方法名（建议不要在方法名上携带版本后缀）
     - 敏感动作在请求前做 `resolveRuntimePermission` 前置短路
     - 删除版本 fallback（若明确没有真实 v1 API 则 fail-fast）
   - 导出 `type {Module}GatewayAction = Extract<keyof typeof GatewayObject, string>`
3. **建立权限元数据声明型映射**
   - 新增 `src/permissions/permission-meta/{module}.permission-meta.ts`
   - 声明：
     - `actions: { [gatewayAction]: { apiUrls: [...] } }`
   - 确保 key 与 `*.actions.ts` / gateway 方法名一致（让 TS/单测兜住）。
4. **接入 page-action-registry（注册中心/展示用汇总）**
   - 在 `src/permissions/page-action-registry.ts`：
     - 把新模块的 `{module}PageActions` 与 `{module}PermissionMeta` 加入 `pageActionSources`
5. **更新菜单绑定与解析相关测试**
   - 同步 `gatewayAction` 字符串常量
   - 覆盖 resolver/registry 返回值断言
6. **收口 mock 入口（全局单写点）**
   - `vite.config.ts`：
     - 增加 `const mockXEnabled = toBool(env.VITE_MOCK_X)` 并装配：
       - `mock/{x}.mock.ts`
       - `mock/{x}v2.mock.ts`（如你们有 v2-only mock）
   - `src/types/env.d.ts` 与 `.env.*` 补齐 `VITE_MOCK_X`

## 验证方案（必做）
1. `pnpm -C apex_dev test:unit`
2. 若你同时改了 gateway 方法名/权限 key：
   - `rg "gatewayAction: \"|createV2|deleteV2|updateV2|getPageV2|assignProjectsV2" apex_dev/src`
   - 确保没有残留旧命名的页面/测试引用

## 参考来源（最佳实践采纳点）
- Vite mock 模块开关与 include 装配  
  https://vite-plugin-mock-dev-server.netlify.app/guide/usage
- ACL / Anti-Corruption Layer 职责边界（隔离外部契约复杂度）  
  https://oneuptime.com/blog/post/2026-01-30-anti-corruption-layer-pattern/view

