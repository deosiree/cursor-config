---
name: mf-host-child-registry-sync
description: Use when 需要明确 qiankun 下基座与子应用之间的注册中心同步协议、通信边界与状态机，避免 host/child 双方各自猜测对方结构。
---

# 基座-子应用注册中心同步协议

## Overview
本 skill 聚焦 qiankun 通信边界，不直接讲菜单 UX，而是讲：

1. 基座知道哪些微服务
2. 子应用如何上报本地注册快照
3. 基座如何 seed、upsert、暴露空态
4. 为什么不能让 host 直接读取 child 源码

## 适用场景
1. 新微服务要接入总注册中心。
2. 基座只接了 `Apex`，还要逐步接 `Opsdesk`。
3. 需要定义 `props` 协议，而不是在 host/child 两边临时凑字段。

## 关键文件
- [microfb/src/plugins/qiankun/apps.ts](f:/Documents/Repertory/Sieyuan/nebula/microfb/src/plugins/qiankun/apps.ts)
- [microfb/src/store/modules/appConfig.store.ts](f:/Documents/Repertory/Sieyuan/nebula/microfb/src/store/modules/appConfig.store.ts)
- [microfb/src/store/modules/micro-app-binding-registry.store.ts](f:/Documents/Repertory/Sieyuan/nebula/microfb/src/store/modules/micro-app-binding-registry.store.ts)
- [apex_dev/src/plugins/qiankun/lifecycle.ts](f:/Documents/Repertory/Sieyuan/nebula/apex_dev/src/plugins/qiankun/lifecycle.ts)
- [apex_dev/src/permissions/binding-registry-snapshot.ts](f:/Documents/Repertory/Sieyuan/nebula/apex_dev/src/permissions/binding-registry-snapshot.ts)

## 推荐协议
### 基座下发
基座通过 qiankun props 至少下发：
1. `registerBindingRegistry(snapshot)`
2. `getBindingRegistryState()`

### 子应用上报
子应用在 `mount/update` 中上报：
1. `appName`
2. `appScope`
3. `routeRoot`
4. `routes[]`
5. `actions[]`

## 链路业务逻辑（状态机）
### 1. 基座 seed 阶段
- 基座先根据已知微服务配置生成空壳状态。
- 即使子应用未上报，也要有 tab。

### 2. 子应用 mount 阶段
- 子应用构造本地 snapshot。
- 通过 `registerBindingRegistry` 上报给基座。

### 3. 基座 upsert 阶段
- 基座 store 按 `appName/appScope` 更新对应状态。
- 状态从 `empty` 变为 `reported`。

### 4. 子应用 update 阶段
- 本地注册中心变化时重新上报。
- 基座只更新增强索引，不改菜单树真相源。

### 5. 菜单管理消费阶段
- `menu/page/function` 绑定弹窗读取基座总注册中心。
- 已知但未上报的微服务显示空态。

## 单一写点规则
1. 子应用本地注册中心只在子应用内部维护。
2. 基座只做汇总，不硬编码子应用内部路由/动作细节。
3. snapshot 协议单写点在 host props 与 child lifecycle 对接处。

## 常见错误
1. 基座直接 import 子应用路由文件。
2. 子应用只上报 appScope，不上报 routes/actions。
3. 基座只展示有数据的 app，导致已知应用缺 tab。
4. host 和 child 使用两套不兼容 snapshot 字段。
