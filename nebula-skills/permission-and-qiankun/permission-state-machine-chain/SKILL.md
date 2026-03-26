---
name: permission-state-machine-chain
description: Use when 需要从用户使用视角梳理“菜单管理、注册中心、v-confirmPerm、自定义按钮权限、gateway”这一整条权限链路，并把状态机固定下来后再实现或排障。
---

# 权限链路业务状态机

## Overview
本 skill 专门沉淀用户使用视角下的完整链路：

1. 菜单管理绑定页面路由与权限标识
2. 注册中心提供前端扩展元数据
3. runtime resolver 解析当前页面权限
4. `v-confirmPerm` 控制按钮显示
5. gateway 在请求前二次短路

目标不是单点修按钮或单点修菜单，而是先把整条状态机理顺，再动代码。

## 关键文件
- [apex_dev/src/views/system/menu/components/MenuTypeFormDialog.vue](f:/Documents/Repertory/Sieyuan/nebula/apex_dev/src/views/system/menu/components/MenuTypeFormDialog.vue)
- [apex_dev/src/views/system/menu/components/menu-type-binding.registry.ts](f:/Documents/Repertory/Sieyuan/nebula/apex_dev/src/views/system/menu/components/menu-type-binding.registry.ts)
- [apex_dev/src/router/utils/page-route-registry.ts](f:/Documents/Repertory/Sieyuan/nebula/apex_dev/src/router/utils/page-route-registry.ts)
- [apex_dev/src/permissions/page-action-registry.ts](f:/Documents/Repertory/Sieyuan/nebula/apex_dev/src/permissions/page-action-registry.ts)
- [apex_dev/src/permissions/runtime-permission-resolver.ts](f:/Documents/Repertory/Sieyuan/nebula/apex_dev/src/permissions/runtime-permission-resolver.ts)
- [apex_dev/src/directive/confirmPerm/index.ts](f:/Documents/Repertory/Sieyuan/nebula/apex_dev/src/directive/confirmPerm/index.ts)
- [apex_dev/src/api/gateway](f:/Documents/Repertory/Sieyuan/nebula/apex_dev/src/api/gateway)
- [apex_dev/src/utils/menu-cache-refresh.ts](f:/Documents/Repertory/Sieyuan/nebula/apex_dev/src/utils/menu-cache-refresh.ts)

## 适用场景
1. 按钮隐藏了但请求还能发出。
2. 菜单管理已绑定，但页面上按钮状态不对。
3. 新模块接权限模型时，不知道先接菜单、还是先接注册中心、还是先接指令。
4. 想从用户操作链路梳理完整状态机，再实施。

## 链路业务逻辑（状态机）
### 1. 前端实现注册阶段
- 页面在路由写点注册 `routePath -> component`。
- 页面在动作写点注册 `actionKey -> gatewayAction`。
- gateway permission meta 注册 `gatewayAction -> apiPath`。

### 2. 菜单管理绑定阶段
- 管理员在菜单管理中给 `menu/page/directory/function` 做绑定。
- `page` 绑定路由。
- `function` 绑定权限标识，最终写入 `menu.perm`。
- 保存后通过菜单刷新单写点刷新菜单缓存。

### 3. 页面进入阶段
- 用户进入某页面。
- 系统根据当前页面 `routePath` 从注册中心定位页面动作集合。
- 再根据菜单树找到该页面下当前已绑定的功能项集合。

### 4. 按钮渲染阶段
- 页面按钮声明自身 `actionKey`。
- `v-confirmPerm` 调用 runtime resolver。
- resolver 根据 `routePath + actionKey` 返回：
  - 是否允许
  - 命中原因
  - API 路径

### 5. 用户点击阶段
- 用户点击按钮。
- 对应 gateway 方法再次调用 resolver。
- 无权限则短路，不发请求。
- 有权限则继续请求。

### 6. 变更生效阶段
- 菜单管理修改绑定后，菜单树成为新真相源。
- 刷新菜单缓存后，页面与 gateway 读取到新的绑定结果。
- 不允许额外维护一份手工同步状态。

## 单一写点规则
1. 路由-组件写点只在路由注册中心。
2. 动作-网关写点只在页面动作注册中心。
3. 网关-API 写点只在 gateway permission meta。
4. 绑定结果只写菜单树字段。
5. 运行时只解析，不生成第二份配置。

## 排障顺序
1. 先查菜单树是否已绑定。
2. 再查注册中心是否已注册页面/动作。
3. 再查 resolver 是否能命中。
4. 再查 `v-confirmPerm` 是否正确消费 resolver。
5. 最后查 gateway 是否做了二次短路。

## 常见错误
1. 菜单管理改了绑定，但没走菜单刷新单写点。
2. 页面按钮直接写 API 权限字符串，不走 `actionKey`。
3. gateway 自己再拼一套权限判断。
4. resolver 命不中时返回空值而不是明确错误。
