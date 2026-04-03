---
name: add-api-included_api_types_gateways_views
description: 基于 Swagger/OpenAPI 与现有代码链路，设计“新增接口时，如何在 api/types/gateway/business(view) 四层做最小化改动”的方案。适用于用户给出 1 组或多组新接口、指定业务使用点、要求先不落代码只输出最小改动设计的场景；默认 API 契约文件为 F:\Documents\Repertory\Sieyuan\nebula\docs\api\seccenter.swagger.json。
---

# 目标

在“不落地到代码”的前提下，为新增接口输出一份可直接实施的最小化改动方案，覆盖：

- `api` 层：HTTP 方法、原始请求/响应模型
- `types` 层：稳定模型
- `gateway` 层：网关方法、模型映射、命名建议
- `business/view` 层：具体业务入口如何改用新方法

# 输入

1. `接口列表`
   例：`POST /seccenter/v2/menu/api/add|update|delete`
2. `业务使用点`
   例：`菜单管理 -> 功能项配置右侧 API 子项的新增/编辑/删除`
3. `spec_path`（可选）
   默认：`F:\Documents\Repertory\Sieyuan\nebula\docs\api\seccenter.swagger.json`

# 输出

只输出设计，不落代码。输出至少包含：

1. 现状链路
2. 最小改动边界
3. `api/types/gateway/business` 四层改动清单
4. 命名建议
5. 风险点与不做项
6. 可执行 todolist

# 工作流

## 1. 先确认边界

优先确认这次是否：

- 只替换业务层某一段写链路
- 还是读写都切
- 是否需要稳定模型补新字段
- 是否要求保持现有页面初始化/刷新逻辑不变

如果用户已经明确说明，直接沿用，不重复追问。

## 2. 读取契约与现状代码

至少检查三类信息：

1. Swagger/OpenAPI 中新增接口的 request/response schema
2. 当前业务使用点的读写链路
3. 现有 `api -> gateway -> view` 的命名与分层风格

优先查找：

- `src/api/**`
- `src/types/**`
- `src/gateways/**`
- 目标业务页面 / composable / model

## 3. 判断“最小改动”应该切哪一层

默认遵循：

- 读链路能不动就不动
- 只替换用户明确点名的业务写链路
- 不把后端版本号泄漏到 gateway 稳定能力命名
- 不把后端持久化主键污染注册中心

如果现有业务是“通过整节点更新间接修改子资源”，而新接口是“子资源单条增删改”，优先推荐：

- 保留原聚合读取源
- 只把写链路切到子资源接口

## 4. 四层设计规则

### api 层

需要输出：

- 新 HTTP 方法
- 原始 request/response DTO
- 原始 wire body

规则：

- 命名贴近 Swagger
- 原始模型保留后端字段形态
- 不在 api 层做业务语义映射

### types 层

需要输出：

- 稳定模型
- 与旧模型的兼容策略

规则：

- 业务层只消费稳定模型
- 新增字段默认先评估是否必须为可选
- 若存在“前端临时行 ID”和“后端真实主键”两套语义，禁止混用

### gateway 层

需要输出：

- 稳定命名的方法
- wire <-> stable 的映射函数
- 参数校验与 fail-fast 点

规则：

- 网关方法名不带版本号，除非仓库已有明确版本化约定
- 若域内有歧义，可采用中间态命名
  例：`addFunctionApi/updateFunctionApi/deleteFunctionApi`
- gateway 负责隔离 Swagger DTO 与 view 层

### business/view 层

需要输出：

- 哪些事件/提交函数/保存链路要替换
- 哪些旧函数可以保留
- 刷新策略是否复用现有树/详情拉取

规则：

- 只替换用户指定业务入口
- 成功后优先复用现有刷新逻辑
- 不随意引入新的查询链路

## 5. 明确字段来源

对每个新增稳定字段都写清：

- 来自后端哪个 schema
- 来自父节点上下文还是子资源返回体
- 是否需要上报到注册中心

默认原则：

- 后端资源主键来自接口返回，不来自注册中心
- 父资源 ID 通常来自当前页面已持有的节点上下文
- 注册中心只承载前端声明信息，不承载后端持久化资源主键

## 6. 输出格式

优先按下面结构输出：

1. 推荐方案
2. 现状与替换点
3. 四层最小改动设计
4. 风险与保守处理
5. 不做项
6. todolist

如果用户追问命名、字段来源、读写边界，直接在原方案上增量澄清，不要重写整份设计。

# 默认判断

若用户未提供 `spec_path`，默认使用：

`F:\Documents\Repertory\Sieyuan\nebula\docs\api\seccenter.swagger.json`

# 模板与案例

遇到类似需求时，优先参考本目录下的案例模板：

- `__template__/menu-function-api-single-write-path.md`

该案例记录了本次会话中的完整决策链：

- 只切右侧 API 子项写链路
- 读链路继续使用聚合 `apis[]`
- 稳定模型补 `id/menuId`
- UI 行 ID 与后端资源主键分离
- gateway 采用 `addFunctionApi/updateFunctionApi/deleteFunctionApi`
