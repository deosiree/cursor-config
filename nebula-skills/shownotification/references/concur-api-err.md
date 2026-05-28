# concur-api-err（并发 HTTP 错误通知）

## 目标

同一 gateway 流程内多路并行 HTTP 失败时：

- **每条失败**都打 `console.error(errMsg, error)`，便于按页/按路排查
- **整批**只对 `type === "business"` 弹 **一次** toast（经 `handleApiError`）

## 实现位置（apex_dev）

- `src/utils/notification.ts`：`ConcurErrLock`、`newConcurLock`、`concurApiErr`
- 参考用法：`src/gateway/device/device.gateway.ts` → `fetchAllDevicePages`

## API

```ts
export interface ConcurErrLock {
  notified: boolean;
}

export function newConcurLock(): ConcurErrLock;

export function concurApiErr(
  lock: ConcurErrLock,
  error: unknown,
  errMsg = "操作失败"
): void;
```

执行顺序：

1. `console.error(errMsg, error)`
2. 若 `lock.notified` 或 `error.type !== "business"` → 返回
3. `lock.notified = true`
4. `handleApiError(error, errMsg)`

## 为何不用 `let lock = false`

JavaScript 中 boolean 按值传递。`concurApiErr(false, error)` 内置无法把外层 `lock` 置为 `true`，并行 `.catch` 会重复 toast。

对象锁传的是引用，所有 `.catch` 共享 `notified` 状态。

## 与 handleGatewayError / handleApiError

| Helper | 适用 |
|--------|------|
| `handleGatewayError` | 单次 `await` 包一层，失败提示一次 |
| `handleApiError` | 单次业务错误展示 `[code]message` |
| `concurApiErr` | 同批次多路失败，console 多条、toast 一次 |

集成 gateway 内若并行调多个原子 API，用 `concurApiErr`，**禁止**每路 `handleGatewayError`。

## 标准模式

### 第 1 页（常决定 totalPages）

- `try/catch` 包住
- `concurApiErr` 后 **仍 `throw`**，以便 view / 调用方感知全失败

### 第 2～N 页（Promise.all 并行）

- `.catch` 内 `concurApiErr`，然后 `return null`（或等价占位）
- 合并已成功页数据，部分失败不阻断整批

### 页码文案

`let page = 1` 起，统一模板 `` `加载设备列表第 ${n} 页失败:` ``，避免单独维护「第 1 页」i18n 键。

## 反模式

| 写法 | 问题 |
|------|------|
| 每路 `handleGatewayError(() => api())` | N 路 N 次 toast |
| 内层 `concurApiErr` + 外层 `handleGatewayError` 包同批 | 首页失败可能双 toast |
| `.catch` 只 `console.error` | 无用户提示 |
| 自建 `let notified = false` 传 boolean | 锁无效 |
| 在通用错误 helper 内黑盒去重 | 应显式 `newConcurLock` |

## 功能入口

可执行 checklist：`[[../feature-skills/并发HTTP错误通知/SKILL.md]]`

历史样本：`[[../assets/mvp-samples/sample-07-concur-api-err-device-pagination.md]]`
