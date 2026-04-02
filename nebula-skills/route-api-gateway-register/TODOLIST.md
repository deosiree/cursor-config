# route-api-gateway-register TODOLIST

## A. 文档结构
- [ ] 父目录包含：`SKILL.md`、`README.md`、`TODOLIST.md`
- [ ] 至少 5 个子 skill 目录，每个目录包含：`SKILL.md`、`README.md`
- [ ] 父 skill 明确子 skill 的使用顺序与触发条件

## B. 真相源与单写点（文档级硬性验收）
- [ ] 每条链路都给出“真相源表”：节点、来源文件、来源变量、关键属性、下游消费点
- [ ] 每条链路都标注“单写点”：只允许修改的位置与禁止重复声明的位置
- [ ] 每条链路都标注“反例”：常见第二写点/散落写点（并说明为何不允许）

## C. 功能项 -> API -> 契约 -> 网关方法链路
- [ ] 说明 `actionKey/gatewayAction` 来源（`src/registry/sources/*/*.actions.ts`）
- [ ] 说明 `gatewayAction -> apiKeys` 来源（`src/registry/sources/*/*.gateway-bindings.ts`）
- [ ] 说明 `apiKey -> apiUrl/apiMethod` 来源（`src/registry/sources/*/*.api-meta.ts`）
- [ ] 说明模块级 `*RegistrySource` 如何在 `src/registry/sources/<module>/index.ts` 聚合
- [ ] 说明统一入口 `@/registry` 如何被注册中心、网关层、API 层消费
- [ ] 说明注册中心如何组装 `apis/apiUrls`（page-action-registry）
- [ ] 说明菜单功能节点 `perm/apis` 与前端 action 的 JOIN 关系

## D. 组件 -> 路由链路
- [ ] 说明页面路由真相源来自 `src/registry/sources/*/*.pages.ts`
- [ ] 说明 `@/registry` 如何产出 `getRegistryPages/getRegistryRouteTree`
- [ ] 说明 `routes.ts` 如何消费 route tree 生成 `constantRoutes`
- [ ] 说明页面路由注册来源与归一化规则（full/local route）
- [ ] 说明组件路径 `componentImportPath/componentDisplayPath/componentStoragePath` 来源与用途
- [ ] 说明菜单绑定弹窗如何消费 route/action/function 候选集

## E. 前端持久化与后端持久化
- [ ] 前端持久化：菜单缓存、用户上下文、主应用注册中心状态（文件与 key）
- [ ] 后端持久化：菜单树与功能项绑定（`perm/apis`）的后端落库边界
- [ ] 明确“哪些数据前端仅缓存，哪些以后端为准”

## F. 微服务上送/基座下发
- [ ] 说明子应用 snapshot 生成来源与字段结构
- [ ] 说明主应用 `registerBindingRegistry/getBindingRegistryState` 聚合与下发流程
- [ ] 说明 `functions` 优先、`actions` 兼容回退策略

## G. 新增模块接入清单（同一微服务）
- [ ] 必须新增/更新的文件清单（pages、actions、gateway-bindings、api-meta、sources/<module>/index.ts、src/registry/index.ts）
- [ ] 验证命令清单（单测/静态检查/关键 grep）
- [ ] “最小改动单”与“禁止改动单”

## H. 新增微服务接入清单（跨微服务）
- [ ] 基座配置接入点（app config、activeRule、qiankun props）
- [ ] 子应用上送能力接入点（snapshot/report）
- [ ] 主应用聚合与菜单绑定消费检查点

## I. 术语与命名一致性
- [ ] 全文统一使用：`actionKey`、`gatewayAction`、`apiKeys`、`apis`、`apiUrls`
- [ ] 全文统一使用：`registry source`、`@/registry`、`src/registry/sources/*`
- [ ] 全文统一区分：`*.pages.ts` 是路由真相源，`routes.ts` / `page-route-registry.ts` 是消费者
- [ ] 删除旧链路术语：`permission-meta`（若为已废弃）
- [ ] 示例变量名与真实代码变量名一致

## J. 完成定义（DoD）
- [ ] 能直接回答“改哪里是单写点”
- [ ] 能直接回答“这个节点的数据从哪个文件哪个变量来”
- [ ] 能直接回答“新增模块/新增微服务要改哪些文件”
