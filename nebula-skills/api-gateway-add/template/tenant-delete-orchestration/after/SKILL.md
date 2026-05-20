---
name: tenant-delete-orchestration-after
description: 租户删除前先解绑全部设备的 gateway 真实成品（f734a7b）。
---

# GREEN：租户删除 + 解绑编排

## 最小改动边界

- **gateway**：设备域新增集成方法；租户 `deleteV2` 编排解绑；原子方法补 `handleGatewayError`；跨 Gateway 改动态 import。
- **api/types**：无新增契约接口（复用既有 `DeviceAPI.get` / `deviceActivate`、`TenantAPI.deleteV2`）。
- **business**：仅对齐删除确认文案；仍只调用 `TenantGateway.deleteV2`。

## 四层改动清单

| 层 | 改动 |
|----|------|
| api | 无 |
| types | 无 |
| gateway | 见下表 |
| business | `index.vue` 确认文案 |

## gateway 改动要点

| 方法 | 类型 | 要点 |
|------|------|------|
| `DeviceGateway.getBind` | 原子 | `handleGatewayError` 包裹 `DeviceAPI.get` |
| `DeviceGateway.deviceActivate` | 原子 | `handleGatewayError` 包裹 `DeviceAPI.deviceActivate` |
| `DeviceGateway.unbindAllByTenantId` | **集成** | `getBind` → 收集 id → `deviceActivate` 解绑；**不**包 `handleGatewayError` |
| `TenantGateway.deleteV2` | **集成** | 动态 import `DeviceGateway` → `unbindAllByTenantId` → 仅删除步骤 `handleGatewayError` |
| `getDeviceDetailStableByRow` | — | `TenantGateway` 改方法内动态 import |
| `createV2` / `assignProjectsV2` | — | `ProjectGateway` 改方法内动态 import |

## 错误通知分层（本案例）

- 解绑失败：由 `getBind` 或 `deviceActivate` 的原子层各弹 **一次**。
- 删除失败：仅 `TenantAPI.deleteV2` 外包的一层「删除租户失败」。
- `unbindAllByTenantId` / `deleteV2` 编排段 **禁止**再包 `handleGatewayError`。

细则（通则一印证）：`[[../../references/gateway-atomic-vs-integration.md]]`、`[[../../feature-skills/网关原子与集成错误分层/SKILL.md]]`

## 跨 Gateway 动态 import

见 `device.gateway.ts`（`getDeviceDetailStableByRow`、`deleteV2` 侧消费）与 `tenant.gateway.ts`（`createV2`、`assignProjectsV2`、`deleteV2`）。

细则：`[[../../feature-skills/跨Gateway动态引用/SKILL.md]]`

## 对照源码（本目录）

与 before 同路径三文件；diff 以 git `f734a7b^..f734a7b` 为准。
