# MVP Sample 07

## 标题

分页并行拉设备列表：并发 business 错误只 toast 一次（concurApiErr）

## 适用场景

- gateway 内 `Promise.all` 拉多页数据并合并
- 部分页失败仍返回已合并的 `list`
- 需要每页 `console.error`，但 UI 只弹一次错误通知

## feature-skill 入口

本样本对应：`[[../../feature-skills/并发HTTP错误通知/SKILL.md]]`

## 历史来源

- `apex_dev`：`src/utils/notification.ts`、`src/gateway/device/device.gateway.ts`
- 单测：`src/gateway/__tests__/device.gateway.test.ts`

## 先看这个

```ts
import { concurApiErr, newConcurLock } from "@/utils/notification";

const lock = newConcurLock();
let page = 1;

try {
  firstRes = await DeviceAPI.get({
    ...baseQuery,
    pagination: { page, pageSize: PAGE_SIZE_MAX },
  });
} catch (error) {
  concurApiErr(lock, error, `加载设备列表第 ${page} 页失败:`);
  throw error;
}

// 第 2～N 页并行
const pagePromises = Array.from({ length: totalPages - 1 }, (_, index) => {
  const curPage = page + index + 1;
  return DeviceAPI.get({
    ...baseQuery,
    pagination: { page: curPage, pageSize: PAGE_SIZE_MAX },
  }).catch((error) => {
    concurApiErr(lock, error, `加载设备列表第 ${curPage} 页失败:`);
    return null;
  });
});
```

要点：

- `getBind` / `getUnbind` **不再**外包 `handleGatewayError(fetchAllDevicePages)`
- `concurApiErr(lock, error, errMsg)` 三参数；`errMsg` 默认「操作失败」

## before（反模式）

```ts
// 并行页：只 console，无 toast
.catch((error) => {
  console.error(`加载设备列表第 ${page} 页失败:`, error);
  return null;
});

// 或：每路 handleGatewayError → N 次 toast
return handleGatewayError(() => DeviceAPI.get({ ... }), "加载失败");
```

## after（现网）

- 批次前 `newConcurLock()`
- 每路失败 `concurApiErr(lock, error, \`加载设备列表第 ${n} 页失败:\`)`
- business 错误：toast 1 次；console 按失败页数多条

## 测试锚点

- `totalPages: 10`，仅第 3、8 页 business 失败 → `handleApiError` **1 次**，`console.error` **2 次**
- 第 1 页失败 → `handleApiError` 1 次后 **rethrow**
- 非 business → 无 `handleApiError`，可有 console

## 可选后续

- `role-group.gateway` 内联 `businessErrorNotified` 可迁移为 `concurApiErr`（需补 `logMsg` 式 `errMsg`）
