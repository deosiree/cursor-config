# API 契约解析规则

## 优先级
1. 默认 `api契约`
2. `补充契约路径`
3. 停止并请求人工介入

## URL 解析前置
在查契约前，必须先按 `[[api-backtrace-rules.md]]` 从业务层追到源码最终 URL：

- gateway 层不是最终 API；必须继续追到 `src/api` 方法。
- api 方法中的 `BASE_URL`、`DEVICE_BASE_URL`、`MENU_BASE_URL`、模板字符串与字符串拼接必须展开。
- `direct`、`forward`、`{direct|forward}`、`/dev-api` 等代理或转发前缀可按项目口径归一化，但不能跳过真实业务路径。
- `/${BASE_URL}/xxx`、`/${MENU_BASE_URL}/export`、因漏看 base URL 得到的错误 `/menu/*` 都不能进入正式 API 表。

## 字段规则
- `apiMethod`：取 swagger path 下的方法名，输出统一大写
- `apiUrl`：取 swagger path key 原值
- `description`：
  - 优先 swagger `description`
  - 缺失回退 swagger `summary`
  - 若所有已知契约都未命中，则标记为“待人工确认”

## 多契约补充
如果默认 `seccenter.swagger.json` 不覆盖全部接口，可继续按顺序补读其他契约，例如 `dbres.json`。主说明仍把默认契约写成 `seccenter.swagger.json`，其余契约通过 `补充契约路径 / extra_api_contracts` 输入。

多契约命中时，应在待人工说明或口径说明中记录命中的契约文件。例如：

- 权限、用户、角色、安全配置优先命中 `seccenter.swagger.json`
- 设备管理接口可能命中 `devmgr.swagger.json`
- 资源绑定接口可能命中 `dbres.swagger.json`

## 禁止事项
- 不允许在正式 API 表里把 `源码语义推断` 当成最终 description
- 不允许在契约缺失时主观补一个看起来合理的描述
- 契约缺失时，必须输出 `# 待人工介入`
- 不允许用未解析变量、gateway 方法名或错误中间路径替代最终 API URL
- 不允许在未完成三类反查前写 `当前无后端 API 调用`
