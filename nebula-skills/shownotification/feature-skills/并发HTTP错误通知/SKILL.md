---
name: 并发HTTP错误通知
description: >-
  nebula gateway 内在同一方法中并行/分页发起多路 HTTP（Promise.all、分页拉全量、
  多路 catch 后合并）时，使用 notification.ts 的 newConcurLock + concurApiErr：
  每路 console.error，business 错误整批只 toast 一次。触发词：concurApiErr、
  newConcurLock、ConcurErrLock、并发 HTTP、Promise.all、分页拉全量、并行 gateway、
  多页失败只弹一次、fetchAllDevicePages。
---

# 并发 HTTP 错误通知

## 何时进入本 feature

命中 **任一** 即读本文（不要只读父级 `shownotification` 规则 4 摘要）：

- gateway 同一方法内多次调用 `XxxAPI.*`，且存在 `Promise.all` 或循环并行
- 分页拉全量：先请求第 1 页拿 `totalPages`，再并行拉第 2～N 页
- 部分页失败仍合并成功页数据（`.catch` 后 `return null`）

**不要**在本场景对每路请求包 `handleGatewayError(() => api())`。

## 标准写法

实现落点：`src/utils/notification.ts`（`newConcurLock`、`concurApiErr`）。

```ts
import { concurApiErr, newConcurLock } from "@/utils/notification";

const lock = newConcurLock();
let page = 1;

try {
  const firstRes = await XxxAPI.list({ pagination: { page, pageSize } });
  // ...
} catch (error) {
  concurApiErr(lock, error, `加载设备列表第 ${page} 页失败:`);
  throw error; // 首页全失败：调用方仍需感知
}

const promises = Array.from({ length: totalPages - 1 }, (_, index) => {
  const curPage = page + index + 1;
  return XxxAPI.list({ pagination: { page: curPage, pageSize } }).catch((error) => {
    concurApiErr(lock, error, `加载设备列表第 ${curPage} 页失败:`);
    return null; // 部分成功：不 throw
  });
});
await Promise.all(promises);
```

### API 约定

```ts
concurApiErr(lock, error, errMsg = "操作失败");
```

- `errMsg`：同时作为 `console.error` 第一参数与 `handleApiError` 兜底文案
- 仅 `error.type === "business"` 会弹 toast，且同一把 `lock` 只弹 **一次**
- 先 `lock.notified = true` 再 `handleApiError`，降低并行双 toast

### 锁为何是对象

`let notified = false` 传参无法被 `concurApiErr` 回写。须 `newConcurLock()` 或 `{ notified: false }` 共享引用。详见 `[[../../references/concur-api-err.md]]`。

## 禁止项

- 每路 `handleGatewayError(() => XxxAPI.get(...))`（N 路 N 次 toast）
- 内层已 `concurApiErr`，外层再 `handleGatewayError` 包同一批次（如 `getBind` 包 `fetchAllDevicePages`）
- `.catch` 仅 `console.error`、无 `concurApiErr`（用户无 toast）
- 在 `showNotificationError` 等通用 helper 内另做黑盒去重（应显式用 `concurApiErr`）

## 与 handleGatewayError 分工

| 场景 | 用法 |
|------|------|
| 单次原子 gateway 方法 | `handleGatewayError(() => api(), "操作失败")` |
| 同方法内多路并行/分页 | `newConcurLock` + 每路 `concurApiErr` |

## 与 role-group 内联锁

`role-group.gateway` 中 `businessErrorNotified` + `handleApiError` 与 `concurApiErr` 语义相同。新代码统一 `concurApiErr`；迁移旧内联锁时读本 feature。

## 真实样本

- 源码：`apex_dev/src/gateway/device/device.gateway.ts` → `fetchAllDevicePages`
- 单测：`apex_dev/src/gateway/__tests__/device.gateway.test.ts`
- MVP：`[[../../assets/mvp-samples/sample-07-concur-api-err-device-pagination.md]]`
- 细则：`[[../../references/concur-api-err.md]]`

## 验收

- 多页 business 失败：`handleApiError` / toast **1 次**，`console.error` **每失败页 1 次**
- 非 business 失败：无 toast，可有 console
- 无 `opts` / `logMsg` 旧 API；签名为 `(lock, error, errMsg?)`
