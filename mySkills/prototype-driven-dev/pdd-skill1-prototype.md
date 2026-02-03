# Skill 1：pdd-skill1-prototype（极速原型生成）

## 概述

- **所属阶段**：S1「设计 / 极速原型」
- **目标**：**不修改现有业务页面**，而是“拷贝现有页面/模块 → 生成一份可运行的原型页（静态路由可访问）”，通过 **本地 Mock 数据**先把交互与数据流跑通，用于用户体验测试（UX 验证），不追求 UI 定稿。
- **执行者**：Cursor（Senior Frontend Prototyper）
- **输入**：自然语言需求 + 必要的页面/组件上下文说明
- **输出**：原型可访问入口（静态路由）+ 原型组件（Mock 数据），**尽量全部放在 `prototype/` 内**：
  - `prototype/<feature-key>/PrototypePage.vue`：原型“页面入口”（用于路由访问；可直接写 UI，也可仅包装内部原型组件）
  - `prototype/<feature-key>/Prototype.vue`：核心交互原型（Mock 数据 + setTimeout 模拟；建议页面复杂时拆分）
  - `prototype/<feature-key>/mock.js`（可选）：集中放 `MOCK_DATA` / mock helper，避免脚本膨胀
  - `prototype/router.js`：把 `PrototypePage.vue` 挂到 `/translate` 的 `children`（静态路由）

## 默认参数（建议）

- `--need-login`（默认：开启）：
  - **含义**：原型页面需要走项目现有的登录流程与路由守卫（未登录会被重定向到登录页，登录后回到原型页面）。
  - **实现约定**：原型应挂载为「登录后路由中的一个静态子路由」，例如：
    - `http://localhost:8080/#/translate/workbench/<prototype-path>`
  - **适用场景**：项目存在统一登录页/权限路由守卫，且直接打开独立 html 页面会被强制跳转到登录页或首页。

## 动态路由共存规则（避免被覆盖）

当项目采用“动态菜单路由 / 权限路由”时，原型页通常**不应依赖后端菜单配置**。为了确保原型路由始终可访问，需要遵循以下规则：

- **规则 1：原型页必须属于静态路由**
  - 把原型入口注册在静态路由表中（如 `src/router/index.js` 的固定 `routes`），不要仅存在于后端菜单（动态路由）里。

- **规则 2：动态路由只能“追加 children”，不能“覆盖根路由”**
  - 常见风险写法：动态路由生成一个新的 `/translate`（或其它 layout 根）并执行 `router.addRoute(menuRoot)`；这会导致静态 `/translate` 下的原型子路由在运行期**匹配不到**（表象是 404/“暂无权限”）。
  - 推荐写法：静态路由里提前声明 layout 根（如 `name: 'translate'`），动态路由只生成子路由列表，并使用：
    - `router.addRoute('translate', childRoute)` 逐个追加。

- **规则 3：快速自检清单（原型页打不开时优先检查）**
  - 检查 `src/router/index.js`：是否存在固定的 layout 根路由（例如 `/translate`）以及原型子路由是否注册在它的 `children` 中。
  - 检查 `src/router/permission.js`：是否存在 `router.addRoute(menuRoot)` 之类会新增根路由的逻辑；应改为 `router.addRoute('<layoutName>', child)` 的追加方式。
  - 检查 `src/router/asyncRouter.js`：是否返回了“根路由对象”；推荐只返回 `children[]`，避免与静态根路由冲突。
  - 若页面落到 `404` 或错误页文案提示“暂无权限”，先判断是否**路由未匹配**而非真实权限不足。

## 原型路由维护规则（建议）

为了方便对原型页面进行增删改，建议把“原型/开发测试用静态路由”集中维护在 `prototype/router.js`，并由主路由进行可选导入。

- **维护文件**：`prototype/router.js`
  - 在此文件中维护一个 `export default []` 的路由数组（均为 `/translate` 下的 children 路由）。
  - 文件内用中文注释明确：这些路由需要在 `src/router/index.js` 中被外部导入并追加。

- **接入方式**：`src/router/index.js`
  - 使用 `try/catch + require()` 的“可选导入”方式读取 `prototype/router.js`：
    - 有则 `children: [...prototypeRoutes]` 追加；无则回退为 `[]`，且**不会报错**。
  - 该规则可确保：原型页不依赖后端菜单/权限配置，也不会被动态路由覆盖。

## 技术栈与文件结构约定

### 技术栈选择规则

- **默认规则（优先）**：优先使用本项目现有组件的 API 风格
  - 通过分析 `src/views` 下的代码风格来确定项目使用的 API 类型（Options API 或 Composition API）
  - 确保原型代码与业务代码风格一致，便于后续迁移和维护
  - 例如：若项目主要使用 Options API，则原型组件也应使用 Options API
- **新建项目规则**：若为新建项目或项目中没有参考代码（`src/views` 为空或不存在），默认使用 Options API (setup)
- **用户指定规则**：若用户明确指定技术栈约定（如"使用 Composition API"或"使用 Options API"），则按用户要求执行
- **实际案例说明**：
  - `PrototypePage.vue` 可以使用 Composition API 作为入口页（简化页面逻辑）
  - 核心原型组件（如 `ImportModalPrototype.vue`）应优先使用与业务代码一致的 API 风格，例如：若参考的 `src/views/workbench/importModal.vue` 使用 Options API，则原型组件也应使用 Options API 以保持一致性

### 文件结构与目录

- **禁止修改**：任何被"参考/对照/拷贝来源"的现有业务页面（例如 `src/views/workbench/importModal.vue`）。
- **必须新增**（推荐"原型目录自包含"）：
  - `prototype/<feature-key>/`：一个需求一个目录（所有相关文件都放这里）
    - `PrototypePage.vue`：路由入口页（挂到 `/translate` 的 children）
    - `Prototype.vue` 或 `ImportModalPrototype.vue` 等：核心原型组件（可选；页面简单可省略）
    - `原型设计需求.md`：原型设计需求文档（可选，但推荐）
    - `mock.js`：Mock 数据与模拟函数（可选，见下方 Mock 数据组织规则）
  - `prototype/router.js`：新增静态路由条目（挂载在 `/translate` 下，`component` 直接 import `prototype/**/PrototypePage.vue`）

### Mock 数据组织规则

- **优先内联**：Mock 数据优先直接写在组件内（简单、直观）
  - 在组件 `<script>` 顶部定义 `const MOCK_DATA = [...]` 或 `const mockTask = {...}`
  - 适合数据量小、逻辑简单的场景
- **分离条件**：仅在以下情况才分离为独立的 `mock.js` 文件：
  - 组件内容过多（代码行数 > 3000 行）或逻辑复杂
  - Mock 数据量很大（数组长度 > 100 或对象嵌套层级 > 3）
  - Mock 数据包含复杂的模拟函数或工具方法
- **复用场景**：当 Mock 数据需要在多个组件间复用时，考虑提取为 `mock.js`
- **实际案例**：`prototype/importConfig/ImportModalPrototype.vue` 中 Mock 数据直接内联在组件内（如 `mockTask`、`mockClassifyLimit`），符合"优先内联"的原则

### 样式与组件库

- 本仓库默认使用 **Ant Design Vue**（优先使用现有组件与样式体系）
- 不强制 Tailwind；除非项目已配置并明确要求

> 说明：当 `--need-login` 启用时，原型页依然通过 `/translate` 下的静态子路由访问；路由 `component` 可直接指向 `prototype/**/PrototypePage.vue`，无需在 `src/views/**` 再放"薄包装页"。这是本项目的推荐做法，简化了文件结构，减少了不必要的中间层。

## 典型使用场景

- 在已有页面中增加新模块：
  - 新按钮 + 若干个模态框（申请流程、审批流程、详情展示等）
  - 新表单（过滤表单、编辑表单、批量操作表单）
  - 新图表 / `Qchart` 模块
- 新模块的数据结构与交互**部分参考现有子组件**，但有一部分**新字段、新流程**无法直接抄，需要 AI 帮你先设计数据流和交互。
- 目标是：**优先跑通数据流和交互**，而不是定稿 UI 设计。

## 原型开发流程

### 流程概述

1. **需求收集**：通过自然语言描述或需求文档收集原型需求
2. **需求文档化**：将需求记录到 `prototype/<feature-key>/原型设计需求.md`（推荐）
3. **原型实现**：根据需求生成原型代码
4. **需求同步**：原型代码变更时，同步更新需求文档（使用 `@pdd-skill1_1-improve`）

### 原型设计需求文档

- **位置**：`prototype/<feature-key>/原型设计需求.md`（推荐放在原型目录内）
- **作用**：
  - 记录原型设计的详细需求
  - 作为原型实现的参考依据
  - 便于后续维护和迭代
- **内容结构**（参考 `prototype/importConfig/原型设计需求.md`）：
  - 需求背景：说明参考的现有组件和改造目标
  - 改造位置：明确指出需要修改的代码位置
  - 新增 UI：描述新增的界面元素和交互
  - 功能目标：说明要实现的功能和体验目标

### 需求文档的使用方式

- **创建需求文档**：在原型目录下创建 `原型设计需求.md`，详细描述需求
- **引用需求文档**：使用 `--md` 参数引用需求文档作为需求来源
- **同步更新**：当原型代码变更时，使用 `@pdd-skill1_1-improve` 同步更新需求文档

### 原型与需求文档的同步机制

- **同步触发**：当对话中出现 `@pdd-skill1_1-improve` 时，必须同步更新需求文档
- **同步内容**：
  - 记录代码变更的原因和影响
  - 更新需求文档中的实现细节
  - 保持需求文档与代码实现的一致性
- **参考文档**：详见 `.cursor/skills/prototype-driven-dev/pdd-skill1_1-improve.md`

## 触发方式（你在 Cursor 里怎么说）

- **自然语言触发（推荐，命中率最高）**：
  - 任何以 `@pdd-skill1-prototype` 开头的对话，后面跟一段中文/英文描述，均视为一次"极速原型生成"需求，例如：
    - `@pdd-skill1-prototype 参考 importModal 的配置文件区块，新增 XML/JSON 子 Tab，并保持"配置文件："表单项不变`
    - `@pdd-skill1-prototype 做一个可点可看的导入流程原型，先用 MOCK_DATA 跑通交互`
  - 在这种用法下，按是否显式传入 `--md` 参数来区分：
    1. **仅自然语言，无 `--md` 参数**  
       - 直接根据自然语言描述理解为"新的原型设计需求"，并以此驱动实现；  
       - 同时将这些描述视为对默认需求文件的补充（必要时写回到 `.cursor/skills/prototype-driven-dev/原型设计需求.md`）。
    2. **使用 `--md` 但不带路径：`--md` 或 `--md default`**  
       - 默认使用 `.cursor/skills/prototype-driven-dev/原型设计需求.md` 作为原型设计需求的主体；  
       - 当前自然语言描述被视为对该文档的**补充/修订**，两者合并后作为本次新需求的完整描述。
    3. **使用 `--md [原型设计需求]` 且带路径**  
       - 使用指定的原型设计需求文档（如 `prototype/importConfig/原型设计需求.md` 或 `.cursor/skills/prototype-driven-dev/原型设计需求.md`）作为需求主体；  
       - 当前自然语言描述仍然是对该文档的补充说明，用"文档 + 描述"的组合来驱动本次原型生成与需求更新。
       - **示例**：`@pdd-skill1-prototype --md prototype/importConfig/原型设计需求.md 增加一个确认弹窗`

- **显式传入原型设计需求（可选）**：
  - `@pdd-skill1-prototype [原型设计需求]`
  - `[原型设计需求]` 默认值：`.cursor/skills/prototype-driven-dev/原型设计需求.md`
  - `[原型设计需求]` 支持：
    - 直接粘贴一段需求文本（覆盖/补充默认需求）
    - 或传入一个文件路径（相对仓库根路径），例如：`prototype/importConfig/原型设计需求.md`

- **示例 1：基于现有页面“拷贝 → 原型页”新增模块（推荐）**

  你可以在 Chat / Composer 中，对当前打开的页面或组件说：

  > `@pdd-skill1-prototype 参考 src/views/workbench/importModal.vue 的“配置文件/XML”交互，生成一个新的原型页（不要修改现有页面）：新增一个“JSON”Tab，用本地 MOCK_DATA 跑通选择/全选/清空/导入/结果查看。要求通过静态路由 /translate/... 访问以便体验测试。`

## 路由落地约定（本仓库推荐）

- 原型路由集中在 `prototype/router.js`（已由 `src/router/index.js` 可选导入并挂到 `/translate` 的 children）
- 路由条目**直接指向 `prototype/<feature-key>/PrototypePage.vue`**，**无需在 `src/views/**` 再放"薄包装页"**
- 实际配置示例（参考 `prototype/router.js`）：

```js
/**
 * 原型/开发测试用静态路由（不依赖后端菜单/权限配置）
 * 
 * 使用说明：
 * - 本文件由原型开发维护（增删改原型页面只改这里）
 * - 需要在 `src/router/index.js` 中"可选导入"并追加到 `/translate` 的 children 中
 */
export default [
  {
    // 访问：http://localhost:8080/#/translate/workbench/prototype-import-config.html
    path: 'workbench/prototype-import-config.html',
    name: 'prototypeImportConfig',
    // 原型页入口：直接指向 prototype 目录下的 PrototypePage.vue
    component: () => import('./importConfig/PrototypePage.vue'),
  },
]
```

- **路由配置要点**：
  - `path`：相对 `/translate` 的子路径，例如 `workbench/prototype-import-config.html`
  - `component`：使用动态导入 `() => import('./<feature-key>/PrototypePage.vue')`，直接指向原型组件
  - 无需在 `src/views` 下创建包装页，原型组件可直接作为路由组件使用

- **示例 2：从 0 生成一个表格原型**

  > `@pdd-skill1-prototype 为"产品库存表"生成可编辑的原型组件，包含产品图片、名称、库存数量、是否在售的开关，支持在表格中直接编辑库存数量。`

## 实际案例：importConfig（整组件拷贝）

以 `prototype/importConfig` 为例，说明"整组件拷贝"的实现方式：

### 案例背景

- **需求**：参考现有的"词条导入"模态框组件 `src/views/workbench/importModal.vue`，在保持其它导入方式（文件/TS/实时库/辞典/枚举等）整体拷贝不变的前提下，增强其中的"配置文件"导入方式，新增 XML/JSON 子 Tab
- **实现方式**：整组件拷贝 + 局部增强

### 文件结构

```
prototype/importConfig/
├── PrototypePage.vue          # 入口页（使用 Composition API，简化页面逻辑）
├── ImportModalPrototype.vue   # 核心原型组件（使用 Options API，与业务代码保持一致）
└── 原型设计需求.md            # 原型设计需求文档
```

### 实现要点

1. **PrototypePage.vue（入口页）**
   - 使用 Composition API (setup)，作为原型页面的入口
   - 提供 Mock 任务上下文（`mockTask`、`mockClassifyLimit`）
   - 控制模态框的打开/关闭
   - 引入核心原型组件 `ImportModalPrototype.vue`

2. **ImportModalPrototype.vue（核心原型组件）**
   - 使用 Options API，与参考的业务组件 `src/views/workbench/importModal.vue` 保持一致
   - **整组件拷贝**：完整复制业务组件的结构和逻辑
   - **局部增强**：在 `dataType === 'config'` 的区块中新增 XML/JSON 子 Tab
   - **Mock 数据内联**：Mock 数据直接写在组件内（`mockTask`、`mockClassifyLimit` 等）
   - **独立状态管理**：XML/JSON Tab 各自维护独立的已选项与搜索关键字

3. **原型设计需求.md**
   - 详细描述原型设计需求
   - 说明改造位置、新增 UI、功能目标等
   - 可通过 `--md` 参数引用此文档作为需求来源

### 路由配置

在 `prototype/router.js` 中配置：

```js
export default [
  {
    path: 'workbench/prototype-import-config.html',
    name: 'prototypeImportConfig',
    component: () => import('./importConfig/PrototypePage.vue'),
  },
]
```

### 访问方式

- 访问地址：`http://localhost:8080/#/translate/workbench/prototype-import-config.html`
- 通过静态路由直接访问，无需依赖后端菜单配置

### 关键经验

- **整组件拷贝**：当需要完整保留现有功能并局部增强时，采用整组件拷贝的方式
- **API 风格选择**：入口页可使用 Composition API 简化逻辑，核心组件应与业务代码保持一致
- **Mock 数据内联**：简单场景下 Mock 数据直接写在组件内，无需单独提取
- **需求文档同步**：使用 `原型设计需求.md` 记录需求，便于后续维护和同步

## Skill 内部 Prompt 模板（英文，可直接粘贴使用）

> **Role**: Senior Frontend Prototyper  
> **Trigger**: "Create a prototype for [Feature Name]"  
> **Guidelines**:  
>
> 1. **Tech Stack & File Structure**:  
>    - **Default Rule**: Analyze existing code style in `src/views` to determine the API style (Options API or Composition API) used in this project, and match that style for prototype components.  
>    - **New Project Rule**: If this is a new project or `src/views` is empty/non-existent, default to Composition API (setup).  
>    - **User Specified**: If the user explicitly specifies a tech stack (e.g., "use Composition API" or "use Options API"), follow the user's requirement.  
>    - **Entry Page Exception**: `PrototypePage.vue` can use Composition API for simplicity, but core prototype components should match the business code style.  
>    - Create a single, self-contained file (no external CSS modules).  
> 2. **Mock Data Organization**:  
>    - **Prefer Inline**: Mock data should be defined directly in the component (simple and intuitive).  
>    - **Extract When Needed**: Only extract to `mock.js` when component code exceeds 3000 lines or mock data is complex.  
>    - Define `const MOCK_DATA` (and other mock helpers if needed) at the top of the script.  
> 3. **Visuals**: Prefer the project's existing component library (e.g. Ant Design Vue) and minimal inline styles. Do not introduce a new styling system unless the user asks.  
> 4. **Data Isolation**:  
>    - DO NOT write actual API calls (`axios`/`fetch`).  
>    - Use mock data and `setTimeout` to simulate network requests.  
> 5. **Interaction**:  
>    - Implement full interactivity for the new module (clicks, form inputs, modal open/close, inline edit, etc.).  
>    - It is acceptable (and encouraged) to **reuse / copy existing component logic** from the reference file, **but do NOT edit the reference file**.  
> 6. **Simulation**:  
>    - When a user action occurs (e.g., submit, save, confirm), use `setTimeout(..., 800)` to simulate network latency.  
>    - Show a loading spinner or disabled state, then update the local state using `MOCK_DATA`.  
> 7. **Context**:  
>    - The user wants to test the *feel* of the data flow and user experience, **not** finalize the visual design.  
>    - Ensure the mock data structure is realistic (include IDs, status enums, timestamps, etc.).  
>    - When possible, align mock fields with similar existing components in this project.  

## 输出格式与要求

- **输出内容**：
  - 原型目录（`prototype/<feature-key>/`）+ 静态路由（`prototype/router.js`），可以直接在本项目中通过路由访问并体验测试。
  - 代码中显式包含：
    - `MOCK_DATA` 定义
    - 交互逻辑（事件处理函数、状态管理）
    - 使用 `setTimeout` 模拟异步过程
    - 合理的 Loading / 简单错误提示（如 `console.error` 或轻量提示）
- **不要求**：
  - 不要求符合最终 UI 设计规范、配色规范。
  - 不要求考虑复杂的响应式适配、浏览器兼容性。

## 最佳实践与使用建议

### 如何描述需求更清晰

- 说明这是「在某个现有页面中新加的模块」，并用一句话说明该页面的主职责。
- 列出新模块的**核心交互**（例如：点击新增、弹出详情、列表内编辑、步骤流转等）。
- 用文字列出你关心的关键字段（如：订单号、状态、更新时间、操作者等）。
- **推荐做法**：创建 `原型设计需求.md` 文档，详细记录需求，然后使用 `--md` 参数引用

### 如何利用现有代码

- 可以在调用 Skill 前，对 Cursor 说清楚：
  - 哪个现有子组件的交互/数据结构可以参考（例如"参考当前文件中的 `RefundHistory` 子组件"）。
- 允许 AI 直接「复制 + 改造」这些现有逻辑，但落地到 **prototype 新文件** 中，只在新需求部分做增删改。

### 原型开发模式选择

- **整组件拷贝模式**（推荐用于复杂组件）：
  - 适用场景：需要完整保留现有功能并局部增强
  - 实现方式：完整复制业务组件，在指定位置进行增强
  - 参考案例：`prototype/importConfig`（完整拷贝 `importModal.vue`，增强配置文件导入）
  - 优点：保持功能完整性，便于对比和迁移
  - 缺点：代码量较大，需要维护完整组件逻辑

- **部分功能原型模式**（推荐用于简单功能）：
  - 适用场景：只需要实现新功能的原型，不涉及现有功能
  - 实现方式：只实现新功能部分，使用 Mock 数据模拟依赖
  - 优点：代码简洁，聚焦核心功能
  - 缺点：可能缺少完整的上下文

### Mock 数据组织最佳实践

- **优先内联**：简单场景下，Mock 数据直接写在组件内
- **适时分离**：当组件代码超过 3000 行或 Mock 数据复杂时，考虑提取为 `mock.js`
- **保持真实**：Mock 数据结构应尽可能接近真实数据结构，包含 ID、状态、时间戳等字段
- **便于调试**：Mock 数据应包含多种状态和边界情况，便于测试不同场景

### 技术栈选择最佳实践

- **分析现有代码**：优先分析 `src/views` 下的代码风格，确定项目使用的 API 类型
- **保持一致**：核心原型组件应与业务代码使用相同的 API 风格
- **灵活入口**：入口页（`PrototypePage.vue`）可以使用不同的 API 风格以简化逻辑
- **用户优先**：若用户明确指定技术栈，优先按用户要求执行

### 需求文档管理最佳实践

- **及时记录**：原型开发时及时创建和更新需求文档
- **详细描述**：需求文档应包含背景、改造位置、新增 UI、功能目标等
- **同步更新**：代码变更时同步更新需求文档（使用 `@pdd-skill1_1-improve`）
- **版本管理**：需求文档应与代码一起纳入版本管理

## 强制约束（最重要）

- **禁止**：直接修改现有业务页面/组件来实现原型（除非你明确说“进入开发阶段/直接改现有页面”）。
- **必须**：新增 prototype 文件 + 静态路由入口，保证你可以通过 URL 直接跳转体验。
- **当对话中出现 `@pdd-skill1_1-improve` 时**：必须先读取并遵守 `.cursor/skills/prototype-driven-dev/pdd-skill1_1-improve.md` 中的工作流，即在完成原型代码改动的同时同步回写/完善设计需求文档，不得只改代码不更新需求。

- **心态与目标**：
  - 把这个 Skill 当作「快速搭一个可以点、可以看数据流的实验品」，而不是「一次到位的设计稿」。
  - 如果第一次产出不满意，你可以继续用自然语言迭代，例如：
    - 「增加一个确认弹窗，再提交」
    - 「把表格的操作列移动到最右边」
    - 「为库存编辑加上最小值/最大值校验」

## 与其它 Skills 的关系

- 当你对原型组件的交互体验和数据结构满意后：
  - 使用 **Skill 2：`pdd-skill2-api`**，从当前组件代码（尤其是 `MOCK_DATA` 和交互逻辑）中**逆向生成 OpenAPI 3.0 契约**，供 Apifox 导入。
  - 待 Apifox 生成 Mock URL 后，再使用 **Skill 3：`pdd-skill3-dev`**，把当前组件中的 `MOCK_DATA` 替换为真实的 HTTP 请求，实现与 Mock/真实服务的对接。
