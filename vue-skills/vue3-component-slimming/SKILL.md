---
name: vue3-component-slimming
description: Use when a Vue 3 SFC becomes hard to read or maintain because watchers, computed values, async loading, submit logic, and large template blocks are mixed together, and the work needs safe extraction into composables, child components, helpers, or config without introducing a second write point.
---

# 目标
把 Vue 3 大组件收成“编排层”，在不改变行为的前提下，安全抽取 `composable`、子组件、`utils/helpers`、`config/constants`，并补齐对应层级测试。

## 何时使用
1. `script setup` 中同时出现大量 `watch`、`computed`、异步请求、提交流程、模板区块。
2. 同一业务规则被多个 `watch`、多个 helper 或多个 UI 分支重复维护。
3. 文件里既有状态机，又有纯函数，又有文案/列配置，阅读成本明显升高。
4. 想做“文件级瘦身审查”，但不想把逻辑拆散后形成第二写点。

## 核心原则
1. 单一写点：业务规则、列配置、提交流程、字段映射各自只能有一个落点。
2. fail-fast：依赖缺失直接暴露，不用 `?.`、空串、`try-catch` 静默吞错。
3. 先分类，再抽取：不要一边改行为一边随手搬文件。
4. 抽取后删旧逻辑：不能“新实现 + 旧兜底”并存。
5. 测试随层级下沉：`composable` 补单测，主组件保留集成回归。

## 文件级瘦身审查
先按职责给当前文件分层：
1. 生命周期与初始化：弹窗打开/关闭、编辑态回填、表单 reset。
2. 状态联动：`watch`、排序联动、模式切换、当前选中反显。
3. 资源加载：项目下拉、远程字典、懒加载选项。
4. 绑定/弹窗编排：打开弹窗、确认回填、radio key、scope 切换。
5. 纯函数与归一化：`buildFormData`、`calculateNextSort`、payload 归一化。
6. 只读展示策略：标题、字段显隐、按钮文案、空态文案、列定义。
7. 模板区块：路由参数编辑器、绑定摘要区、复杂表格或表单子段。

## 抽取矩阵
### 抽成 composable
适用：
1. 有状态。
2. 有副作用或联动。
3. 可被多个组件复用，或单独测试更清晰。

常见候选：
1. 初始化状态机。
2. 排序联动。
3. 目录/页面模式切换。
4. 绑定弹窗状态。
5. 当前摘要解析。
6. 资源加载。

命名要求：
1. `useXxx.ts`
2. 输入显式传 `Ref` / `ComputedRef` / 纯函数依赖。
3. 不从组件内部闭包偷拿状态。

### 抽成子组件
适用：
1. 模板块很大。
2. 逻辑与视觉布局强绑定。
3. 父组件只想保留 `props / emits / v-model` 编排。

常见候选：
1. 参数编辑器。
2. 绑定选择弹窗。
3. 表格渲染区。
4. 大段表单子区块。

### 抽成 helpers / utils
适用：
1. 纯函数。
2. 无副作用。
3. 不依赖组件实例或 DOM。

常见候选：
1. 表单初始值。
2. 数据归一化。
3. 下一排序值计算。
4. payload 构造。

### 抽成 config / constants
适用：
1. 文案矩阵。
2. 字段显隐矩阵。
3. 列定义。
4. 提交规则矩阵。

要求：
1. UI 组件只消费，不二次拼装同类配置。
2. 变更文案或列顺序时，只改一处。

## 推荐执行顺序
1. 先抽最独立的状态机：排序联动、模式切换。
2. 再抽纯资源加载。
3. 再抽绑定弹窗与当前摘要解析。
4. 最后抽初始化流程，因为它最容易碰到时序行为变化。
5. 模板块抽子组件时，优先保证 `props / emits` 简洁，不把父组件的所有状态整体下传。

## 常见错误
1. 抽成 composable 后，主组件里还保留原 `watch`。
2. 把纯函数也塞进 composable，导致不必要的响应式耦合。
3. 只抽文件，不补对应单测。
4. 为了“兼容”保留旧 fallback，最终形成双写点。
5. `composable` 直接 import 组件内部常量，导致依赖反向。
6. 把视图文案和提交规则混写在同一个函数里。

## 输出要求
1. 先给出文件级瘦身审查结果。
2. 明确列出哪些要抽成 `composable`、组件、helper、config。
3. 说明每个抽取点的单一写点位置。
4. 说明哪些旧逻辑会被删除。
5. 给出最小回归集合。

## 验证要求
1. 至少验证主组件回归测试。
2. 新增 composable 必须优先补单测。
3. 如果抽了子组件，至少补一个渲染/交互回归。

## 最佳实践依据
1. Vue 官方把 composable 定义为复用有状态逻辑的首选方式：<https://vuejs.org/guide/reusability/composables>
2. Vue 官方强调 props 单向数据流，初始化与同步逻辑应显式收口：<https://vuejs.org/guide/components/props>
3. Vue Test Utils 支持直接测试 composable，适合把状态机测试从大组件中下沉：<https://test-utils.vuejs.org/guide/advanced/reusability-composition.html>
