---
name: menu-type-binding-ux-refactor
description: Use when 需要重构菜单管理 UI/UX，把关联微服务、关联路由、关联权限标识收口成统一的 MenuType 表单与绑定弹窗交互。
---

# 菜单管理绑定交互重构

## Overview
把菜单管理从“手填字段 / 更新 API / 多套弹窗”重构为统一的绑定模型：

1. 统一入口：`MenuTypeFormDialog`
2. 统一绑定弹窗：`MenuTypeBindingDialog`
3. 统一列配置、摘要配置、提交矩阵
4. 统一按类型做绑定：
  - `menu` -> 微服务
  - `directory` -> 路由（可手输）
  - `page` -> 路由
  - `function` -> 权限标识

## 适用场景
1. 菜单管理里同时存在“编辑菜单 / 编辑功能项 / 更新 API / 权限配置”等多套心智。
2. 绑定弹窗和摘要区字段不一致。
3. 用户还在手动输入组件路径、API 权限、路由路径。
4. 需要把“微服务 / 路由 / 权限标识”的表格弹窗交互统一。

## 关键文件
- [apex_dev/src/views/system/menu/components/MenuTypeFormDialog.vue](f:/Documents/Repertory/Sieyuan/nebula/apex_dev/src/views/system/menu/components/MenuTypeFormDialog.vue)
- [apex_dev/src/views/system/menu/components/MenuTypeBindingDialog.vue](f:/Documents/Repertory/Sieyuan/nebula/apex_dev/src/views/system/menu/components/MenuTypeBindingDialog.vue)
- [apex_dev/src/views/system/menu/components/menu-type-binding.columns.ts](f:/Documents/Repertory/Sieyuan/nebula/apex_dev/src/views/system/menu/components/menu-type-binding.columns.ts)
- [apex_dev/src/views/system/menu/components/menu-type-binding.registry.ts](f:/Documents/Repertory/Sieyuan/nebula/apex_dev/src/views/system/menu/components/menu-type-binding.registry.ts)
- [apex_dev/src/views/system/menu/components/menu-type-form.config.ts](f:/Documents/Repertory/Sieyuan/nebula/apex_dev/src/views/system/menu/components/menu-type-form.config.ts)
- [apex_dev/src/views/system/menu/components/menu-type-form.submit.ts](f:/Documents/Repertory/Sieyuan/nebula/apex_dev/src/views/system/menu/components/menu-type-form.submit.ts)

## 设计目标
1. 表单里不直接手填核心绑定字段。
2. 绑定统一通过弹窗表格单选完成。
3. 表格显示字段尽量与后端 `menu` 语义对齐：
  - `名称`
  - `完整路由路径`
  - `权限标识`
4. 但变量命名继续保留前端语义，后端映射只放在说明里。

## 执行步骤
1. 先收口入口
- 删除独立的 `MenuFormDialog` / `FunctionItemFormDialog` 式分叉。
- 所有类型统一走 `MenuTypeFormDialog`。

2. 再收口绑定弹窗
- 删除独立的“页面路由绑定弹窗 / API 权限绑定弹窗”实现分叉。
- 统一用 `MenuTypeBindingDialog`。

3. 列与摘要收口
- 表格列定义和摘要字段都放到 [menu-type-binding.columns.ts](f:/Documents/Repertory/Sieyuan/nebula/apex_dev/src/views/system/menu/components/menu-type-binding.columns.ts)。
- 组件模板里不再手写重复 label。

4. 候选集收口
- 不在表单组件里拼接候选集。
- 候选集来源只认 [menu-type-binding.registry.ts](f:/Documents/Repertory/Sieyuan/nebula/apex_dev/src/views/system/menu/components/menu-type-binding.registry.ts)。

5. 提交规则收口
- 所有写回矩阵只认 [menu-type-form.submit.ts](f:/Documents/Repertory/Sieyuan/nebula/apex_dev/src/views/system/menu/components/menu-type-form.submit.ts)。

## 类型矩阵
1. `menu`
- 关联微服务
- 只能绑定 `menu`

2. `directory`
- 关联路由
- 只能绑定 `directory`
- 可切手动输入

3. `page`
- 关联路由
- 绑定 `page-like`

4. `function`
- 关联权限标识
- 绑定 `function-like`

## 链路业务逻辑（状态机）
菜单管理 UI/UX 应统一遵守以下状态机：

1. 打开阶段
- 用户打开 `MenuTypeFormDialog`。
- 根据当前 `type` 决定显示哪种绑定摘要与按钮。

2. 进入绑定阶段
- 点击“关联微服务 / 关联路由 / 关联权限标识”。
- 打开统一的 `MenuTypeBindingDialog`。
- 弹窗先根据当前已绑定值自动切到对应微服务 tab，并反显当前选中项。

3. 候选加载阶段
- 候选集只由 `menu-type-binding.registry.ts` 提供。
- `menu` 只拿 `menu`。
- `directory` 只拿 `directory`。
- `page` 拿 `page-like`。
- `function` 拿 `function-like`。

4. 确认阶段
- 用户单选一条候选后确认。
- `menu-type-form.submit.ts` 根据类型矩阵生成回写 patch。
- 表单摘要立即刷新，但真正真相源仍是提交后的菜单树。

5. 提交阶段
- 用户确认保存。
- 只写菜单树字段，不写第二份配置。
- 保存成功后触发菜单刷新链路。

6. 异常阶段
- 候选集类型不符、缺注册中心字段、缺路由命中、缺动作命中，都应直接报错或给出明确空态，不允许静默兜底。

## 单一写点规则
1. 列与摘要文案单写点：`menu-type-binding.columns.ts`
2. 候选数据单写点：`menu-type-binding.registry.ts`
3. 提交写回矩阵单写点：`menu-type-form.submit.ts`
4. 组件只消费，不二次揉字段

## 交互验证
1. 打开任意绑定弹窗，必须按已选项自动反显所在微服务 tab。
2. `menu` 弹窗显示：
  - `名称 / 完整路由路径 / 微服务 / 路由名称`
3. `page` 弹窗显示：
  - `名称 / 组件路径 / 完整路由路径 / 微服务 / 路由路径 / 路由名称`
4. `function` 弹窗显示：
  - `名称 / API路径 / 权限标识 / 前端网关方法 / 组件路径 / 微服务 / 路由路径 / 完整路由路径`

## 常见错误
1. 在 `MenuTypeFormDialog` 里直接拼 rows，绕过 registry。
2. 表格列和摘要字段双写，后面文案漂移。
3. 一个类型同时保留“手填”和“绑定”两套强入口。
4. `menu` 自动写当前 app routeRoot，不真正打开跨微服务选择。
