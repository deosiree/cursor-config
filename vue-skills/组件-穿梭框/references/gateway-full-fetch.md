# gateway 全量拉取（fetchAllDevicePages）

设备域样本：[`template/after/src/gateway/device/device.gateway.ts`](../template/after/src/gateway/device/device.gateway.ts)

## 反模式（before）

```ts
DeviceAPI.get({ page: 1, pageSize: 999999, ... })
```

## 成品模式（after）

1. 常量 `PAGE_SIZE_MAX = 50`（[`pagination.ts`](../template/after/src/constants/pagination.ts)）
2. 先请求第 1 页拿 `pagination.totalPages` / `totalCount`
3. 第 2～N 页 `Promise.all` 并行
4. 单页失败：`concurApiErr(lock, error, msg)`，不阻断其余页（[`notification.ts`](../template/after/src/utils/notification.ts)）

## 业务 gateway 暴露

```ts
getBind(tenantId?, scope?): Promise<{ list: DeviceForm[]; total: number }>
getUnbind(): Promise<{ list: DeviceForm[]; total: number }>
```

页面只消费 `{ list, total }`，**不在 view 层拼分页**。

## 与集成 gateway 边界

- `fetchAllDevicePages` 为设备域内部 helper；集成方法若编排多 API，遵循 [`api-gateway-add`](../../nebula-skills/api-gateway-add/SKILL.md) 通则
- 单页场景用 `getBindPage`（角色列表分页等），不走全量合并

## 返回 total 用途

- 业务逻辑 / 日志可用 `res.total`
- Transfer 标题 **不必** 展示 `(total)`（BindDeviceDialog after HEAD 已去掉）
