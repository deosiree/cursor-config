---
name: frontend-registry-contract
description: Use when 需要为某个微服务建立或对齐本地注册中心契约，统一路由、组件、动作、网关、API 路径等字段命名与来源边界。
---

# 微服务前端注册中心字段契约

## Overview
本 skill 用于固定“微服务本地注册中心到底输出什么字段、字段怎么命名、字段来自哪里”。

目标：
1. 路由-组件写点收口到本地注册中心。
2. 动作-网关写点收口到本地注册中心。
3. 字段名保留前端语义，后端来源只在说明层描述。
4. 基座只能消费标准 snapshot，不再猜字段。

## 适用场景
1. 新微服务要接入现有权限/菜单/qiankun 总链路。
2. 当前微服务存在多处同时维护 `routePath/component/actionKey/apiPath`。
3. 菜单管理、resolver、gateway、snapshot 输出字段口径不一致。
4. 团队开始把后端字段名直接塞进前端变量名。

## 推荐写点
优先引用这些路径，不额外新造写点：

1. 路由写点
- [apex_dev/src/router/routes.ts](f:/Documents/Repertory/Sieyuan/nebula/apex_dev/src/router/routes.ts)

2. 路由注册中心
- [apex_dev/src/router/utils/page-route-registry.ts](f:/Documents/Repertory/Sieyuan/nebula/apex_dev/src/router/utils/page-route-registry.ts)

3. 页面动作注册中心
- [apex_dev/src/permissions/page-action-registry.ts](f:/Documents/Repertory/Sieyuan/nebula/apex_dev/src/permissions/page-action-registry.ts)

4. gateway 元信息
- [apex_dev/src/api/gateway](f:/Documents/Repertory/Sieyuan/nebula/apex_dev/src/api/gateway)

5. qiankun snapshot 输出
- [apex_dev/src/permissions/binding-registry-snapshot.ts](f:/Documents/Repertory/Sieyuan/nebula/apex_dev/src/permissions/binding-registry-snapshot.ts)

## 字段契约
### 可空边界与强约束边界
1. 注册中心输出的字段要保留前端语义，但不是所有上游字段都同样严格。
2. 后端菜单树传来的业务字段，如果系统后续允许在菜单管理中补齐，可在进入编辑态时为空：
- `name`
- `routePath`
- `routeName`
- `component`
- `perm`
3. 前端注册中心自身维护的字段属于强约束：
- `routePath / fullRoutePath / componentDisplayPath / componentStoragePath`
- `actionKey / gatewayAction / apiPath`
4. 强约束字段缺失时：
- 在注册中心、snapshot、resolver、gateway 层直接暴露错误
- 不使用 `?.`、空串、`try-catch` 静默吞掉
5. 可空字段进入 UI 后：
- 允许展示为空
- 允许用户后续通过 CRUD 补齐
- 不应让单个空值节点拖死整个编辑弹窗

### 路由类字段
1. `name`
- 前端展示名称
- 来源说明：对应后端 `menu.name` 语义，但变量名不改成后端命名

2. `routeName`
- 前端路由名称
- 来源：路由定义中的名称写点

3. `routePath`
- 微服务内部路由路径
- 来源：前端从完整路由拆解后的本地路径

4. `fullRoutePath`
- 完整路由路径
- 来源说明：对应后端 `menu.route_path`

5. `componentDisplayPath`
- 用于 UI 展示的组件路径

6. `componentStoragePath`
- 用于写回后端 `menu.component`

### 动作类字段
1. `actionKey`
- 前端动作注册键
- 来源说明：最终写回后端 `menu.perm`

2. `gatewayAction`
- 前端网关方法名
- 仅前端使用，不写库

3. `apiPath`
- 对应 gateway permission meta 中的 API 路径

## 链路业务逻辑（状态机）
### 1. 写点注册阶段
- 开发者在路由文件、页面动作文件、gateway meta 中分别注册本地事实。

### 2. 注册中心聚合阶段
- route registry 聚合路由与组件。
- action registry 聚合动作与 gateway。

### 3. snapshot 构造阶段
- 本地注册中心把上述字段整理成统一契约输出。

### 4. 基座消费阶段
- 基座只消费标准字段，不再猜测微服务内部实现。

## 命名纪律
1. 保留前端语义字段名。
2. 后端字段名只在注释、文档、说明层出现。
3. UI 列标题可以更贴近用户/后端语义，但不反向污染变量名。

## 常见错误
1. 直接把 `route_path`、`perm` 当成前端变量名。
2. `componentDisplayPath` 和 `componentStoragePath` 混用。
3. 把 `gatewayAction` 写回数据库。
4. snapshot 输出字段和本地 registry 字段不一致。
