## Skill 2：pdd-skill2-api（从原型逆向生成 API 契约）

### 概述

- **所属阶段**：S3「定义 / 逆向契约」
- **目标**：在你已经对前端原型（尤其是数据结构和交互流程）满意的前提下，从组件代码中**逆向提取 RESTful API 契约**，输出 OpenAPI 3.0 YAML，方便导入 Apifox。
- **执行者**：Cursor（API Architect）
- **输入**：确认后的原型组件代码（包含 `MOCK_DATA`、类型声明、交互函数等）
- **输出**：一段可被 Apifox 直接导入的 **OpenAPI 3.0 YAML** 代码块。

### 使用前提与定位

- 你已经通过 **Skill 1：`pdd-skill1-prototype`** 生成并迭代了前端原型：
  - 组件内部有较稳定的 `MOCK_DATA` 结构
  - 关键的用户操作（新增、编辑、删除、查询等）已经跑通
- 当前目标是：**让后端与 Apifox 明确接口契约**，而不是再改 UI。

### 触发方式（你在 Cursor 里怎么说）

- 一般流程：
  1. 打开已经确认的原型组件文件（或选中其中关键部分代码）；
  2. 在 Chat 中输入触发语句。

- **推荐触发关键词**：
  - `@pdd-api`
  - `Skill 2`
  - `生成 OpenAPI`

- **示例 1：直接对当前组件生成契约**

  > `@pdd-api 根据当前这个库存管理组件，生成对应的 OpenAPI 3.0 YAML，只输出 YAML 代码块，用于导入 Apifox。`

- **示例 2：选中局部代码后生成契约**

  先选中组件中与新模块相关的代码段（含 `MOCK_DATA` 和交互函数），然后在 Chat 中输入：

  > `@pdd-api 根据选中的这段代码，推导 CRUD 接口，并生成 OpenAPI 3.0 YAML，只输出 YAML。`

### Skill 内部 Prompt 模板（英文，可直接粘贴使用）

> **Role**: API Architect  
> **Trigger**: "Generate OpenAPI spec from this component"  
> **Context**:  
> - Analyze the currently open frontend component (or the selected code block),  
> - Focus on the `MOCK_DATA` structure, TypeScript interfaces/types (if any),  
> - And user interaction handlers (e.g., `handleSubmit`, `handleCreate`, `handleUpdate`, `handleDelete`, `handleFetch`).  
> **Action**: Generate a valid **OpenAPI 3.0 (YAML)** specification.  
> **Requirements**:  
> 1. **Endpoints**: Infer endpoints based on user actions and data operations.  
>    - Read data -> `GET /api/v1/[resource]`  
>    - Add data -> `POST /api/v1/[resource]`  
>    - Update data -> `PUT` or `PATCH /api/v1/[resource]/{id}`  
>    - Delete data -> `DELETE /api/v1/[resource]/{id}`  
> 2. **Schema**:  
>    - Derive schemas from TypeScript interfaces or `MOCK_DATA` objects.  
>    - Detect primitive types accurately (`integer`, `number`, `string`, `boolean`, `array`, `object`).  
>    - Include enums (e.g., status values) and common fields (IDs, timestamps, operator names).  
> 3. **Request/Response Bodies**:  
>    - For write operations (POST/PUT/PATCH), define request body schemas.  
>    - For read operations (GET), define response schemas and include example payloads based on the mock data.  
> 4. **Consistency**:  
>    - Keep resource naming consistent (e.g. `products`, `orders`, `refund-requests`).  
>    - If the component clearly belongs to a specific domain (inventory, orders, refunds), reflect that in the path names.  
> 5. **Output Format**:  
>    - Output **only** a fenced YAML code block with a complete, valid OpenAPI 3.0 document (or fragment that Apifox can import).  
>    - Do not add natural language explanations outside the YAML block.  

### 输出格式与要求

- **必须包含的要素**（建议结构）：
  - `openapi: 3.0.0`
  - `info`：基础信息（标题、版本）
  - `paths`：根据组件中的操作推导出的各个接口路径和 HTTP 方法
    - 对每个路径，包含：
      - `summary` / `description`
      - `parameters`（如 `path` 中的 `id`）
      - `requestBody`（如创建/更新时的请求体）
      - `responses`：至少 `200` 响应，带上 JSON schema 与示例
  - `components.schemas`：根据 `MOCK_DATA` / TS Interface 推导的实体模型

- **导入 Apifox 的注意点**：
  - 输出应为**纯 YAML 代码块**，不夹杂中文说明，方便你“一键复制粘贴”到 Apifox。
  - 示例结构应尽量贴近前端原型中的字段命名与类型，减少前后端沟通成本。

### 最佳实践与使用建议

- **在调用 Skill 2 之前**：
  - 先用 Skill 1 把交互与数据结构打磨到相对稳定；
  - 尽量在代码中使用 TypeScript 类型/接口（例如 `interface OrderItem { ... }`），这样有利于更准确推断 schema。

- **如何让契约更贴近真实业务**：
  - 在触发语句中，补充业务域信息，例如「这是库存管理模块」「这是退款申请流程」；
  - 指出哪些字段是必填、哪些字段是只读（如创建时间、更新时间等），AI 会在 schema 中体现 `required` 与只读属性。

- **对生成结果的使用方式**：
  1. 将 YAML 复制到剪贴板；
  2. 打开 Apifox，选择「导入 OpenAPI」；
  3. 导入后由 Apifox 自动生成 Mock 接口与 Mock URL；
  4. 这些 Mock URL 会在下一阶段由 **Skill 3：`pdd-skill3-dev`** 使用。

### 与其它 Skills 的关系

- **前置 Skill**：`pdd-skill1-prototype`
  - Skill 2 假设你已经有一个相对稳定、可运行的前端原型，并且 Mock 数据结构已经基本定型。
- **后续 Skill**：`pdd-skill3-dev`
  - Skill 2 生成的 OpenAPI 被导入 Apifox 后，Apifox 会为每个接口生成 Mock URL；
  - 然后你可以把这些 Mock URL 交给 Skill 3，把前端组件里的 `MOCK_DATA` 替换为真实的 HTTP 请求调用。

