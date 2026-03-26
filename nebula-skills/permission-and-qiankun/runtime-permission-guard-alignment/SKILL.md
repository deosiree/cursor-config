---
name: runtime-permission-guard-alignment
description: Use when 需要把页面按钮、运行时权限解析、gateway 前置短路和菜单功能项绑定统一到同一条权限判断链上。
---

# 运行时权限守卫收口

## Overview
把“页面按钮显示”“gateway 是否允许发请求”“菜单功能项绑定结果”统一到同一条权限判断链：

1. 菜单功能项 `menu.perm` 绑定 `actionKey`
2. 页面动作注册中心提供 `actionKey -> gatewayAction`
3. runtime permission resolver 解析当前页面是否允许执行动作
4. `v-confirmPerm` 控制按钮显示
5. gateway 敏感操作前置短路

## 关键文件
- [apex_dev/src/permissions/runtime-permission-resolver.ts](f:/Documents/Repertory/Sieyuan/nebula/apex_dev/src/permissions/runtime-permission-resolver.ts)
- [apex_dev/src/directive/confirmPerm/index.ts](f:/Documents/Repertory/Sieyuan/nebula/apex_dev/src/directive/confirmPerm/index.ts)
- [apex_dev/src/api/gateway/tenant.gateway.ts](f:/Documents/Repertory/Sieyuan/nebula/apex_dev/src/api/gateway/tenant.gateway.ts)
- [apex_dev/src/permissions/page-action-registry.ts](f:/Documents/Repertory/Sieyuan/nebula/apex_dev/src/permissions/page-action-registry.ts)
- [apex_dev/src/views/system/menu/components/function-action-resolver.ts](f:/Documents/Repertory/Sieyuan/nebula/apex_dev/src/views/system/menu/components/function-action-resolver.ts)

## 适用场景
1. 页面按钮显示和实际请求权限不一致。
2. 只靠按钮隐藏，没有 gateway 短路。
3. 页面动作名、菜单 `perm`、gateway 方法名各说各话。
4. 想把其他模块迁到“注册中心 + runtime resolver”模型。

## 执行步骤
1. 先确认页面动作注册是否存在
- 必须能从页面 `routePath` 找到对应 `actionKey/gatewayAction`。

2. 再确认菜单绑定是否存在
- 必须能从菜单树页面上下文下找到功能项的 `perm`。

3. 统一 runtime resolver
- resolver 只接收：
  - `routePath`
  - `actionKey`
- 不直接接收 API URL。

4. 接入指令
- 页面按钮统一用 `v-confirmPerm`。

5. 接入 gateway
- 目标 gateway 的敏感操作必须在真正请求前调用 resolver。

## 链路业务逻辑（状态机）
运行时权限判断必须按同一条状态机执行：

1. 菜单绑定准备阶段
- 菜单管理把页面路由绑定写入菜单树。
- 菜单管理把功能项权限标识绑定写入 `menu.perm`。

2. 注册中心解析阶段
- 页面进入后，根据当前 `routePath` 从注册中心拿到页面动作集合。
- 根据按钮上的 `actionKey` 找到对应 `gatewayAction`。

3. runtime resolver 阶段
- resolver 用 `routePath + actionKey` 去菜单树中反查当前页面下是否存在对应功能项。
- 命中则返回允许状态、API 路径和原因；未命中则返回明确失败原因。

4. 指令阶段
- `v-confirmPerm` 根据 resolver 结果控制按钮显隐。

5. 请求阶段
- 用户点击按钮后，gateway 再次调用 resolver。
- 无权限则短路，不发请求；有权限才真正调用 API。

6. 刷新阶段
- 菜单绑定变更后通过菜单刷新单写点刷新缓存。
- 后续页面重新解析新菜单树，不额外维护第二份运行时状态。

## 单一写点规则
1. `actionKey -> gatewayAction` 写点只在页面动作注册中心。
2. `gatewayAction -> API路径` 写点只在 gateway permission meta。
3. `perm` 写库只认 `menu.perm`。
4. resolver 只做解析，不生成新业务数据。

## 验证
1. 页面无权限时按钮应隐藏。
2. 即使按钮遗漏，gateway 也必须短路。
3. 修改菜单功能项绑定后，刷新菜单缓存后行为立即生效。
4. resolver 命不中时明确报错或返回明确 reason，不返回模糊空值。

## 常见错误
1. 指令和 gateway 各自写一套权限判断。
2. 直接用 API URL 当 `perm`。
3. gateway 里再查一遍页面组件或路由定义，绕过注册中心。
4. resolver 命不中时静默返回 true/空串。
