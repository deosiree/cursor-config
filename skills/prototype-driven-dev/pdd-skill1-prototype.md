## Skill 1：pdd-skill1-prototype（极速原型生成）

### 概述

- **所属阶段**：S1「设计 / 极速原型」
- **目标**：在**现有页面**中，快速增加一个新的功能模块（按钮、表单、图表、弹窗流程等），通过**本地 Mock 数据**先把数据流和交互跑通，用于用户体验测试，不考虑视觉审美定稿。
- **执行者**：Cursor（Senior Frontend Prototyper）
- **输入**：自然语言需求 + 必要的页面/组件上下文说明
- **输出**：单文件前端组件代码（默认 Vue 3 SFC），包含：
  - 可直接运行的 UI 与交互逻辑
  - 合理设计的 `MOCK_DATA`
  - 使用 `setTimeout` 模拟网络延迟

### 技术栈与文件结构约定

- **默认技术栈**：
  - 若你**没有特别说明**，统一使用：**Vue 3 单文件组件（SFC，推荐 `<script setup>` 写法）**
- **可选技术栈**（需要你显式说明）：
  - React + TypeScript（`.tsx` 函数组件）
- **文件结构与目录**：
  - 单文件、自包含组件：
    - Vue：`.vue`，包含 `<script setup>` + `<template>`，可选 `<style scoped>`（仅少量局部样式）
    - React：单个 `.tsx` 文件
  - 组件文件**统一生成为新文件**，放在前端项目中的 `prototype/` 目录下，例如：
    - `prototype/InventoryPrototype.vue`
    - `prototype/RefundRequestPrototype.vue`
  - 为每个新组件**自动生成一个独立的启动脚本文件**（不依赖路由跳转），示例：
    - Vue：`prototype/InventoryPrototype.entry.ts`
    - React：`prototype/InventoryPrototype.entry.tsx`
  - 启动脚本负责创建应用并挂载到一个根节点（例如 `#app`），用于在浏览器中直接打开并调试数据流动。
  - **样式**统一使用 Tailwind CSS，避免单独维护 CSS 文件。

### 典型使用场景

- 在已有页面中增加新模块：
  - 新按钮 + 若干个模态框（申请流程、审批流程、详情展示等）
  - 新表单（过滤表单、编辑表单、批量操作表单）
  - 新图表 / `Qchart` 模块
- 新模块的数据结构与交互**部分参考现有子组件**，但有一部分**新字段、新流程**无法直接抄，需要 AI 帮你先设计数据流和交互。
- 目标是：**优先跑通数据流和交互**，而不是定稿 UI 设计。

### 触发方式（你在 Cursor 里怎么说）

- **推荐触发关键词**（任选其一）：
  - `@pdd-prototype`
  - `Skill 1`
  - `原型` / `极速原型`

- **示例 1：在现有页面中新增模块**

  你可以在 Chat / Composer 中，对当前打开的页面或组件说：

  > `@pdd-prototype 在现有订单列表页面中增加“退款申请”按钮。点击后弹出一个模态框，包含原因选择、备注输入和预估退款金额展示，提交时只用本地 MOCK_DATA 跑通数据流。`

- **示例 2：从 0 生成一个表格原型**

  > `@pdd-prototype 为“产品库存表”生成可编辑的原型组件，包含产品图片、名称、库存数量、是否在售的开关，支持在表格中直接编辑库存数量。`

### Skill 内部 Prompt 模板（英文，可直接粘贴使用）

> **Role**: Senior Frontend Prototyper  
> **Trigger**: "Create a prototype for [Feature Name]"  
> **Guidelines**:  
> 1. **Tech Stack & File Structure**:  
>    - If not specified, use **Vue 3 Single File Component** with `<script setup>` syntax.  
>    - Otherwise, follow the user's explicit choice (e.g. React + TypeScript `.tsx`).  
>    - Create a single, self-contained file (no external CSS modules).  
> 2. **Visuals**: Use **Tailwind CSS** for modern, polished styling. Do not use custom CSS files.  
> 3. **Data Isolation**:  
>    - DO NOT write actual API calls (`axios`/`fetch`).  
>    - Instead, define a `const MOCK_DATA` (and other mock helpers if needed) at the top of the script.  
> 4. **Interaction**:  
>    - Implement full interactivity for the new module (clicks, form inputs, modal open/close, inline edit, etc.).  
>    - It is acceptable (and encouraged) to **reuse / copy existing component logic** from the current file if that helps.  
> 5. **Simulation**:  
>    - When a user action occurs (e.g., submit, save, confirm), use `setTimeout(..., 800)` to simulate network latency.  
>    - Show a loading spinner or disabled state, then update the local state using `MOCK_DATA`.  
> 6. **Context**:  
>    - The user wants to test the *feel* of the data flow and user experience, **not** finalize the visual design.  
>    - Ensure the mock data structure is realistic (include IDs, status enums, timestamps, etc.).  
>    - When possible, align mock fields with similar existing components in this project.  

### 输出格式与要求

- **输出内容**：
  - 一段完整的组件代码（Vue `.vue` 或 React `.tsx`），可以直接复制到项目中运行。
  - 代码中显式包含：
    - `MOCK_DATA` 定义
    - 交互逻辑（事件处理函数、状态管理）
    - 使用 `setTimeout` 模拟异步过程
    - 合理的 Loading / 简单错误提示（如 `console.error` 或轻量提示）
- **不要求**：
  - 不要求符合最终 UI 设计规范、配色规范。
  - 不要求考虑复杂的响应式适配、浏览器兼容性。

### 最佳实践与使用建议

- **如何描述需求更清晰**：
  - 说明这是「在某个现有页面中新加的模块」，并用一句话说明该页面的主职责。
  - 列出新模块的**核心交互**（例如：点击新增、弹出详情、列表内编辑、步骤流转等）。
  - 用文字列出你关心的关键字段（如：订单号、状态、更新时间、操作者等）。

- **如何利用现有代码**：
  - 可以在调用 Skill 前，对 Cursor 说清楚：
    - 哪个现有子组件的交互/数据结构可以参考（例如“参考当前文件中的 `RefundHistory` 子组件”）。
  - 允许 AI 直接「复制 + 改造」这些现有逻辑，只在新需求部分做增删改。

- **心态与目标**：
  - 把这个 Skill 当作「快速搭一个可以点、可以看数据流的实验品」，而不是「一次到位的设计稿」。
  - 如果第一次产出不满意，你可以继续用自然语言迭代，例如：
    - 「增加一个确认弹窗，再提交」
    - 「把表格的操作列移动到最右边」
    - 「为库存编辑加上最小值/最大值校验」

### 与其它 Skills 的关系

- 当你对原型组件的交互体验和数据结构满意后：
  - 使用 **Skill 2：`pdd-skill2-api`**，从当前组件代码（尤其是 `MOCK_DATA` 和交互逻辑）中**逆向生成 OpenAPI 3.0 契约**，供 Apifox 导入。
  - 待 Apifox 生成 Mock URL 后，再使用 **Skill 3：`pdd-skill3-dev`**，把当前组件中的 `MOCK_DATA` 替换为真实的 HTTP 请求，实现与 Mock/真实服务的对接。

