# API 反查规则

## 目标

从路由页面和业务子组件出发，追到真实后端接口与契约说明。API 反查不能停在业务层、gateway 层、映射函数、未解析常量或子组件事件抬升处。

## 三类硬链路

1. `业务层 -> gateway -> api -> 契约`
   - 适用于页面、弹窗、表格操作列、组合式函数调用 gateway 方法的场景。
   - 必须从业务方法继续追到 gateway 内部 import 的 api 方法，再追到 api 文件中的最终 URL。

2. `业务层 -> api -> 契约`
   - 适用于页面或组合式函数直接 import `src/api` 的场景。
   - 必须继续解析 api 方法中的 base URL、常量、模板字符串和请求方法。

3. `子组件 emit/prop/v-model -> 父组件/组合式函数 -> gateway/api -> 契约`
   - 适用于子组件只负责表单、弹窗、按钮事件或 `update:*` 抬升的场景。
   - 子组件没有直接调用 API 不等于“无后端 API 调用”；必须继续检查父组件监听、props 回调、`v-model` 绑定、组合式函数返回方法和统一保存方法。

## gateway 深入规则

- gateway 方法内部若调用映射函数、模型转换函数、版本适配函数或二次包装函数，必须继续追到真实 api 方法。
- api 方法内部若使用 `BASE_URL`、`DEVICE_BASE_URL`、`MENU_BASE_URL` 等常量，必须解析常量定义后再拼最终 URL。
- 模板字符串、字符串拼接、枚举路径、`Record` 映射、方法名到接口名的映射表都必须展开；不得把 `/${BASE_URL}/xxx` 当最终 API。
- `direct`、`forward`、`/dev-api`、`{direct|forward}` 这类代理或转发前缀不是停止条件；输出时可以按项目口径保留或归一化，但必须说明契约匹配到的业务路径。
- 如果漏看 base URL 会导致 `/menu/activate` 这类错误路径，必须回到 gateway/api 常量层重新解析，不能把错误路径写入正式 API 表。

## 契约匹配规则

- 先得到源码最终 URL，再按 `默认 API契约 -> 补充契约路径 -> 待人工介入` 查找。
- 多契约场景要记录命中的契约文件；例如设备管理接口可能命中 `devmgr.swagger.json`，资源绑定接口可能命中 `dbres.swagger.json`。
- 契约未命中时，不允许主观补正式 `description`；只能写“待人工确认”并进入文末 `# 待人工介入`。

## 无后端调用门禁

只有完成三类硬链路反查后，且确认该交互只是纯前端状态、路由跳转或尚未绑定提交动作，才可以申请人工确认“当前无后端 API 调用”。

禁止以下替代结论：

- 业务层没有直接 import `src/api`，所以无 API。
- 子组件只 `emit` 或 `v-model`，所以无 API。
- 查到 gateway 方法但没追 api 层，写成无 API。
- 查到 `/${BASE_URL}/xxx`、`/${MENU_BASE_URL}/export` 这类未解析变量后直接输出。
- 因漏看 gateway/api base URL，把真实 `/forward/device/activate` 误写成 `/menu/activate`。

## 关注范围规则

- `focus_modules` 与 `focus_routes` 未提供或为空时，默认全量扫描、全量进入结论和待人工项。
- 同时提供 `focus_modules` 与 `focus_routes` 时取并集。
- `focus_modules` 支持模块名与路由前缀匹配，例如 `system` 可匹配 `/Apex/system/*`，`/Apex/system` 可按路由前缀匹配。
- 只有存在关注范围输入时，才启用非关注路由弱化策略；非关注路由仍可保留扫描证据，但结论可写“非本轮关注范围”或用户指定口径。

## 后端待开发

如果用户明确说明某接口前端已实现但后端待开发，或“先不设计权限点与 APIs”，则：

- 保留业务层到 gateway/api 的源码链路说明。
- 不强制设计权限点。
- 不把该接口写成已确认 API。
- 在待人工或暂不处理小节中记录用户结论，避免下一轮重复追问。
