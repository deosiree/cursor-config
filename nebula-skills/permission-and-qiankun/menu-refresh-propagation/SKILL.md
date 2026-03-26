---
name: menu-refresh-propagation
description: Use when 需要梳理菜单绑定修改后如何通过单一刷新入口传播到缓存、页面、运行时 resolver 和左侧导航，避免局部 patch 或隐式副作用。
---

# 菜单刷新传播链路

## Overview
本 skill 用于固定“菜单改了之后，系统到底怎么生效”的传播链路。

核心目标：
1. `menu/update` 是业务变更入口。
2. 菜单刷新单写点是唯一生效传播入口。
3. resolver、左侧导航、页面按钮都读刷新后的菜单树。
4. 不允许局部 patch 一份影子状态。

## 适用场景
1. 菜单管理保存成功，但页面按钮权限没变化。
2. 绑定路由/权限标识后，需要解释为什么必须整页刷新。
3. 基座/子应用菜单缓存、左侧导航、runtime resolver 生效时序不清楚。
4. 团队想在局部组件里手动改菜单缓存。

## 关键文件
- [apex_dev/src/utils/menu-cache-refresh.ts](f:/Documents/Repertory/Sieyuan/nebula/apex_dev/src/utils/menu-cache-refresh.ts)
- [microfb/src/services/menu/menu-sync.ts](f:/Documents/Repertory/Sieyuan/nebula/microfb/src/services/menu/menu-sync.ts)
- [microfb/src/store/modules/permission.store.ts](f:/Documents/Repertory/Sieyuan/nebula/microfb/src/store/modules/permission.store.ts)
- [apex_dev/src/permissions/runtime-permission-resolver.ts](f:/Documents/Repertory/Sieyuan/nebula/apex_dev/src/permissions/runtime-permission-resolver.ts)

## 链路业务逻辑（状态机）
### 1. 保存阶段
- 菜单管理调用后端 `menu/update` 或等价接口。
- 这里只负责把绑定结果写入菜单树真相源。

### 2. 刷新触发阶段
- 保存成功后，必须走菜单刷新单写点。
- 不允许只更新当前表单或当前组件局部状态。

### 3. 缓存重建阶段
- 菜单缓存被重新拉取或重建。
- 基座/微服务内部 menu repo、menu sync、permission store 重新读取最新菜单树。

### 4. 导航与权限重解析阶段
- 左侧导航基于新菜单树重新投影。
- runtime resolver 基于新菜单树重新解析页面/功能项绑定。
- `v-confirmPerm` 与 gateway 读取到新的解析结果。

### 5. 页面生效阶段
- 用户再次进入页面或页面刷新后，看到新的按钮显示和导航结构。

## 单一写点规则
1. 菜单变更只写菜单树。
2. 刷新动作只走菜单刷新单写点。
3. 运行时读取只从刷新后的菜单缓存读取。
4. 不在 resolver、directive、gateway 中自行维护一份缓存副本。

## fail-fast
以下情况应明确暴露：
1. 保存成功但未触发刷新链路。
2. 刷新后 menu repo 与 permission store 仍读旧值。
3. 左侧导航和 resolver 使用不同菜单来源。

## 常见错误
1. 只更新表格行数据，不刷新菜单缓存。
2. 只让页面按钮重新计算，不让左侧导航重建。
3. 多处各自维护 `menuVersion` 或影子缓存。
4. 用 watch 或临时 patch 模拟“已生效”。
