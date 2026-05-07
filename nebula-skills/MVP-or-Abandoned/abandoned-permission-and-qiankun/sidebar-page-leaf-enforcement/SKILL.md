---
name: sidebar-page-leaf-enforcement
description: Use when 左侧导航把功能项渲染成可点击菜单，或页面节点下面继续展开功能项，导致“page 不是最小可显示类型”的菜单树错误。
---

# 左侧菜单 page 叶子约束

## Overview
运行态左侧导航必须遵守一条硬规则：

1. `page` 是左侧导航的最小可显示类型。
2. `function` 永不进入 sidebar route tree。
3. `page` 一旦进入左树，必须强制成为叶子。

这条约束应该收口在菜单/路由投影单写点，而不是靠渲染组件末端打补丁。

## 关键文件
- [microfb/src/store/modules/permission.store.ts](f:/Documents/Repertory/Sieyuan/nebula/microfb/src/store/modules/permission.store.ts)
- [microfb/src/services/menu/menu-sync.ts](f:/Documents/Repertory/Sieyuan/nebula/microfb/src/services/menu/menu-sync.ts)

## 适用场景
1. 左侧菜单里出现“新增角色 / 删除租户”这类功能项。
2. 点击功能项才发生页面跳转，而不是点击页面菜单跳转。
3. page 节点下继续渲染 children，和菜单管理真实模型不一致。

## 执行步骤
1. 找到左侧导航的 route tree / menu tree 生成单写点。
2. 在生成阶段做类型过滤：
- 保留 `menu / directory / page`
- 丢弃 `function`

3. 在生成阶段做 page 截断：
- `page.children = []`
- 不允许把页面下的功能项递归进 sidebar

4. 组件解析也要跟着约束
- 即使有脏数据混进来，`function` 也不能被解析成可导航组件

## 链路业务逻辑（状态机）
左侧导航应遵守以下投影状态机：

1. 菜单同步阶段
- 基座/微服务从菜单树读取完整节点。

2. 导航投影阶段
- route builder 只保留 `menu / directory / page`。
- `function` 在这里被剔除。

3. 叶子截断阶段
- 一旦节点类型是 `page`，立即强制 `children=[]`。
- 页面成为左侧导航最小可显示类型。

4. 渲染阶段
- 菜单组件只消费投影结果，不额外推断类型。

5. 跳转阶段
- 用户点击页面节点触发路由跳转。
- 功能项仅在页面内部参与按钮权限控制，不参与导航。

## 验证
1. 左侧菜单只能看到页面节点，不出现功能项。
2. 点击页面节点发生路由跳转。
3. 功能项只在页面内部做按钮权限控制。
4. 刷新菜单缓存或同步菜单后，规则仍然成立。

## fail-fast
以下情况不要静默吞掉：
1. `function` 节点进入 sidebar builder
2. `page` 节点仍带 route-like children
3. `function` 节点被尝试解析为组件

应显式报错，便于尽早暴露脏数据。

## 常见错误
1. 只在渲染组件里隐藏 `function`，但 route builder 仍然把它算进导航树。
2. 只过滤 `function`，但不把 `page` 截断为叶子。
3. 菜单同步链和 permission store 链各自维护不同规则。
