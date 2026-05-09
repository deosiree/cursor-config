下面给出基于你指定主题（`菜单管理与权限；权限注册中心`）的“分批提交”MVP 计划：分别对 `apex_dev` 与 `microfb` 做 5 批（总计 10 批），并按依赖拓扑把“构建/类型 -> gateway/路由 -> 权限注册中心 -> qiankun -> UI/测试”串起来。以下仅生成可复制命令，不会执行任何 `git commit/push`。

## 实现（分批提交计划）

### microfb/1
**提交说明**
```text
chore(build): :link: init pinia + permission registry store foundation
```

**能力映射**
- 主能力：`权限注册中心（micro-app binding registry store）`
- 关联能力：`pinia 初始化` / `auto-import 类型补齐`

**文件（每行一个）**
```
.env.development
.env.production
vite.config.ts
src/vite-env.d.ts
src/types/auto-imports.d.ts
src/store/pinia.ts
src/store/index.ts
src/store/modules/micro-app-binding-registry.store.ts
src/gateway/__tests__/micro-app-binding-registry.store.test.ts
```

**git commit命令**
```powershell
# === microfb / 批次 1 ===
Set-Location "F:\Documents\Repertory\Sieyuan\nebula\microfb"
git status --short

@'
chore(build): :link: init pinia + permission registry store foundation

【元信息】
主题：菜单管理与权限；权限注册中心
能力：权限注册中心（micro-app binding registry store）/ pinia / auto-import

【摘要】
为权限注册中心新增 store 基础设施，并补齐构建与类型入口。

定义：
新增 micro-app binding registry store，并完成 pinia 与类型入口初始化。
问题：
权限注册中心缺少稳定的全局状态承载与类型/构建入口，影响后续路由与菜单绑定。
解决：
在同一批次提交 pinia/store/index/auto-import 与 registry store 实现及其最小测试。
价值：
降低后续路由/qiankun/菜单 UI 依赖的不确定性，保证可回滚与可验证。
'@ | Set-Content -Path ".git/commit-msg-microfb-1.txt" -Encoding utf8

git add -- ".env.development" ".env.production" "vite.config.ts" "src/vite-env.d.ts" "src/types/auto-imports.d.ts" `
          "src/store/pinia.ts" "src/store/index.ts" "src/store/modules/micro-app-binding-registry.store.ts" `
          "src/gateway/__tests__/micro-app-binding-registry.store.test.ts"

git commit -F ".git/commit-msg-microfb-1.txt"

git log -1 --format=full
git push --dry-run origin seccenter_v2
# 确认通过后再手动执行：git push origin seccenter_v2
```

### microfb/2
**提交说明**
```text
feat(router): :route: add registry route-path + route-base gateway
```

**能力映射**
- 主能力：`权限注册中心（registry route path）与 route-base gateway 适配`

**文件（每行一个）**
```
src/router/utils/registry-route-path.ts
src/gateway/route-base.gateway.ts
src/gateway/__tests__/registry-route-path.test.ts
src/gateway/__tests__/route-base.gateway.test.ts
```

**git commit命令**
```powershell
# === microfb / 批次 2 ===
Set-Location "F:\Documents\Repertory\Sieyuan\nebula\microfb"
git status --short

@'
feat(router): :route: add registry route-path + route-base gateway

【元信息】
主题：菜单管理与权限；权限注册中心
能力：registry route-path / route-base gateway

【摘要】
实现路由路径注册工具，并把 route-base gateway 与之对齐。

定义：
新增 registry-route-path，并联动修改 route-base gateway，同时补齐对应测试。
问题：
权限注册中心需要稳定、可推断的路由路径来源；否则会导致菜单绑定与 gateway 行为不一致。
解决：
把路径注册逻辑与 route-base gateway 的调用链放在同一批次提交，测试覆盖关键入口。
价值：
保证“注册中心 -> 路由映射 -> 网关取数”的一致性与可回归。
'@ | Set-Content -Path ".git/commit-msg-microfb-2.txt" -Encoding utf8

git add -- "src/router/utils/registry-route-path.ts" "src/gateway/route-base.gateway.ts" `
          "src/gateway/__tests__/registry-route-path.test.ts" "src/gateway/__tests__/route-base.gateway.test.ts"

git commit -F ".git/commit-msg-microfb-2.txt"

git log -1 --format=full
git push --dry-run origin seccenter_v2
# 确认通过后再手动执行：git push origin seccenter_v2
```

### microfb/3
**提交说明**
```text
feat(menu): :menu: menu-sync + MenuItem integration
```

**能力映射**
- 主能力：`菜单管理与刷新同步`

**文件（每行一个）**
```
src/services/menu/menu-sync.ts
src/layout/menu/components/MenuItem.vue
src/utils/menu.ts
src/gateway/__tests__/menu-sync-refresh.test.ts
```

**git commit命令**
```powershell
# === microfb / 批次 3 ===
Set-Location "F:\Documents\Repertory\Sieyuan\nebula\microfb"
git status --short

@'
feat(menu): :menu: menu-sync + MenuItem integration

【元信息】
主题：菜单管理与权限；权限注册中心
能力：menu-sync / MenuItem / menu utils

【摘要】
将菜单同步服务与 MenuItem 展示/刷新链路打通。

定义：
修改 menu-sync 与菜单工具函数，并在 MenuItem 层完成集成，同时更新刷新同步测试。
问题：
菜单展示依赖的数据与刷新触发路径不一致时，权限变更可能无法实时反映到 UI。
解决：
把数据同步（service）与 UI 渲染（component）放同批次，并用刷新同步测试作为证据。
价值：
提升权限变更后的菜单一致性与可验证性。
'@ | Set-Content -Path ".git/commit-msg-microfb-3.txt" -Encoding utf8

git add -- "src/services/menu/menu-sync.ts" "src/layout/menu/components/MenuItem.vue" "src/utils/menu.ts" `
          "src/gateway/__tests__/menu-sync-refresh.test.ts"

git commit -F ".git/commit-msg-microfb-3.txt"

git log -1 --format=full
git push --dry-run origin seccenter_v2
# 确认通过后再手动执行：git push origin seccenter_v2
```

### microfb/4
**提交说明**
```text
feat(qiankun): :ship: wire qiankun apps for menu/permission sync
```

**能力映射**
- 主能力：`qiankun 应用注册与联动`

**文件（每行一个）**
```
src/plugins/qiankun/apps.ts
```

**git commit命令**
```powershell
# === microfb / 批次 4 ===
Set-Location "F:\Documents\Repertory\Sieyuan\nebula\microfb"
git status --short

@'
feat(qiankun): :ship: wire qiankun apps for menu/permission sync

【元信息】
主题：菜单管理与权限；权限注册中心
能力：qiankun apps 注册表

【摘要】
完善 qiankun 应用注册，确保菜单/权限相关链路能被正确挂载。

定义：
修改 qiankun apps 注册配置。
问题：
在微前端场景下，菜单/权限同步需要在正确的挂载时机注册与可达。
解决：
仅对 apps 注册配置做单点改动，依赖由前置批次的 store/router/menu 对齐提供。
价值：
降低跨域挂载时序导致的不一致风险。
'@ | Set-Content -Path ".git/commit-msg-microfb-4.txt" -Encoding utf8

git add -- "src/plugins/qiankun/apps.ts"

git commit -F ".git/commit-msg-microfb-4.txt"

git log -1 --format=full
git push --dry-run origin seccenter_v2
# 确认通过后再手动执行：git push origin seccenter_v2
```

### microfb/5
**提交说明**
```text
chore(mocks): :beaker: update seccenter v2 mocks for menu sync tests
```

**能力映射**
- 主能力：`测试/Mock 适配`

**文件（每行一个）**
```
mock/seccenter.auth.v2.mock.ts
mock/seccenter.menu.v2.mock.ts
```

**git commit命令**
```powershell
# === microfb / 批次 5 ===
Set-Location "F:\Documents\Repertory\Sieyuan\nebula\microfb"
git status --short

@'
chore(mocks): :beaker: update seccenter v2 mocks for menu sync tests

【元信息】
主题：菜单管理与权限；权限注册中心
能力：seccenter v2 mocks

【摘要】
同步更新 seccenter v2 的 mock 数据，保证菜单/权限链路测试稳定。

定义：
更新 seccenter v2 auth 与 menu mock。
问题：
权限注册中心与菜单同步改动后，旧 mock 可能导致测试断言与行为偏离。
解决：
把 mock 更新集中到最后一批，便于回滚与定位。
价值：
减少因测试数据漂移引发的噪音失败。
'@ | Set-Content -Path ".git/commit-msg-microfb-5.txt" -Encoding utf8

git add -- "mock/seccenter.auth.v2.mock.ts" "mock/seccenter.menu.v2.mock.ts"

git commit -F ".git/commit-msg-microfb-5.txt"

git log -1 --format=full
git push --dry-run origin seccenter_v2
# 确认通过后再手动执行：git push origin seccenter_v2
```

---

### apex_dev/1
**提交说明**
```text
chore(build): :toolbox: align env + Vite/Vitest config for menu/permissions refactor
```

**能力映射**
- 主能力：`构建与类型入口对齐`

**文件（每行一个）**
```
.env.development
.env.production
.env
package.json
pnpm-lock.yaml
vite.config.ts
vitest.config.ts
src/types/env.d.ts
```

**git commit命令**
```powershell
# === apex_dev / 批次 1 ===
Set-Location "F:\Documents\Repertory\Sieyuan\nebula\apex_dev"
git status --short

@'
chore(build): :toolbox: align env + Vite/Vitest config for menu/permissions refactor

【元信息】
主题：菜单管理与权限；权限注册中心
能力：构建/环境/类型入口

【摘要】
先对齐构建与环境入口，降低后续重构引入的编译与运行不确定性。

定义：
更新 package/lock、vite/vitest 配置以及环境与 env 类型声明。
问题：
权限注册中心与菜单 UI 大规模重构，对构建与类型入口依赖更强；若先后不清晰易造成回归难定位。
解决：
把“构建/类型入口”作为第一批独立提交，后续批次只承接代码语义变化。
价值：
提升后续批次验证效率，并保留可独立回滚的基础层。
'@ | Set-Content -Path ".git/commit-msg-apex-1.txt" -Encoding utf8

git add -- ".env.development" ".env.production" ".env" "package.json" "pnpm-lock.yaml" "vite.config.ts" "vitest.config.ts" "src/types/env.d.ts"

git commit -F ".git/commit-msg-apex-1.txt"

git log -1 --format=full
git push --dry-run origin seccenter_v2
# 注意：如 `.env` 含密钥，请先人工确认是否应提交
# 确认通过后再手动执行：git push origin seccenter_v2
```

### apex_dev/2
**提交说明**
```text
feat(gateway): :gear: migrate menu/role/tenant gateway APIs + route-base
```

**能力映射**
- 主能力：`Gateway（路由/网关）适配与 v2 endpoints 引入`

**文件（每行一个）**
```
src/api/auth.api.ts
src/api/device/device.api.ts
src/gateway/__tests__/menu.gateway.test.ts
src/gateway/__tests__/role-config.gateway.test.ts
src/gateway/__tests__/tenant.gateway.test.ts
src/gateway/__tests__/resource-project.gateway.test.ts
src/gateway/__tests__/route-base.gateway.test.ts
src/gateway/config.gateway.ts
src/gateway/device.gateway.ts
src/gateway/menu-legacy.gateway.ts
src/gateway/menu.gateway.ts
src/gateway/resource-project.gateway.ts
src/gateway/role.gateway.ts
src/gateway/route-base.gateway.ts
src/gateway/tenant.gateway.ts
src/api/resource/project.api.ts
src/api/seccenter/dbres-project.v2.api.ts
src/api/seccenter/role.v2.api.ts
src/api/seccenter/role.v2.endpoints.ts
src/api/seccenter/tenant.v2.endpoints.ts
src/api/system/tenant.api.ts
src/constants/route-paths.ts
```

**git commit命令**
```powershell
# === apex_dev / 批次 2 ===
Set-Location "F:\Documents\Repertory\Sieyuan\nebula\apex_dev"
git status --short

@'
feat(gateway): :gear: migrate menu/role/tenant gateway APIs + route-base

【元信息】
主题：菜单管理与权限；权限注册中心
能力：gateway v2 适配（route-base + menu/role/tenant/resource）

【摘要】
将菜单/权限相关网关与 v2 endpoints 做一致性迁移，并补齐网关级测试。

定义：
修改多类 gateway API，并引入 seccenter v2 endpoints/资源 api，同时移除旧 route-paths 常量。
问题：
权限与菜单管理需要稳定网关语义与路由基础；若 v1/v2 混用或路由常量失配，会导致路由映射与权限解析出错。
解决：
将 route-base 与相关 gateway 迁移放在同批次，依赖在后续权限注册中心批次中完成对齐。
价值：
为权限注册中心与菜单 UI 提供可预测的数据与入口契约。
'@ | Set-Content -Path ".git/commit-msg-apex-2.txt" -Encoding utf8

git add -A -- "src/api/auth.api.ts" "src/api/device/device.api.ts" `
  "src/gateway/config.gateway.ts" "src/gateway/device.gateway.ts" "src/gateway/menu-legacy.gateway.ts" "src/gateway/menu.gateway.ts" `
  "src/gateway/resource-project.gateway.ts" "src/gateway/role.gateway.ts" "src/gateway/route-base.gateway.ts" "src/gateway/tenant.gateway.ts" `
  "src/gateway/__tests__/menu.gateway.test.ts" "src/gateway/__tests__/role-config.gateway.test.ts" "src/gateway/__tests__/tenant.gateway.test.ts" `
  "src/gateway/__tests__/resource-project.gateway.test.ts" "src/gateway/__tests__/route-base.gateway.test.ts" `
  "src/api/resource/project.api.ts" "src/api/seccenter/role.v2.api.ts" "src/api/seccenter/dbres-project.v2.api.ts" `
  "src/api/seccenter/role.v2.endpoints.ts" "src/api/seccenter/tenant.v2.endpoints.ts" "src/api/system/tenant.api.ts" `
  "src/constants/route-paths.ts"

git commit -F ".git/commit-msg-apex-2.txt"

git log -1 --format=full
git push --dry-run origin seccenter_v2
# 确认通过后再手动执行：git push origin seccenter_v2
```

### apex_dev/3
**提交说明**
```text
feat(permissions): :lock: add permission meta registry + confirmPerm directive
```

**能力映射**
- 主能力：`权限注册中心（permission meta + confirmPerm 指令 + resolver）`

**文件（每行一个）**
```
src/gateway/gateway-permission-meta.ts
src/gateway/role.permission-meta.ts
src/gateway/tenant.permission-meta.ts
src/directive/index.ts
src/directive/confirmPerm/index.ts
src/permissions/binding-registry-snapshot.ts
src/permissions/page-action-registry.ts
src/permissions/runtime-permission-resolver.ts
src/views/tenant/__tests__/confirmPerm.test.ts
src/views/tenant/__tests__/runtime-permission-resolver.test.ts
```

**git commit命令**
```powershell
# === apex_dev / 批次 3 ===
Set-Location "F:\Documents\Repertory\Sieyuan\nebula\apex_dev"
git status --short

@'
feat(permissions): :lock: add permission meta registry + confirmPerm directive

【元信息】
主题：菜单管理与权限；权限注册中心
能力：权限 meta registry / confirmPerm / runtime-permission-resolver

【摘要】
引入权限注册中心的 meta 与 runtime resolver，并提供 confirmPerm 指令用于权限确认。

定义：
新增 gateway permission meta、权限解析 resolver 与 confirmPerm 指令入口，并补齐 tenant 侧测试。
问题：
菜单与权限需要统一的权限判定来源；若缺少可复用的 meta/解析层，UI 权限会散落在组件中导致不可维护。
解决：
把“meta（静态描述）-> resolver（运行判定）-> 指令（UI 兜底）”集中提交，并由测试提供证据。
价值：
提升权限注册中心的可扩展性与一致性，并降低 UI 侧耦合。
'@ | Set-Content -Path ".git/commit-msg-apex-3.txt" -Encoding utf8

git add -- "src/gateway/gateway-permission-meta.ts" "src/gateway/role.permission-meta.ts" "src/gateway/tenant.permission-meta.ts" `
  "src/directive/index.ts" "src/directive/confirmPerm/index.ts" `
  "src/permissions/binding-registry-snapshot.ts" "src/permissions/page-action-registry.ts" "src/permissions/runtime-permission-resolver.ts" `
  "src/views/tenant/__tests__/confirmPerm.test.ts" "src/views/tenant/__tests__/runtime-permission-resolver.test.ts"

git commit -F ".git/commit-msg-apex-3.txt"

git log -1 --format=full
git push --dry-run origin seccenter_v2
# 确认通过后再手动执行：git push origin seccenter_v2
```

### apex_dev/4
**提交说明**
```text
feat(router-store): :route: binding-registry store + router route mapping + qiankun wiring
```

**能力映射**
- 主能力：`权限注册中心的绑定注册中心（binding-registry store）与路由映射`

**文件（每行一个）**
```
src/router/index.ts
src/router/routes.ts
src/router/utils/app-scope.ts
src/router/utils/page-route-registry.ts
src/store/index.ts
src/store/modules/appConfig.store.ts
src/store/modules/binding-registry.store.ts
src/store/pinia.ts
src/plugins/qiankun/actions.ts
src/plugins/qiankun/index.ts
src/plugins/qiankun/lifecycle.ts
src/views/tenant/index.vue
src/views/system/role/role.actions.ts
src/views/tenant/tenant.actions.ts
```

**git commit命令**
```powershell
# === apex_dev / 批次 4 ===
Set-Location "F:\Documents\Repertory\Sieyuan\nebula\apex_dev"
git status --short

@'
feat(router-store): :route: binding-registry store + router route mapping + qiankun wiring

【元信息】
主题：菜单管理与权限；权限注册中心
能力：binding-registry store / router route registry / qiankun wiring

【摘要】
把权限注册中心的绑定注册能力落到 store，并完成路由映射与微前端挂载链路。

定义：
新增 binding-registry store 与路由映射工具，联动 router/store 初始化，并对 qiankun 插件挂载做适配。
问题：
权限注册中心需要把“绑定关系”落到可查询、可回滚的全局存储，并在路由与微前端挂载上保持一致。
解决：
以同一批次提交 router/store 及 qiankun 相关挂载，确保菜单/权限链路的入口可达。
价值：
降低“绑定关系有但路由/挂载不可达”的风险，提高端到端一致性。
'@ | Set-Content -Path ".git/commit-msg-apex-4.txt" -Encoding utf8

git add -- "src/router/index.ts" "src/router/routes.ts" "src/router/utils/app-scope.ts" "src/router/utils/page-route-registry.ts" `
  "src/store/index.ts" "src/store/modules/appConfig.store.ts" "src/store/modules/binding-registry.store.ts" "src/store/pinia.ts" `
  "src/plugins/qiankun/actions.ts" "src/plugins/qiankun/index.ts" "src/plugins/qiankun/lifecycle.ts" `
  "src/views/tenant/index.vue" "src/views/system/role/role.actions.ts" "src/views/tenant/tenant.actions.ts"

git commit -F ".git/commit-msg-apex-4.txt"

git log -1 --format=full
git push --dry-run origin seccenter_v2
# 确认通过后再手动执行：git push origin seccenter_v2
```

### apex_dev/5
**提交说明**
```text
feat(menu-ui): :menu: refactor system menu to menu-type binding UI
```

**能力映射**
- 主能力：`菜单管理与权限（menu-type binding UI + composables）`

**文件（每行一个）**
```
src/enums/system/menu.enum.ts
src/views/system/menu/index.vue
src/views/system/menu/components/MenuWorkspace.vue
src/views/system/menu/components/MenuTreePanelRenderer.vue
src/views/system/menu/components/menu-tree-helpers.ts

src/views/system/menu/components/MenuTypeBindingDialog.vue
src/views/system/menu/components/MenuTypeFormDialog.vue
src/views/system/menu/components/function-action-resolver.ts
src/views/system/menu/components/menu-type-binding.columns.ts
src/views/system/menu/components/menu-type-binding.registry.ts
src/views/system/menu/components/menu-type-form.config.ts
src/views/system/menu/components/menu-type-form.helpers.ts
src/views/system/menu/components/menu-type-form.submit.ts

src/views/system/menu/composables/useDirectoryRouteBindingMode.ts
src/views/system/menu/composables/useMenuTypeBindingDialog.ts
src/views/system/menu/composables/useMenuTypeBindingSummary.ts
src/views/system/menu/composables/useMenuTypeFormInitialization.ts
src/views/system/menu/composables/useMenuTypeFormViewState.ts
src/views/system/menu/composables/useMenuTypeSortSync.ts
src/views/system/menu/composables/useProjectOptions.ts
src/views/system/menu/composables/useRequiredRouteBinding.ts

src/views/system/menu/__tests__/MenuTreePanelRenderer.test.ts
src/views/system/menu/__tests__/MenuWorkspace.test.ts
src/views/system/menu/__tests__/SystemMenuPage.test.ts
src/views/system/menu/__tests__/menu-workspace.helpers.test.ts
src/views/system/menu/__tests__/MenuTypeBindingDialog.test.ts
src/views/system/menu/__tests__/MenuTypeFormDialog.test.ts
src/views/system/menu/__tests__/binding-registry-snapshot.test.ts
src/views/system/menu/__tests__/function-action-resolver.test.ts
src/views/system/menu/__tests__/function-action-resolver.ts
src/views/system/menu/__tests__/menu-type-binding.registry.test.ts
src/views/system/menu/__tests__/menu-type-form.config.test.ts
src/views/system/menu/__tests__/menu-type-form.submit.test.ts
src/views/system/menu/__tests__/page-action-registry.test.ts
src/views/system/menu/__tests__/page-route-registry.test.ts
src/views/system/menu/__tests__/useDirectoryRouteBindingMode.test.ts
src/views/system/menu/__tests__/useMenuTypeBindingDialog.test.ts
src/views/system/menu/__tests__/useMenuTypeBindingSummary.test.ts
src/views/system/menu/__tests__/useMenuTypeFormInitialization.test.ts
src/views/system/menu/__tests__/useMenuTypeFormViewState.test.ts
src/views/system/menu/__tests__/useMenuTypeSortSync.test.ts
src/views/system/menu/__tests__/useProjectOptions.test.ts
src/views/system/menu/__tests__/useRequiredRouteBinding.test.ts

src/views/system/menu/components/FunctionItemFormDialog.vue
src/views/system/menu/components/MenuFormDialog.vue
src/views/system/menu/components/MenuPanelToolbarActions.vue
src/views/system/menu/components/MenuRowActionButtons.vue
src/views/system/menu/components/PermissionConfigDialog.vue
src/views/system/menu/__tests__/FunctionItemFormDialog.test.ts
```

**git commit命令**
```powershell
# === apex_dev / 批次 5 ===
Set-Location "F:\Documents\Repertory\Sieyuan\nebula\apex_dev"
git status --short

@'
feat(menu-ui): :menu: refactor system menu to menu-type binding UI

【元信息】
主题：菜单管理与权限；权限注册中心
能力：menu-type binding UI / composables / menu workspace/tree panel

【摘要】
将系统菜单重构为 menu-type binding 体系，并同步更新/替换相关测试与旧组件。

定义：
新增 MenuTypeBindingDialog/MenuTypeFormDialog 及其 registry/config/composables，并在 menu workspace/tree panel 上完成集成；删除旧 FunctionItem/PermissionConfig 组件及其测试。
问题：
旧菜单管理组件与权限注册中心能力不匹配，导致绑定/动作解析路径难以扩展且维护成本高。
解决：
用 menu-type binding registry 与 composables 承载绑定与路由推导，并把 UI 集成与测试替换放在同一批次，确保可验证。
价值：
提升菜单管理在“权限注册中心”语义下的可扩展性，减少耦合并增强回归确定性。
'@ | Set-Content -Path ".git/commit-msg-apex-5.txt" -Encoding utf8

git add -A -- "src/enums/system/menu.enum.ts" "src/views/system/menu/index.vue" `
  "src/views/system/menu/components/MenuWorkspace.vue" "src/views/system/menu/components/MenuTreePanelRenderer.vue" "src/views/system/menu/components/menu-tree-helpers.ts" `
  "src/views/system/menu/components/MenuTypeBindingDialog.vue" "src/views/system/menu/components/MenuTypeFormDialog.vue" `
  "src/views/system/menu/components/function-action-resolver.ts" "src/views/system/menu/components/menu-type-binding.columns.ts" "src/views/system/menu/components/menu-type-binding.registry.ts" `
  "src/views/system/menu/components/menu-type-form.config.ts" "src/views/system/menu/components/menu-type-form.helpers.ts" "src/views/system/menu/components/menu-type-form.submit.ts" `
  "src/views/system/menu/composables/useDirectoryRouteBindingMode.ts" "src/views/system/menu/composables/useMenuTypeBindingDialog.ts" "src/views/system/menu/composables/useMenuTypeBindingSummary.ts" `
  "src/views/system/menu/composables/useMenuTypeFormInitialization.ts" "src/views/system/menu/composables/useMenuTypeFormViewState.ts" "src/views/system/menu/composables/useMenuTypeSortSync.ts" `
  "src/views/system/menu/composables/useProjectOptions.ts" "src/views/system/menu/composables/useRequiredRouteBinding.ts" `
  "src/views/system/menu/__tests__/MenuTreePanelRenderer.test.ts" "src/views/system/menu/__tests__/MenuWorkspace.test.ts" "src/views/system/menu/__tests__/SystemMenuPage.test.ts" "src/views/system/menu/__tests__/menu-workspace.helpers.test.ts" `
  "src/views/system/menu/__tests__/MenuTypeBindingDialog.test.ts" "src/views/system/menu/__tests__/MenuTypeFormDialog.test.ts" "src/views/system/menu/__tests__/binding-registry-snapshot.test.ts" `
  "src/views/system/menu/__tests__/function-action-resolver.test.ts" "src/views/system/menu/__tests__/function-action-resolver.ts" "src/views/system/menu/__tests__/menu-type-binding.registry.test.ts" `
  "src/views/system/menu/__tests__/menu-type-form.config.test.ts" "src/views/system/menu/__tests__/menu-type-form.submit.test.ts" "src/views/system/menu/__tests__/page-action-registry.test.ts" `
  "src/views/system/menu/__tests__/page-route-registry.test.ts" "src/views/system/menu/__tests__/useDirectoryRouteBindingMode.test.ts" "src/views/system/menu/__tests__/useMenuTypeBindingDialog.test.ts" `
  "src/views/system/menu/__tests__/useMenuTypeBindingSummary.test.ts" "src/views/system/menu/__tests__/useMenuTypeFormInitialization.test.ts" "src/views/system/menu/__tests__/useMenuTypeFormViewState.test.ts" `
  "src/views/system/menu/__tests__/useMenuTypeSortSync.test.ts" "src/views/system/menu/__tests__/useProjectOptions.test.ts" "src/views/system/menu/__tests__/useRequiredRouteBinding.test.ts" `
  "src/views/system/menu/components/FunctionItemFormDialog.vue" "src/views/system/menu/components/MenuFormDialog.vue" "src/views/system/menu/components/MenuPanelToolbarActions.vue" `
  "src/views/system/menu/components/MenuRowActionButtons.vue" "src/views/system/menu/components/PermissionConfigDialog.vue" "src/views/system/menu/__tests__/FunctionItemFormDialog.test.ts"

git commit -F ".git/commit-msg-apex-5.txt"

git log -1 --format=full
git push --dry-run origin seccenter_v2
# 确认通过后再手动执行：git push origin seccenter_v2
```

## 自检（类型 / 边界 / 错误处理）
1. 文件清单均为“具体文件路径”，不包含目录项；`apex_dev/2` 与 `apex_dev/5` 使用 `git add -A` 以覆盖删除文件的 staging。
2. 每个批次的提交意图保持单一职责（基础设施、gateway、权限注册中心、路由/挂载、UI/测试分层），便于独立回滚。
3. 本输出不执行 `git commit`/`git push`，你仅需复制每批命令；如发现 `.env` 含密钥，建议不要提交或先从该批次移除。

如果你希望我把这 10 批进一步“按 capability tag 更细化”（例如把 `apex_dev/5` 再拆成 menu-type core 与 menu page 集成两批，降低单次变更规模），告诉我你们团队期望的最大 commit 文件数/最大变更目录数即可。