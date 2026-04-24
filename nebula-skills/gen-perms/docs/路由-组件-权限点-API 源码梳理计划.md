# 路由-组件-权限点-API 源码梳理计划

## Summary

- 产出一份仓库内 Markdown 文档，按“路由 -> 页面组件/子组件 -> `v-hasPerm` 权限点 -> 该页面源码实际调用的 API”整理。
- 权限范围只统计源码里被 `v-hasPerm` 实际消费到的权限点；不扩展到角色树、菜单功能项配置里未被页面消费的权限。
- API 口径按页面源码真实调用归档，不按菜单管理里的“理论绑定 API”归档。

## Implementation Changes

- 扫描 [src/router/index.ts](/f:/Documents/Repertory/Sieyuan/nebula/apex_dev/src/router/index.ts:1)，建立静态路由到顶层页面组件的映射。
- 以 `rg -l "v-hasPerm"` 命中的页面和子组件为入口，回溯它们归属的路由页面；子组件并入所属页面，不单独当作路由。
- 对每个路由页面整理 4 类证据：
  - 路由路径、路由名、顶层页面组件。
  - 该页面直接或间接引用的含 `v-hasPerm` 子组件，以及每个组件消费的权限点字符串。
  - 页面及其相关子组件里实际调用的 `gateway` / `api` 方法。
  - 方法到具体接口的映射来源，优先取 `src/gateway/**`，必要时下钻到 `src/api/**`。
- 文档建议落到 `docs/plans/2026-04-23-route-component-permission-api-map.md`，按路由分节，表格列固定为：
  - `Route`
  - `Route Component`
  - `Permission Consumer Components`
  - `Permissions`
  - `Actual API Calls`
  - `API Endpoint Evidence`
- 每个路由下的“权限点到 API 映射”必须改为按权限点分组的明细表，列固定为：
  - `apiMethod`
  - `apiUrl`
  - `description`
- 字段口径：
  - `apiMethod` 使用接口 method（如 `POST`）。
  - `apiUrl` 使用业务接口路径，不带鉴权网关前缀（`/direct`、`/forward`、`{direct|forward}`）。
  - `description` 使用 swagger 接口可读描述文本，优先 `description` 字段，缺失时回退 `summary` 字段。
- 对未消费 `v-hasPerm` 的路由不做权限/API 细表，只在文档开头放“未命中权限消费的路由列表”简表，避免把无关页面混进主清单。
- 对以下已知命中页面重点整理：
  - `tenant`
  - `system/user`
  - `system/menu`
  - `deviceManage/device`
  - `deviceManage/deviceType`
  - 若某组件仅在注释里出现 `v-hasPerm`，不计入结果。

## Test Plan

- 重新执行 `rg -n -l "v-hasPerm" src/views src/components src/layouts`，确认文档覆盖全部真实命中文件。
- 对每个文档中的权限点，回查到具体模板行，确保都有源码证据。
- 对每个文档中的 API 调用，回查到对应 `gateway` 方法调用点，并继续回查到 `src/api/**` 中的真实接口 URL/HTTP method。
- 对每个权限点的 API 明细表，校验 `apiMethod/apiUrl/description` 三列均已填写；若 swagger 无 `description/summary`，明确标注“swagger 未提供接口描述”。
- 抽查每个路由至少一条组件归属链，确保子组件没有误归到错误页面。
- 对 `system/organization` 这类仅注释中出现权限指令的文件，明确标记为“不纳入统计”。

## Assumptions

- “每个路由”按 [src/router/index.ts](/f:/Documents/Repertory/Sieyuan/nebula/apex_dev/src/router/index.ts:1) 中当前可见静态路由为主，不额外恢复线上动态菜单数据。
- “权限点对应的 API”解释为：拥有该权限后，相关页面/组件在源码中实际会调用的接口，而不是后台菜单配置上可挂载的 API。
- 子组件里的权限点归属其父路由页面，例如 `TenantTable.vue` 归入 `/Apex/tenant`，`UserSearchBar.vue` / `UserTable.vue` 归入 `/Apex/system/user`。
- 文档是一次性源码盘点，不引入脚本自动生成；证据链全部来自现有源码可静态验证内容。
