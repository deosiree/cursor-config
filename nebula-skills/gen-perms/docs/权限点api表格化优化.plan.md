---
name: 权限点API表格化优化
overview: 基于现有梳理文档与 seccenter/dbres swagger，优化现有计划，新增“每个权限点下 API 明细表（apiMethod/apiUrl/description）”的统一产出规范与校验流程。
todos:
  - id: spec-table-format
    content: 在梳理计划文档中新增“权限点 API 表格化规范（apiMethod/apiUrl/description）”与字段映射口径
    status: completed
  - id: rewrite-permission-sections
    content: 将主梳理文档中每个权限点的 API 文本映射改写为标准化表格
    status: completed
  - id: swagger-alignment
    content: 按 seccenter 与 dbres swagger 回填并校验 API 描述字段
    status: completed
  - id: consistency-check
    content: 逐路由检查权限点表格完整性与补充区边界归类
    status: completed
isProject: false
---

# 权限点 API 表格化优化计划

## 1 方案（MVP）

- 目标：将现有“权限点到 API 映射”的文字列表改为“每个权限点一个 API 明细表”，表头固定为 `apiMethod`、`apiUrl`、`description`。
- 数据来源分层：
  - 路由与权限消费关系继续以 `[F:/Documents/Repertory/Sieyuan/nebula/apex_dev/docs/plans/路由-组件-权限点-API 源码梳理.md](F:/Documents/Repertory/Sieyuan/nebula/apex_dev/docs/plans/路由-组件-权限点-API 源码梳理.md)` 现有证据链为主。
  - 接口 `apiMethod/apiUrl/description` 统一回填自 swagger：
    - `[F:/Documents/Repertory/Sieyuan/nebula/docs/api/seccenter.swagger.json](F:/Documents/Repertory/Sieyuan/nebula/docs/api/seccenter.swagger.json)`
    - `[F:/Documents/Repertory/Sieyuan/nebula/docs/api/dbres.json](F:/Documents/Repertory/Sieyuan/nebula/docs/api/dbres.json)`
- 输出位置：
  - 先更新计划约束文档 `[F:/Documents/Repertory/Sieyuan/nebula/apex_dev/docs/plans/路由-组件-权限点-API 源码梳理计划.md](F:/Documents/Repertory/Sieyuan/nebula/apex_dev/docs/plans/路由-组件-权限点-API 源码梳理计划.md)`（定义表格规范与口径）。
  - 再按规范改写主文档 `[F:/Documents/Repertory/Sieyuan/nebula/apex_dev/docs/plans/路由-组件-权限点-API 源码梳理.md](F:/Documents/Repertory/Sieyuan/nebula/apex_dev/docs/plans/路由-组件-权限点-API 源码梳理.md)`。

## 2 实现

- 在计划文档中补充“权限点 API 表格化规范”：
  - 每个权限点下使用二级小节 + Markdown 表格。
  - 表格模板：`| apiMethod | apiUrl | description |`。
  - `apiMethod` 对应接口字段 `apiMethod`；`apiUrl` 对应接口字段 `apiUrl`；`description` 取 Swagger 中接口的人类可读描述文本（中文说明）。
  - 对 `POST {direct|forward}/dbres/...` 这类网关转发路径，不在表格中保留 `direct/forward` 前缀，统一写业务 API 路径（如 `/dbres/project/list`）。
- 在主文档中逐路由改造“权限点到 API 映射”段落：
  - 保留权限点入口说明；将 API 列表替换为表格。
  - 覆盖现有已纳入统计路由：`/Apex/tenant`、`/Apex/system/user`、`/Apex/system/menu`、`/Apex/system/role`、`/Apex/device/deviceTypeList`、`/Apex/device/deviceList`。
- 同步修正接口描述一致性：
  - `seccenter` 与 `dbres` 路径描述均来自各自 swagger 的接口描述文本（如“添加菜单API关联 [ready]”）。
  - 字段取值优先级：优先 `description`，若缺失则取 `summary`；禁止手写改写描述语义。

## 3 自检（类型 / 边界 / 错误处理）

- 类型（结构一致性）
  - 每个权限点都必须含至少 1 行 API 表格数据，且列仅为 `apiMethod/apiUrl/description`。
- 边界（特殊路由与转发）
  - 对“非 `v-hasPerm` 但同页真实调用”的 API，继续放在“补充”区，不混入权限点表格。
  - 对 `direct|forward` 转发 URL，统一映射为业务 API 路径后再回查 swagger；找不到时标记“源码可见、swagger 未收录”。
- 错误处理（证据缺失）
  - 若某 API 在源码存在且 swagger 同时缺失 `description/summary`，描述列降级为“（swagger 未提供接口描述）”。
  - 若同一权限点映射到多个同 URL 不同语义调用，按调用场景拆多行并在描述区区分场景。

