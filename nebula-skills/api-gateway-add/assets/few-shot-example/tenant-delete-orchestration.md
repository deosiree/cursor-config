# 租户删除前解绑 — 通则一+二印证样本

**业务域是租户**；规则适用于任意编排场景。对应 `apex_dev` `f734a7b`。源码以 template 为准，本文仅六段骨架。

## 1. 现状链路

- 页面 `handleDelete` → `TenantGateway.deleteV2` → `TenantAPI.deleteV2`
- 无设备解绑编排；`DeviceGateway` 与 `TenantGateway` 存在静态互相引用风险

## 2. 最小改动边界

- gateway + 业务确认文案；不新增 swagger 接口

## 3. 四层改动清单

| 层 | 改动 |
|----|------|
| api | 无 |
| types | 无 |
| gateway | `unbindAllByTenantId`、`deleteV2` 编排、原子 `handleGatewayError`、dynamic import |
| business | 删除确认框文案 |

## 4. 稳定命名与字段来源

- 设备 id 来自 `getBind` 列表 `list[].id`
- 解绑 payload 对齐 `BindDeviceDialog`（`tenantId` + `deactivateDeviceIds`）

## 5. 风险点与不做项

- 不在 `unbindAllByTenantId` / 整段 `deleteV2` 外再包 `handleGatewayError`
- 不在页面串联三个 gateway 调用
- **部分成功**：解绑成功但删除失败 → 租户仍在、设备已解绑；提示「删除租户失败」并刷新；默认不自动回绑

## 6. 可执行 todolist

1. `DeviceGateway`：原子层错误处理 + `unbindAllByTenantId`
2. `TenantGateway.deleteV2`：先 unbind 再 delete
3. 移除跨 gateway 顶层静态 import，改方法内 dynamic import
4. 更新 `index.vue` 确认文案
5. 按验证清单回归删除/批量删除/解绑失败路径
