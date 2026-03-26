---
name: tenant-permission-migrate
description: Use when 需要把其他业务模块按“租户管理”现状迁移到注册中心 + 运行时权限守卫模型，并删除版本兜底、散落写点、手工权限配置等冗余逻辑。
---

# 租户管理权限迁移模板

## Overview
以 `apex_dev` 中“租户管理”模块为基线，把其他模块迁移到统一的权限模型：

1. 页面/动作的前端写点收口到注册中心。
2. 运行时权限判断收口到 resolver。
3. 页面按钮与 gateway 都走同一条权限链。
4. 菜单管理通过 `menu.perm` 和 `menu.routePath/component` 绑定，不再手工录入 API。

## 适用场景
1. 用户输入“模块名”，希望按租户管理模板改造其他模块。
2. 现有模块里还有 `v-hasPerm`、散落 API 权限判断、页面自己拼权限串。
3. gateway、页面、指令之间的权限口径不一致。
4. 还保留旧版本兜底、临时 fallback、手工输入 API 权限等逻辑，需要先瘦身再改造。

## 先看哪些文件
优先阅读下列路径，不需要先看全仓库：

1. 租户管理基线
- [apex_dev/src/views/tenant/index.vue](f:/Documents/Repertory/Sieyuan/nebula/apex_dev/src/views/tenant/index.vue)
- [apex_dev/src/views/tenant/tenant.actions.ts](f:/Documents/Repertory/Sieyuan/nebula/apex_dev/src/views/tenant/tenant.actions.ts)
- [apex_dev/src/api/gateway/tenant.gateway.ts](f:/Documents/Repertory/Sieyuan/nebula/apex_dev/src/api/gateway/tenant.gateway.ts)
- [apex_dev/src/api/gateway/tenant.permission-meta.ts](f:/Documents/Repertory/Sieyuan/nebula/apex_dev/src/api/gateway/tenant.permission-meta.ts)

2. 注册中心与运行时解析
- [apex_dev/src/router/routes.ts](f:/Documents/Repertory/Sieyuan/nebula/apex_dev/src/router/routes.ts)
- [apex_dev/src/router/utils/page-route-registry.ts](f:/Documents/Repertory/Sieyuan/nebula/apex_dev/src/router/utils/page-route-registry.ts)
- [apex_dev/src/permissions/page-action-registry.ts](f:/Documents/Repertory/Sieyuan/nebula/apex_dev/src/permissions/page-action-registry.ts)
- [apex_dev/src/permissions/runtime-permission-resolver.ts](f:/Documents/Repertory/Sieyuan/nebula/apex_dev/src/permissions/runtime-permission-resolver.ts)
- [apex_dev/src/directive/confirmPerm/index.ts](f:/Documents/Repertory/Sieyuan/nebula/apex_dev/src/directive/confirmPerm/index.ts)

3. 菜单管理绑定链
- [apex_dev/src/views/system/menu/components/MenuTypeFormDialog.vue](f:/Documents/Repertory/Sieyuan/nebula/apex_dev/src/views/system/menu/components/MenuTypeFormDialog.vue)
- [apex_dev/src/views/system/menu/components/menu-type-binding.registry.ts](f:/Documents/Repertory/Sieyuan/nebula/apex_dev/src/views/system/menu/components/menu-type-binding.registry.ts)

## 输入
用户输入：`模块名`

需要先把模块名映射到 4 类文件：
1. 页面组件路径
2. 页面动作注册文件
3. gateway 文件
4. gateway permission meta 文件

如果这 4 类路径无法唯一定位，先失败并报出缺口，不要猜测。

## 迁移步骤
1. 先瘦身
- 删除版本兜底、业务层环境分支、页面内散落权限判断。
- 删除旧“手动 API 权限配置”或重复权限入口。
- 原则：业务层只保留一套权限语义。

2. 收口页面动作写点
- 在目标页面目录新增或收敛 `*.actions.ts`。
- 每个动作至少包含：
  - `actionKey`
  - `label`
  - `gatewayAction`
- 不在页面组件里重复维护动作列表。

3. 收口路由-组件写点
- 页面必须在 [apex_dev/src/router/routes.ts](f:/Documents/Repertory/Sieyuan/nebula/apex_dev/src/router/routes.ts) 中显式维护路由与组件映射。
- 不从运行时函数字符串反推组件路径。

4. 收口 gateway 元信息
- gateway 提供统一 `permissionMeta`。
- 页面动作只引用 `gatewayAction`，不直接引用 API URL。

5. 接入运行时守卫
- 页面按钮改为 `v-confirmPerm`。
- gateway 敏感方法在发请求前做 resolver 判定，不通过直接短路。

6. 接入菜单绑定
- 菜单页面节点绑定路由。
- 功能项绑定 `actionKey` 到 `menu.perm`。
- 不再手工输入 API 权限字符串。

## 链路业务逻辑（状态机）
按“租户管理”模板迁移其他模块时，先确认完整状态机：

1. 注册阶段
- 页面在路由写点中注册 `routePath -> component`。
- 页面在 `*.actions.ts` 中注册 `actionKey -> gatewayAction`。
- gateway permission meta 注册 `gatewayAction -> apiPath`。

2. 菜单绑定阶段
- 页面节点通过菜单管理绑定到注册中心路由。
- 功能项节点通过菜单管理绑定到页面动作，最终写 `menu.perm`。
- 保存后刷新菜单缓存，菜单树成为新的真相源。

3. 运行时解析阶段
- 页面进入后，runtime resolver 根据当前页面 `routePath` 和按钮 `actionKey` 查菜单树。
- 若菜单树中存在对应功能项绑定，则解析出允许状态与 API 路径。

4. 页面交互阶段
- `v-confirmPerm` 根据 resolver 结果决定按钮显示。
- 用户点击按钮后，gateway 在请求前再次做 resolver 判定。

5. 异常阶段
- 缺路由写点、缺动作注册、缺 gateway meta、缺菜单绑定，任一缺口都应直接暴露，不允许静默回退。

## 单一写点规则
1. 路由-组件写点只在 [apex_dev/src/router/routes.ts](f:/Documents/Repertory/Sieyuan/nebula/apex_dev/src/router/routes.ts)。
2. 页面动作写点只在目标页面的 `*.actions.ts`。
3. API 路径写点只在对应 gateway permission meta。
4. 菜单绑定结果只写后端 `menu` 表字段。
5. 缺少必要字段时直接报错，不用 `?.` 或 `try-catch` 静默吞掉。

## 验证
1. 检索旧权限散点：
```bash
rg --line-number "v-hasPerm|hasPerm|confirmPerm|perm|gatewayAction|permissionMeta" apex_dev/src/views/<模块目录> apex_dev/src/api/gateway
```

2. 检查是否已注册：
```bash
rg --line-number "<模块动作关键字>|<模块路由关键字>" apex_dev/src/router/routes.ts apex_dev/src/**/<模块>*.actions.ts apex_dev/src/api/gateway
```

3. 跑相关测试：
- 菜单绑定相关测试目录：`apex_dev/src/views/system/menu/__tests__`
- 模块自身 gateway 或页面测试目录：优先与目标模块同目录的 `__tests__`

## 常见错误
1. 直接在页面里拼 `actionKey -> API` 映射，绕过注册中心。
2. gateway 不做权限短路，只靠按钮隐藏。
3. 把 `gatewayAction` 写回数据库。
4. 同时保留旧权限配置入口和新绑定入口，造成双写点。
5. 遇到缺失写点时用空串兜底，后面排查会很难。
