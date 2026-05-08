---
名称: "apex_dev API 反查关注路由迭代样例"
仓库路径: "F:\\Documents\\Repertory\\Sieyuan\\nebula\\apex_dev"
输出目录: "F:\\Documents\\Repertory\\Sieyuan\\nebula\\apex_dev\\docs\\plans"
输出文件名: "路由-组件-权限点-API 源码梳理.md"
API契约: "F:\\Documents\\Repertory\\Sieyuan\\nebula\\docs\\api\\seccenter.swagger.json"
补充契约路径:
  - "F:\\Documents\\Repertory\\Sieyuan\\nebula\\docs\\api\\devmgr.swagger.json"
  - "F:\\Documents\\Repertory\\Sieyuan\\nebula\\docs\\api\\dbres.swagger.json"
关注模块: []
关注路由:
  - "/Apex/tenant"
  - "/Apex/system/user"
  - "/Apex/system/role"
  - "/Apex/system/menu"
  - "/Apex/system/securityConfig"
  - "/Apex/profile"
非关注路由处理策略: "非关注路由标记为非本轮关注范围"
生成方式: "梳理权限点与apis"
title: "apex_dev API 反查关注路由迭代样例"
repo_path: "F:\\Documents\\Repertory\\Sieyuan\\nebula\\apex_dev"
output_dir: "F:\\Documents\\Repertory\\Sieyuan\\nebula\\apex_dev\\docs\\plans"
output_file: "路由-组件-权限点-API 源码梳理.md"
api_contract: "F:\\Documents\\Repertory\\Sieyuan\\nebula\\docs\\api\\seccenter.swagger.json"
extra_api_contracts:
  - "F:\\Documents\\Repertory\\Sieyuan\\nebula\\docs\\api\\devmgr.swagger.json"
  - "F:\\Documents\\Repertory\\Sieyuan\\nebula\\docs\\api\\dbres.swagger.json"
focus_modules: []
focus_routes:
  - "/Apex/tenant"
  - "/Apex/system/user"
  - "/Apex/system/role"
  - "/Apex/system/menu"
  - "/Apex/system/securityConfig"
  - "/Apex/profile"
non_focus_route_strategy: "mark_non_focus_scope"
generated_by: "梳理权限点与apis"
---

# 口径说明

- 本样例演示一次 API 反查回归：先出现“漏看 gateway / 子组件 emit / 补充契约”的错误，再根据用户反馈修正。
- `focus_routes` 已提供，因此结论和待人工项优先收敛到关注路由；非关注路由只保留“非本轮关注范围”。
- API 反查必须追完 `业务层 -> gateway -> api -> 契约`、`业务层 -> api -> 契约`、`子组件 emit/prop/v-model -> 父组件/组合式函数 -> gateway/api -> 契约`。
- 前端已实现但用户明确说明后端待开发的接口，只保留链路和暂不处理结论，不设计权限点与 API。

# 失败基线

| 错误结论 | 问题 | 修正动作 |
| --- | --- | --- |
| 设备激活 API 写成错误菜单路径 | 停在错误中间路径，未继续解析 gateway/api base URL | 追到 `DeviceAPI.deviceActivate` 后得到 `/forward/device/activate`，匹配 `devmgr.swagger.json` |
| API 写成未解析设备 base URL 占位 | 未解析 api 文件常量 | 展开设备 base URL 后再查契约 |
| `/Apex/system/securityConfig` 被误判为无后端调用 | 只看子组件直接调用，漏看 emit 抬升和组合式函数 | 追 `LoginPolicyCard/PasswordPolicyCard/SessionPolicyCard -> index.vue -> useSecurityConfigPage -> gateway/api` |
| `/Apex/profile` 只识别查看资料 | 漏掉修改密码、修改资料、修改邮箱、修改手机号 | 从弹窗/表单触发点继续追 `UserGateway/AuthGateway -> UserV2API/AuthV2API` |
| `/dbres/devicebind/list` 契约缺失 | 只查默认 seccenter 契约 | 补充 `dbres.swagger.json` |

# /Apex/tenant

## 设备绑定与激活链路

| 对应功能 | 业务层位置 | gateway 位置 | api 位置 | 契约 |
| --- | --- | --- | --- | --- |
| 设备激活 | `src/views/tenant/components/BindDeviceDialog.vue` | `src/gateway/device/device.gateway.ts` `DeviceGateway.deviceActivate` | `src/api/device/device.api.ts` `DeviceAPI.deviceActivate` -> `/forward/device/activate` | `docs/api/devmgr.swagger.json` |
| 设备绑定列表 | `src/views/tenant/components/BindDeviceDialog.vue` | 资源/设备绑定 gateway | dbres api -> `/dbres/devicebind/list` | `docs/api/dbres.swagger.json` |

## 修正后结论

- 不得输出错误菜单路径。
- 不得输出未解析的 base URL 占位。
- 若 `devmgr.swagger.json` 或 `dbres.swagger.json` 未作为补充契约输入，应进入 `# 待人工介入`，而不是写“无后端 API 调用”。

# /Apex/system/securityConfig

## 子组件抬升链路

| 子组件 | 抬升方式 | 父级/组合式函数 | gateway/api | 权限点识别 |
| --- | --- | --- | --- | --- |
| `src/views/system/securityConfig/components/LoginPolicyCard.vue` | `emit` / 表单状态 | `src/views/system/securityConfig/index.vue`、`useSecurityConfigPage` | `ConfigGateway -> ConfigV2API -> seccenter.swagger.json` | 查看、编辑、保存登录策略 |
| `src/views/system/securityConfig/components/PasswordPolicyCard.vue` | `emit` / 表单状态 | `src/views/system/securityConfig/index.vue`、`useSecurityConfigPage` | `ConfigGateway -> ConfigV2API -> seccenter.swagger.json` | 查看、编辑、保存密码策略 |
| `src/views/system/securityConfig/components/SessionPolicyCard.vue` | `emit` / 表单状态 | `src/views/system/securityConfig/index.vue`、`useSecurityConfigPage` | `SessionConfigGateway -> SessionConfigV2API -> seccenter.swagger.json` | 查看、编辑、保存会话策略 |

## 修正后结论

`/Apex/system/securityConfig` 不允许因为子组件没有直接 import api 就判定无后端调用。权限点和 API 应从父组件保存动作、组合式函数和 gateway 继续反查。

# /Apex/profile

## 个人中心链路

| 对应功能 | 业务层入口 | gateway/api | 契约 |
| --- | --- | --- | --- |
| 修改个人信息 | `src/views/profile/index.vue` 及资料表单 | `UserGateway -> UserV2API` | `seccenter.swagger.json` |
| 修改密码 | `src/views/profile/index.vue` 及密码弹窗 | `AuthGateway/UserGateway -> AuthV2API/UserV2API` | `seccenter.swagger.json` |
| 修改邮箱 | `src/views/profile/index.vue` 及邮箱弹窗 | `UserGateway -> UserV2API` | `seccenter.swagger.json` |
| 修改手机号 | `src/views/profile/index.vue` 及手机号弹窗 | `UserGateway -> UserV2API` | `seccenter.swagger.json` |

## 修正后结论

`/Apex/profile` 至少要覆盖修改信息、修改密码、修改邮箱、修改手机号。若某一项只在弹窗子组件中抬升事件，仍需追到父页面或组合式函数的提交方法。

# 后端待开发，暂不设计

| 接口或链路 | 用户结论 | 输出策略 |
| --- | --- | --- |
| `/seccenter/v2/user/import` | 前端已实现，后端待开发 | 保留链路，不设计权限点与 API |
| 菜单导出接口 | 前端已实现，后端待开发 | 保留链路，不设计权限点与 API |
| 菜单导出 base URL 链路 | 前端已实现，后端待开发 | 不输出未解析变量，不继续追问 |

# 待人工介入

当前样例中，关注路由的已知问题已通过补充契约或用户结论收敛。若实际仓库中仍有接口在默认契约和补充契约中均未命中，应按“业务层组件 -> gateway 方法 -> api 方法/常量 -> 契约缺失说明”记录。
