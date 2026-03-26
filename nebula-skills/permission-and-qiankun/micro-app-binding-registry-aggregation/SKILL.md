---
name: micro-app-binding-registry-aggregation
description: Use when 需要把多个微服务的本地注册中心通过 qiankun props 上报给基座，并在基座 pinia 中汇总成可供菜单管理消费的多微服务注册中心。
---

# 基座聚合多微服务注册中心

## Overview
目标是把“各微服务自治注册中心”与“基座汇总视图”打通：

1. 每个微服务继续维护本地注册中心。
2. 基座通过 qiankun props 接收快照。
3. 基座 pinia 汇总成多微服务注册中心。
4. 菜单管理从总注册中心读取 tab、候选项和扩展字段。

核心原则：
1. 菜单树是业务真相源。
2. 注册中心是菜单树的扩展视图。
3. 基座总注册中心不是第二真相源，只是增强索引。

## 适用场景
1. 需要把另一个微服务仓库接入当前“关联微服务 / 关联路由 / 关联权限标识”总链路。
2. 只接了 `Apex`，要逐步把 `Opsdesk` 等应用接进总注册中心。
3. 需要让菜单管理页支持多微服务 tab，但不想让基座硬编码各子应用的路由/动作细节。

## 输入
用户输入：`其他微服务的仓库根路径`

你需要在该仓库中定位：
1. qiankun 生命周期入口
2. 本地 routes 写点
3. 页面动作注册写点
4. gateway permission meta 写点

缺任意一项时直接报错并指出缺口。

## 先看哪些文件
基座：
- [microfb/src/plugins/qiankun/apps.ts](f:/Documents/Repertory/Sieyuan/nebula/microfb/src/plugins/qiankun/apps.ts)
- [microfb/src/store/modules/appConfig.store.ts](f:/Documents/Repertory/Sieyuan/nebula/microfb/src/store/modules/appConfig.store.ts)
- [microfb/src/store/modules/micro-app-binding-registry.store.ts](f:/Documents/Repertory/Sieyuan/nebula/microfb/src/store/modules/micro-app-binding-registry.store.ts)

当前 `Apex` 模板：
- [apex_dev/src/plugins/qiankun/lifecycle.ts](f:/Documents/Repertory/Sieyuan/nebula/apex_dev/src/plugins/qiankun/lifecycle.ts)
- [apex_dev/src/permissions/binding-registry-snapshot.ts](f:/Documents/Repertory/Sieyuan/nebula/apex_dev/src/permissions/binding-registry-snapshot.ts)
- [apex_dev/src/router/utils/page-route-registry.ts](f:/Documents/Repertory/Sieyuan/nebula/apex_dev/src/router/utils/page-route-registry.ts)
- [apex_dev/src/permissions/page-action-registry.ts](f:/Documents/Repertory/Sieyuan/nebula/apex_dev/src/permissions/page-action-registry.ts)

## 执行步骤
1. 在目标微服务内定位本地注册中心
- 路由写点只认 `routes.ts` 或该微服务等价路由定义文件。
- 页面动作写点只认页面目录下 `*.actions.ts`。
- API 路径写点只认 gateway permission meta。

2. 构造本地快照
- 参考 [apex_dev/src/permissions/binding-registry-snapshot.ts](f:/Documents/Repertory/Sieyuan/nebula/apex_dev/src/permissions/binding-registry-snapshot.ts)。
- 快照字段保留前端语义：
  - `name`
  - `routePath`
  - `fullRoutePath`
  - `componentDisplayPath`
  - `componentStoragePath`
  - `actionKey`
  - `apiPath`
  - `gatewayAction`

3. 通过 qiankun props 上报
- 在子应用生命周期里调用基座 props 暴露的 `registerBindingRegistry`。
- 同时读取 `getBindingRegistryState` 回填本地 store。

4. 基座汇总
- 基座用 [microfb/src/store/modules/micro-app-binding-registry.store.ts](f:/Documents/Repertory/Sieyuan/nebula/microfb/src/store/modules/micro-app-binding-registry.store.ts) 管理：
  - 已知微服务空壳
  - 已上报微服务快照

5. 菜单管理消费
- [apex_dev/src/views/system/menu/components/menu-type-binding.registry.ts](f:/Documents/Repertory/Sieyuan/nebula/apex_dev/src/views/system/menu/components/menu-type-binding.registry.ts) 优先读取基座汇总快照。
- 无已上报快照时再回退本地 registry。

## 链路业务逻辑（状态机）
多微服务注册中心汇总按以下状态机运转：

1. 基座初始化阶段
- 基座根据已知微服务配置生成空壳应用状态。
- 此时 tab 可见，但 `status=empty`。

2. 子应用启动阶段
- 子应用从本地路由/动作写点构造 snapshot。
- 通过 qiankun props 调用 `registerBindingRegistry` 上报。

3. 基座汇总阶段
- pinia store 接收 snapshot 并更新对应 app 状态为 `reported`。
- 汇总后的结果成为菜单管理的多微服务增强索引。

4. 菜单管理消费阶段
- `menu` 绑定读取所有微服务入口候选。
- `page/function` 绑定读取所有微服务 tab；未上报的应用显示空态。

5. 更新阶段
- 子应用路由/动作注册变更后重新上报 snapshot。
- 基座只更新增强索引，不直接改菜单树。
- 真正业务绑定变更仍必须通过菜单管理写回菜单树。

## 单一写点规则
1. 每个微服务的路由写点仍只在自己的路由定义文件。
2. 页面动作写点仍只在自己的页面动作文件。
3. 基座只汇总，不反向生成业务绑定结果。
4. 菜单最终写回只改 `menu` 表，不写第二份持久化。

## 异常处理
1. 基座已知该微服务，但没上报 snapshot：
- 显示空 tab，不伪造数据。

2. 微服务缺 route root / appScope / routes / actions：
- 直接报错，不用空值兜底。

3. 页面能命中菜单树，但命不中微服务快照：
- 标记为“前端未注册”，不要偷偷回退到错误候选。

## 验证
1. 基座 store 测试：
- 参考 [microfb/src/api/gateway/__tests__/micro-app-binding-registry.store.test.ts](f:/Documents/Repertory/Sieyuan/nebula/microfb/src/api/gateway/__tests__/micro-app-binding-registry.store.test.ts)

2. 子应用 snapshot 测试：
- 参考 [apex_dev/src/views/system/menu/__tests__/binding-registry-snapshot.test.ts](f:/Documents/Repertory/Sieyuan/nebula/apex_dev/src/views/system/menu/__tests__/binding-registry-snapshot.test.ts)

3. 菜单绑定 registry 测试：
- 参考 [apex_dev/src/views/system/menu/__tests__/menu-type-binding.registry.test.ts](f:/Documents/Repertory/Sieyuan/nebula/apex_dev/src/views/system/menu/__tests__/menu-type-binding.registry.test.ts)

## 常见错误
1. 让基座直接读取子应用源码，造成强耦合。
2. 把基座总注册中心当成新真相源，反向写库。
3. 只传 appScope，不传完整 routes/actions 快照。
4. 在子应用里硬编码其他微服务信息。
5. tab 只显示有数据的 app，导致基座已知应用不可见。
