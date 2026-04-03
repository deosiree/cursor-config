# 案例模板：菜单功能项 API 子项单条写链路设计

## 会话背景

本次需求来自系统菜单页的“菜单管理 -> 功能项配置”区域。

用户给出 Swagger 中 3 个新接口：

- `POST /seccenter/v2/menu/api/add`
- `POST /seccenter/v2/menu/api/update`
- `POST /seccenter/v2/menu/api/delete`

契约来源：

- `F:\Documents\Repertory\Sieyuan\nebula\docs\api\seccenter.swagger.json`

要求：

- 先不落代码，只设计最小化改动
- 后续确认后再实现

## 初始现状

右侧 API 子项的新增/编辑/删除并不是独立资源操作，而是：

1. 在 UI 中修改父功能项的 `apis[]`
2. 再调用菜单级 `menu/update`
3. 通过整节点更新间接完成 API 子项变更

也就是说，当时的真实链路是“聚合写”，不是“单条 API 资源写”。

## 用户确认后的边界

用户最终确认：

1. 只替换“功能项配置”右侧 API 子项的新增/编辑/删除
2. 功能项节点本身的新增/编辑继续走现有菜单接口
3. API 子项稳定模型补上 `id/menuId`
4. 右侧面板写链路从“整节点更新”改成“单条 API 记录更新”
5. 网关方法最终采用中间态命名：
   - `addFunctionApi`
   - `updateFunctionApi`
   - `deleteFunctionApi`

## 关键设计决策

### 1. 只改写链路，不改读链路

最终保留：

- 右侧面板展示仍然来自功能项节点聚合返回的 `apis[]`
- 新增/编辑/删除 API 子项时改调单条接口
- 成功后继续走现有刷新逻辑，由菜单树/详情重新回显

原因：

- 改动面最小
- 不需要新增独立查询接口
- 不需要重构页面初始化状态

### 2. 稳定模型补 `id/menuId`

稳定模型从 `MenuApiItem` 演化为 `FunctionApiItem`，并补充：

- `id?: string`
- `menuId?: string`

原因：

- 新增态可能只有 `menuId`，没有 `id`
- 编辑/删除必须依赖后端 API 记录主键 `id`

### 3. 不把后端主键上报到注册中心

`id/menuId` 的来源被明确为：

- `menuId`：来自当前功能项节点 ID
- `id`：来自后端 `menu_apis` 记录 ID

并明确：

- 不需要上报到注册中心
- 注册中心只负责前端声明信息
- 后端资源主键只存在于菜单接口返回与网关稳定模型中

### 4. UI 行 ID 与后端主键分离

这是实现阶段最重要的工程决策之一。

因为右侧表格原本使用 `id` 作为前端渲染行键，而后端 API 资源也有自己的 `id`，所以最终采用：

- `FunctionConfigApiRow.id`：继续做前端行 ID
- `FunctionConfigApiRow.backendApiId`：承载后端 API 资源主键
- `FunctionConfigApiRow.menuId`：承载父功能项 ID

原因：

- 避免 UI 行键和后端主键语义冲突
- 草稿态与已落库态可以共存
- 不破坏现有表格和交互逻辑

## 四层设计落点

### api 层

新增：

- 单条 API 资源的原始 wire body
- `add/update/delete` 请求与响应模型
- `MenuV2API.addFunctionApi`
- `MenuV2API.updateFunctionApi`
- `MenuV2API.deleteFunctionApi`

### types 层

调整：

- 稳定模型名改为 `FunctionApiItem`
- 补充 `id/menuId`

### gateway 层

新增：

- `addFunctionApi`
- `updateFunctionApi`
- `deleteFunctionApi`
- wire <-> stable 映射函数

原则：

- 方法名不带版本号
- 屏蔽 Swagger DTO 细节
- 由 gateway 负责稳定命名和 fail-fast

### business/view 层

替换点：

- 删除 API 子项：改调 `deleteFunctionApi`
- 保存 API 子项编辑：改调 `updateFunctionApi`
- 保存 API 子项新增：改调 `addFunctionApi`

保留：

- 功能项节点自身增删改链路不变
- 成功后仍调用现有刷新逻辑

## 风险点

1. 后端菜单树/详情是否真的返回 `apis[].id/menuId`
   如果不返回，刷新后无法继续编辑/删除已落库 API 子项。

2. 旧业务代码是否还存在通过整节点更新修改 API 子项的旁路
   若存在，需要一并识别，否则同域内会出现两种写法并存。

3. UI 临时草稿与后端资源主键混淆
   这是最容易引发删除/编辑误操作的点，因此必须分字段存储。

## 不做项

本案例明确不做：

- 不把右侧读取源切到独立 API 列表
- 不新增单独的 API 查询链路
- 不改功能项节点自身的创建/编辑协议
- 不把后端资源主键同步到注册中心

## 适用触发词

当用户需求类似下面表述时，可直接参考本模板：

- “新增了几条 API，希望先设计怎么接到 api/types/gateway/view”
- “业务里现在是整节点 update，想改成子资源单条增删改”
- “先不要写代码，只给最小改动方案”
- “Swagger 已有，帮我设计接入路径”
