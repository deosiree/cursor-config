# permission-and-qiankun

本目录沉淀本轮 `apex_dev + microfb` 权限管理、菜单管理与 qiankun 注册中心相关能力，目标是把“单一写点、注册中心扩展、基座汇总、运行时守卫、菜单 UI/UX”这些可迁移模式固化成可复用 skill。

当前包含：

1. `permission-and-qiankun-router`
   - 总入口 skill，先判断当前问题属于哪条主线，再路由到合适的子 skill。

2. `tenant-permission-migrate`
   - 以“租户管理”现状为模板，迁移其他模块到注册中心 + runtime permission resolver 模型。

3. `micro-app-binding-registry-aggregation`
   - 将多个微服务的本地注册中心通过 qiankun props 上报给基座，再由基座 pinia 汇总成总注册中心。

4. `menu-type-binding-ux-refactor`
   - 重构菜单管理中“关联微服务 / 关联路由 / 关联权限标识”的统一绑定交互。

5. `runtime-permission-guard-alignment`
   - 收口 `v-confirmPerm`、gateway 短路和 runtime resolver 的权限判断链。

6. `permission-state-machine-chain`
   - 汇总“菜单管理 -> 注册中心 -> runtime resolver -> v-confirmPerm -> gateway”的用户使用链路与状态机。

7. `sidebar-page-leaf-enforcement`
   - 修复运行态左侧菜单，把 `page` 固定为最小可显示类型，`function` 永不进入导航树。

8. `fail-fast-single-write-point`
   - 固化“单一写点 + fail-fast + 不吞错”的通用工程约束。

9. `menu-tree-truth-source-discipline`
   - 固化“菜单树是真相源，注册中心是扩展视图”的边界纪律。

10. `menu-binding-type-matrix`
   - 固化 `menu / directory / page / function` 的绑定矩阵、候选矩阵与写回矩阵。

11. `frontend-registry-contract`
   - 固化微服务本地注册中心的字段契约、命名边界和来源说明。

12. `menu-refresh-propagation`
   - 固化菜单修改后从 `menu/update` 到缓存刷新、页面生效的传播链路。

13. `mf-host-child-registry-sync`
   - 固化 qiankun 下基座与子应用之间的注册中心通信协议与同步边界。

所有 skill 的共同前提：

1. 后端 `menu`/菜单树是业务真相源。
2. 注册中心是菜单树的扩展视图，不是第二真相源。
3. 单一写点优先，缺字段时 fail-fast，不用 `?.` 或静默兜底吞错。
4. 每个 skill 都要先梳理“链路业务逻辑（状态机）”，再开始改代码。
