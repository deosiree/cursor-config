---
名称: "<仓库名> 路由-组件-权限点-API 源码梳理"
仓库路径: "<绝对仓库路径>"
输出目录: "<repo>/docs/plans"
输出文件名: "路由-组件-权限点-API 源码梳理.md"
API契约: "F:\\Documents\\Repertory\\Sieyuan\\nebula\\docs\\api\\seccenter.swagger.json"
补充契约路径: []
约束与边界文件: "[[references/default-project-boundary.md]]"
路由入口: "src/router/index.ts"
视图根目录: "src/views"
组件根目录: "src/components"
网关根目录: "src/gateway"
原始API根目录: "src/api"
生成方式: "梳理权限点与apis"
title: "<仓库名> 路由-组件-权限点-API 源码梳理"
repo_path: "<绝对仓库路径>"
output_dir: "<repo>/docs/plans"
output_file: "路由-组件-权限点-API 源码梳理.md"
api_contract: "F:\\Documents\\Repertory\\Sieyuan\\nebula\\docs\\api\\seccenter.swagger.json"
extra_api_contracts: []
boundary_file: "[[references/default-project-boundary.md]]"
router_entry: "src/router/index.ts"
views_root: "src/views"
components_root: "src/components"
gateway_root: "src/gateway"
raw_api_root: "src/api"
generated_by: "梳理权限点与apis"
---

# 口径说明

- 仅统计源码中已命中的 `v-hasPerm` 权限点。
- `apiUrl` 去掉 `direct` / `forward` / `{direct|forward}` 前缀，统一落业务路径。
- `description` 优先读取默认契约或补充契约中的 `description`，缺失回退 `summary`。
- 若所有已知契约都未命中，不允许主观推断正式 `description`，改为标记“待人工确认”，并进入文末 `# 待人工介入`。
- 每个路由页面需要递归扫描页面组件及其所有业务子孙组件。
- 未命中 `v-hasPerm` 但真实调用 API 的交互，分别落到“未命中权限控制的组件”和“未命中权限控制的权限点”。

# <routePath>

## 组件

页面组件总表

| 路由 | 对应组件路径 |
| --- | --- |
| `<routePath>` | `<src/views/...>` |
| `<routePath>` | `<src/views/.../components/...>` |

### <完整组件路径>

- ``v-hasPerm="'<权限标识1>'"``：`<业务动作>`
- ``v-hasPerm="'<权限标识2>'"``：`<业务动作>`

### 未命中权限控制的组件

#### <完整组件路径>

- 期望补齐的权限点
  - `<建议权限标识1>`
  - `<建议权限标识2>`
- 真实调用 API 的交互：`<功能/按钮/入口>`
- 应补权限控制原因：`<为什么这个交互不应裸露>`
- 建议加权限的位置：`<哪一段代码附近增加 v-hasPerm>`

## 权限点

已命中权限点总表

| 权限名称 | 权限标识 |
| --- | --- |
| `<按钮/功能名>` | `<module:action>` |

### <权限标识>

| 对应功能 | 对应组件路径 | 对应行号 | 对应代码 |
| --- | --- | --- | --- |
| `<功能名>` | `<src/views/...>` | `<10-12（业务动作）>` | ``v-hasPerm="'<module:action>'"`` |

| apiMethod | apiUrl | description |
| --- | --- | --- |
| `POST` | `</path>` | `<来自默认契约、补充契约，或待人工确认>` |

### 未命中权限控制的权限点

| 权限名称 | 权限标识 |
| --- | --- |
| `<建议补齐的功能名>` | `<建议权限标识>` |

#### <建议权限标识>

| 对应功能 | 对应组件路径 | 对应行号 | 对应代码 |
| --- | --- | --- | --- |
| `<功能名>` | `<src/views/...>` | `<建议行号（业务动作）>` | `<建议添加 v-hasPerm 的代码位置>` |

| apiMethod | apiUrl | description |
| --- | --- | --- |
| `POST` | `</path>` | `<来自默认契约、补充契约，或待人工确认>` |

# 待人工介入

当前无待人工介入项。

若存在待确认接口，按以下结构追加：

## <apiUrl 或 路由/组件上下文>

- 源码消费位置：`<src/views/...>`
- 当前状态：`契约缺失，待人工确认`
- 缺失信息：`<缺哪个契约或缺哪个接口描述>`
- 建议补充：`<补充契约路径 / 人工解释 / swagger 片段>`
- 下一轮调用建议：`<再次调用 skill 时应补哪些参数>`
