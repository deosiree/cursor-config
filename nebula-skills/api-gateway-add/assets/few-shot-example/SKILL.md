---
name: 新增 API 分层接入 few-shot
description: 给 agent 示例：纯新增接口设计骨架 + 网关编排真实样本索引。
---

# 案例 1：纯新增接口（结构示意）

## 示例输入

使用 $api-gateway-add 为菜单功能项新增 3 个写接口，读链路保持不动，只替换右侧 API 子项的新增、编辑、删除。

## 示例输出骨架

1. 现状链路
- 当前读链路继续使用聚合 `apis[]`
- 写链路仍通过整节点更新间接修改子资源

2. 最小改动边界
- 只切右侧 API 子项写链路
- 不改读链路和初始化逻辑

3. 四层改动
- `api`：新增 3 个原始接口和对应原始类型
- `types`：补稳定类型中的 `id`、`menuId`
- `gateway`：新增 `addFunctionApi/updateFunctionApi/deleteFunctionApi`
- `business`：替换右侧表格的提交函数

4. 字段来源
- `id` 来自新增接口返回体
- `menuId` 来自当前页面节点上下文

结构参考：`[[../../template/menu-function-api-add/]]`

---

# 案例 2：网关编排（真实源码样本）

## 示例输入

删除租户前需解绑该租户全部设备，业务仍只调 `TenantGateway.deleteV2`；避免 `handleGatewayError` 重复通知与 gateway 环依赖。

## 示例输出骨架

1. 现状链路
- `deleteV2` 仅删租户；设备未在网关层批量解绑
- 见 `template/tenant-delete-orchestration/before`

2. 最小改动边界
- 不改契约新增接口；编排既有 `getBind` + `deviceActivate` + `deleteV2`
- 业务层仅对齐确认文案

3. 四层改动
- `api` / `types`：无
- `gateway`：新增集成 `unbindAllByTenantId`；改造 `deleteV2`；原子方法补 `handleGatewayError`；跨 Gateway 动态 import
- `business`：`index.vue` 删除确认文案

4. 风险点
- 集成方法禁止再包 `handleGatewayError`
- 静态 `import` 其它 gateway 易成环

5. todolist
- 先读通则一：`references/gateway-atomic-vs-integration.md` 与 `feature-skills/网关原子与集成错误分层`
- 对照 `template/tenant-delete-orchestration/after` 三文件实施（印证样本，非专用逻辑）

---

# 案例 3：通则一（非租户域）

菜单多项目批量导出：见 `[[gateway-patterns-green.md]]`

完整源码 diff：`[[../../template/tenant-delete-orchestration/]]`（`f734a7b^` → `f734a7b`）。

设计成品说明（可选）：`[[tenant-delete-orchestration.md]]`
