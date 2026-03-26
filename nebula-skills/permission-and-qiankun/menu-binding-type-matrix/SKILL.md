---
name: menu-binding-type-matrix
description: Use when 需要先明确 menu、directory、page、function 四种类型各自能绑定什么、从哪里取候选、写回哪些字段，再实施菜单管理或权限绑定改造。
---

# 菜单绑定类型矩阵

## Overview
本 skill 专门沉淀 `menu / directory / page / function` 的绑定矩阵，避免菜单管理实现时边写边猜。

要先固定 3 张表：
1. 类型-候选矩阵
2. 类型-回写矩阵
3. 类型-异常矩阵

## 类型-候选矩阵
1. `menu`
- 绑定对象：`menu`
- 候选来源：菜单树中 `type=menu` 的节点，经注册中心补充前端字段

2. `directory`
- 绑定对象：`directory`
- 候选来源：菜单树中 `type=directory` 的节点，经注册中心补充前端字段
- 允许切到 manual 模式手输 `routePath`

3. `page`
- 绑定对象：`page-like`
- 候选来源：菜单树页面节点 + 前端路由注册中心扩展信息

4. `function`
- 绑定对象：`function-like`
- 候选来源：当前父页面命中的前端动作注册信息

## 类型-回写矩阵
1. `menu`
- 回写：
  - `routePath`
  - 可选 `routeName`

2. `directory`
- registry 模式回写：
  - `routePath`
  - 可选 `routeName`
  - 可选 `component`
- manual 模式回写：
  - 手输 `routePath`

3. `page`
- 回写：
  - `routePath`
  - `routeName`
  - `component`

4. `function`
- 回写：
  - `perm`

## 类型-异常矩阵
1. `menu` 绑定弹窗出现非 `menu` 候选 -> 直接报错
2. `directory` registry 模式下出现非 `directory` 候选 -> 直接报错
3. `page` 命不中前端路由注册 -> 提示前端未注册页面信息
4. `function` 父页面未绑定路由 -> 提示无法检索前端动作
5. `function` 页面已命中路由但无动作注册 -> 提示未注册前端动作

## 可空边界与强约束边界
1. `menu`
- 候选来自后端菜单树
- `routePath / routeName` 允许为空并进入编辑态
- 这是后端可空编辑态，不应在候选生成阶段强拦

2. `directory`
- 候选来自后端菜单树
- `routePath / routeName / component` 允许为空并进入编辑态
- registry 模式下可以补充前端展示字段；manual 模式下允许用户手输

3. `page`
- 候选来自“菜单树页面节点 + 前端路由注册中心扩展”
- 页面绑定涉及前端持久化契约，必须命中注册中心
- 未命中时不能假装成功，只能提示“前端未注册页面信息”

4. `function`
- 候选来自“父页面命中后的前端动作注册中心”
- `actionKey / gatewayAction / apiPath` 属于前端强约束
- 缺失时直接提示“未注册前端动作”，不能从后端脏值回退拼装

## 链路业务逻辑（状态机）
### 1. 类型识别阶段
- 先读取当前菜单记录 `type`。
- 类型始终显示，开发阶段允许修脏数据，不靠隐藏掩盖问题。

### 2. 候选生成阶段
- 根据类型矩阵，从统一 registry 入口取候选。
- 不允许在表单组件里临时拼候选集。

### 3. 绑定确认阶段
- 用户从统一绑定弹窗中单选一条候选。
- 根据当前类型矩阵生成 patch。

### 4. 保存阶段
- 将 patch 合并进表单数据并提交。
- 真正持久化仍只写菜单树字段。

## 推荐落点
1. 候选矩阵单写点：引用 [apex_dev/src/views/system/menu/components/menu-type-binding.registry.ts](f:/Documents/Repertory/Sieyuan/nebula/apex_dev/src/views/system/menu/components/menu-type-binding.registry.ts)
2. 写回矩阵单写点：引用 [apex_dev/src/views/system/menu/components/menu-type-form.submit.ts](f:/Documents/Repertory/Sieyuan/nebula/apex_dev/src/views/system/menu/components/menu-type-form.submit.ts)
3. 表单显示矩阵单写点：引用 [apex_dev/src/views/system/menu/components/menu-type-form.config.ts](f:/Documents/Repertory/Sieyuan/nebula/apex_dev/src/views/system/menu/components/menu-type-form.config.ts)

## 常见错误
1. `menu` 自动绑定当前应用 routeRoot，不真正走候选选择。
2. `directory`、`page` 混用同一套弱约束。
3. `function` 直接把 API URL 当绑定值。
4. 类型矩阵散落在组件模板、store、submit 函数多处。
