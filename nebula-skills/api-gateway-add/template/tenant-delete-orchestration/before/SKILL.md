---
name: tenant-delete-orchestration-before
description: 租户删除前未解绑设备的 gateway 真实基线（f734a7b^）。
---

# RED：租户删除链路基线

## 业务诉求

删除租户时，用户应知晓会解绑设备；网关层尚未在删除前解绑，行为与文案可能不一致。

## 现状链路

1. **业务层** `src/views/tenant/index.vue`：`handleDelete` 直接 `TenantGateway.deleteV2`。
2. **租户网关** `deleteV2`：仅 `TenantAPI.deleteV2`，无设备域编排。
3. **设备网关**：无 `unbindAllByTenantId`；`getBind` / `deviceActivate` 直连 `DeviceAPI`，无 `handleGatewayError`。
4. **跨 Gateway**：`device.gateway.ts` 顶层静态 `import TenantGateway`；`tenant.gateway.ts` 顶层静态 `import ProjectGateway`。

## 失败基线（设计前应识别）

| 问题 | 落点 |
|------|------|
| 删除租户未先解绑设备 | `tenant.gateway.ts` `deleteV2` |
| 集成与原子错误处理未分层 | 尚无集成方法；原子未统一 `handleGatewayError` |
| 跨 Gateway 静态 import 易成环 | `device.gateway.ts` L7、`tenant.gateway.ts` L34 |

## 对照源码（本目录）

- `src/gateway/device/device.gateway.ts`
- `src/gateway/system/tenant/tenant.gateway.ts`
- `src/views/tenant/index.vue`（确认框约 L994）

下一步：阅读 `[[../after/SKILL.md]]` 与 after 同源路径文件。
