# route-api-gateway-register

## 用途
为 nebula 项目提供一套“API/网关/权限元数据/页面动作/注册中心链路”的维护指引与模板化操作步骤。

## 本 session 做过的关键改造（tenant 基线）
1. **页面动作的 gatewayAction 约束收口**  
   - `TenantGatewayAction` 改为从 `TenantGateway` 的方法名派生（单写点来自网关方法集合）。  
   - `src/views/tenant/tenant.actions.ts` 中的 `gatewayAction` 同步为新方法名（不再使用 `*V2` 后缀）。
2. **tenant 网关兼容壳迁移到 `src/gateways` 并瘦身**  
   - `src/gateways/tenant/tenant.gateway.ts`：去掉 v1/fallback 与 `executeWithVersionFallback`，统一方法名去除 `V2`，并保留敏感动作的权限前置校验（依赖 resolver 结果做短路）。
3. **权限声明元数据收口到解析/注册中心同类目录**（更贴近职责边界）  
   - 将旧路径 `src/api/gateway/{tenant,role}.permission-meta.ts` 迁移为  
     - `src/permissions/permission-meta/{tenant,role}.permission-meta.ts`
   - 同步更新引用：  
     - `src/permissions/page-action-registry.ts`
     - `src/gateways/{tenant,role}/*.gateway.ts`
4. **全局 mock 单写点**（避免网关里写 env 分支导致漂逸）  
   - `apex_dev/vite.config.ts`：增加 `VITE_MOCK_TENANT` 模块开关，并在 `vite-plugin-mock-dev-server` 的 `include` 中装配：
     - `mock/tenant.mock.ts`
     - `mock/seccenter.tenant.v2.mock.ts`
   - `src/types/env.d.ts` 与 `.env.*` 补齐 `VITE_MOCK_TENANT`。
5. **测试与回归**  
   - 同步更新 tenant 相关测试与菜单绑定测试里的 `gatewayAction` 字符串常量。
   - 已通过：`pnpm -C apex_dev test:unit`

## 目录/职责建议（适用于后续模块）
- `src/api/**`：只做真实 HTTP 客户端与 endpoint 路由生成（不做权限/注册中心策略解析）。
- `src/gateways/**`：业务兼容壳（Adapter/ACL Facade）
  - 对业务层暴露稳定方法名（必要时进行参数/返回归一化）
  - 对敏感动作做 resolver 前置校验（避免“按钮隐藏但仍被绕过请求”）
  - **不把 mock 开关散落在网关内部**（mock 只由 Vite 插件层决定）
- `src/permissions/permission-meta/**`：权限映射声明型数据
  - `gatewayAction -> apiUrls`（供 `page-action-registry` / `runtime-permission-resolver` 组装结果）
- `src/permissions/**`：解析/注册中心逻辑
  - `page-action-registry.ts`：汇总页面动作 + 权限 meta，给运行时 resolver 提供候选数据
  - `runtime-permission-resolver.ts`：根据菜单绑定与 actionKey 决定 allowed/拒绝原因与 API 列表

## 链路速览（推荐的“稳定依赖方向”）
页面组件/业务层（只依赖网关）：
1. 页面按钮通过 `v-confirmPerm` 指向 `routePath + actionKey`
2. `runtime-permission-resolver` 使用菜单绑定与 `permission-meta` 解析到 `apiUrls + gatewayAction`
3. 网关按 `gatewayAction` 对外暴露的稳定方法名发请求（敏感动作前置短路）

## 为什么不做 `api -> gateway -> 业务/注册中心` 单向三段就结束？
因为你的“权限与注册中心”并不是请求实现，而是**策略数据与解析逻辑**：
- permission meta 是声明型 ACL mapping（`gatewayAction -> apiUrls`）
- resolver/registry 是解析与组装逻辑  

把“权限声明数据”强塞进 gateway 实现里，会造成职责混杂与潜在依赖闭环；把它放在 `src/permissions/**` 与解析层保持同类，会更可维护。

## 参考（最佳实践）
- `vite-plugin-mock-dev-server` 模块开关与 include 装配（全局单写点）  
  https://vite-plugin-mock-dev-server.netlify.app/guide/usage
- ACL / Anti-Corruption Layer（翻译/隔离层的职责边界）  
  https://oneuptime.com/blog/post/2026-01-30-anti-corruption-layer-pattern/view

