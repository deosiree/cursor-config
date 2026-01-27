## Skill 3：pdd-skill3-dev（对接 Mock / 真实接口）

### 概述

- **所属阶段**：S5「开发 / 真实对接」
- **目标**：在 Apifox 已经基于 OpenAPI 生成 Mock URL 的前提下，把前端组件中的本地 `MOCK_DATA` **替换为真实 HTTP 请求**，并保留现有 UI 与交互行为。
- **执行者**：Cursor（Frontend Engineer）
- **输入**：
  - 一份已经通过 Skill 1 打磨好的原型组件代码（内部使用 `MOCK_DATA`）
  - 从 Apifox 导出的 Mock URL（或将来真实后端 URL）
- **输出**：
  - 同一个组件的改造版：移除了 `MOCK_DATA`，增加了网络请求、加载状态、错误处理等逻辑，可直接跑通 Apifox Mock。

### 使用前提与定位

- 你已经完成：
  - Skill 1：`pdd-skill1-prototype`（原型 + Mock 数据）  
  - Skill 2：`pdd-skill2-api`（OpenAPI 契约）  
  - 并在 Apifox 中导入了 OpenAPI，拿到对应接口的 **Mock URL**。
- 当前目标是：在不破坏现有 UI/交互体验的情况下，**把数据源从本地改为远端 HTTP 请求**。

### 触发方式（你在 Cursor 里怎么说）

- **推荐触发关键词**：
  - `@pdd-dev`
  - `Skill 3`
  - `Refactor to use API`

- **示例 1：对单个 Mock URL 进行改造**

  > `@pdd-dev 使用这个 Mock URL 重构当前库存管理组件的数据读取和提交逻辑：https://mock.apifox.com/m1/12345-abc/inventory`

- **示例 2：组件内有多个接口**

  > `@pdd-dev 当前组件中涉及列表查询、创建、更新、删除 4 个操作，对应的 Mock URL 分别是：  
  > - GET: https://mock.apifox.com/.../inventory  
  > - POST: https://mock.apifox.com/.../inventory  
  > - PATCH: https://mock.apifox.com/.../inventory/{id}  
  > - DELETE: https://mock.apifox.com/.../inventory/{id}  
  > 请重构组件代码，移除 MOCK_DATA，改用这些接口，并保留现有 UI 和交互。`

### Skill 内部 Prompt 模板（英文，可直接粘贴使用）

> **Role**: Frontend Engineer  
> **Trigger**: "Refactor to use API: [Insert Mock URL(s)]"  
> **Action**: Refactor the current component to replace local mock data with real network requests.  
> **Steps**:  
> 1. **Cleanup**:  
>    - Remove the hardcoded `MOCK_DATA` constant and any other unused mock helpers.  
> 2. **Client Setup**:  
>    - Import the project's existing HTTP client utility if it is available (e.g. `request`, `apiClient`).  
>    - If no such utility is visible in the current project, fall back to `axios`.  
> 3. **Implementation**:  
>    - For initial data loading, use `onMounted` (Vue) or `useEffect` (React) to send a `GET` request to the provided URL.  
>    - Replace local state initialization from `MOCK_DATA` with the response data from the API.  
>    - Update button actions or form submissions to send `POST`, `PUT/PATCH`, and `DELETE` requests to the corresponding URLs.  
> 4. **Robustness & UX**:  
>    - Wrap all network calls in `try/catch` blocks (or `.catch` for promises).  
>    - Add a `loading` state to control spinners, disabled buttons, or skeletons during requests.  
>    - Add an `error` state to surface failures (e.g., toast notifications, inline error text, or console error logs if the project has no toast system).  
> 5. **Preservation**:  
>    - Keep all existing UI structure, Tailwind classes, and user interaction flow intact.  
>    - Only change the **data source layer** (where data is read, created, updated, or deleted).  
> 6. **Environment Awareness**:  
>    - Where reasonable, make it easy to switch between Mock URL and real backend URL (e.g., via environment variables or a simple config constant).  

### 输出格式与要求

- **必备内容**：
  - 完整可运行的组件代码（Vue `.vue` 或 React `.tsx`，保持与原组件技术栈一致）；
  - 移除 `MOCK_DATA` 相关代码；
  - 引入 HTTP 客户端（项目封装优先，其次 `axios`）；
  - 根据你提供的 Mock URL：
    - 实现列表/详情查询；
    - 实现新增、编辑、删除等变更操作；
  - 补充：
    - `loading` 状态，用于控制加载中 UI；
    - `error` 状态，用于展示错误信息（或最少 `console.error` 记录）。

- **保持不变的内容**：
  - 现有的 DOM 结构、Tailwind 类名、文案、按钮布局等；
  - 已经验证过的交互流程（点击顺序、表单校验等），只更换其背后的数据来源。

### 最佳实践与使用建议

- **建议在开发分支上使用**：
  - 在接入真实/Mock 接口前，建议切到 `develop` 或对应功能分支，避免直接污染主分支。

- **如何描述接口信息更清晰**：
  - 尽量一次性列出当前组件需要使用的所有 Mock URL（按 GET/POST/PATCH/DELETE 分类）；
  - 如果有路径参数（如 `/inventory/{id}`），在说明中指出 `id` 的含义（产品 ID、订单 ID 等）。

- **Mock 与真实后端的切换**：
  - 可以在说明中要求：
    - 使用一个简单配置对象，如：
      - `const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://mock.apifox.com/...'`
    - 或通过项目现有的环境变量 / config 文件来区分 Mock 与生产地址；
  - 这样后续只需替换配置，而无需再大改组件。

### 与其它 Skills 的关系

- **前置 Skill**：
  - `pdd-skill1-prototype`：提供了基于 Mock 的前端原型代码；
  - `pdd-skill2-api`：为 Apifox 提供了 OpenAPI 契约，Apifox 基于此生成 Mock URL。
- **后续操作**：
  - 当后端实现了真实接口，并接入相同的路径与字段结构时，你可以：
    - 将 Mock URL 换成真实后端 URL；
    - 或通过环境变量切换到生产/测试环境，而前端组件逻辑无需再做大改。

