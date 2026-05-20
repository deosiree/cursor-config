---
name: 网关原子与集成错误分层
description: 跨模块通则：仅原子 gateway 使用 handleGatewayError；集成 gateway 不包整段；集成内调其它 gateway 原子方法不再套一层；集成内直接调 api 须下沉为原子。租户删除、菜单导出等均适用。
---

# 网关原子与集成错误分层

## 何时使用

- 任意模块需**编排**多个 gateway 或 api（删除前解绑、多项目导出、先查后写等）
- 需判定 `handleGatewayError` 应落在哪一层
- 担心嵌套 gateway 导致**多次**错误 toast

## 权威细则

`[[../../references/gateway-atomic-vs-integration.md]]`（通则一全文）

## 执行要点

1. 输出 GREEN 前，为每个 gateway 新方法标 **原子 / 集成**。
2. 集成方法：`await` 子 gateway 原子方法，**不**包 `handleGatewayError`。
3. 集成方法内若出现 `XxxAPI.` 直接调用 → **抽原子 gateway** 再编排。
4. 集成方法若最后一步是**单次** `TenantAPI.deleteV2` 等 → **仅该调用**包 `handleGatewayError`。

## 人类检查点

- 不可逆写操作须写清顺序（如先解绑再删租户），**等用户确认**再编码。
- 仅要方案时停在 todolist。

## 部分成功态

多步写操作见 `[[../../references/gateway-orchestration.md]]` §5。

## 印证样本（非本 skill 专属业务）

| 场景 | 路径 |
|------|------|
| 删除+解绑 | `[[../../template/tenant-delete-orchestration/]]` |
| 单接口导出 | 仓库内 `MenuGateway.exportMenuTree`（原子） |
| 多项目循环导出 | GREEN 设计态：集成 `exportMenuTreesByProjectIds` 循环调原子 `exportMenuTree` |
