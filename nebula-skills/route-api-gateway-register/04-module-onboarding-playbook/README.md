# 04-module-onboarding-playbook

## A. 同一子应用新增模块（最小接入）
1. 先执行：`05-registry-module-template`
   - 模板路径：`apex_dev/src/registry/sources/__template__/`
   - 目标：先把 `pages/actions/gateway-bindings/api-meta/index` 五类文件复制齐
2. 再接入统一消费入口
   - 文件：`apex_dev/src/registry/sources/index.ts`
   - 文件：`apex_dev/src/registry/index.ts`
   - 入口：`registrySources` + `export { <module>RegistrySource }`

## B. 新增微服务接入（跨微服务）
1. 基座 app config
   - 文件：`microfb/src/store/modules/appConfig.store.ts`（或持久化来源）
   - 属性：`name,entry,activeRule,enabled`
2. 基座注册中心 seed
   - 文件：`microfb/src/plugins/qiankun/apps.ts`
   - 入口：`seedApps(apps)`
3. 子应用上送能力
   - 文件：子应用 `plugins/qiankun/lifecycle.ts`
   - 入口：`registerBindingRegistry(buildBindingRegistrySnapshot())`
4. 基座聚合与下发
   - 文件：`microfb/src/store/modules/micro-app-binding-registry.store.ts`
   - 入口：`upsertSnapshot/getPublicState`

## C. 验收命令（建议）
1. `pnpm -C apex_dev test:unit src/views/tenant/__tests__/gateway-permission.test.ts src/permissions/registry-route-action/__tests__/page-action-registry.test.ts`
2. `rg "gatewayAction|perm|apiKeys|ApiMeta|RegistrySource" apex_dev/src/registry apex_dev/src/permissions`
3. `rg "registerBindingRegistry|getBindingRegistryState|upsertSnapshot" apex_dev/src microfb/src`

## D. 常见误区
1. 在组件中直接维护 API URL（错误，破坏单写点）
2. 在多个文件重复声明同一 `gatewayAction -> apiKeys`
3. 只改 `src/registry/sources/<module>` 的局部文件，不同步 `index.ts` 与 `@/registry` 出口，导致 resolver/registry 不一致
4. 新增模块时继续手改 `src/router/routes.ts`，而不是从 `*.pages.ts` 进入
