# MVP Sample 05

## 标题
用 `handleStatusError` 把 HTTP 状态错误从 `handleApiError` 中拆出去

## 适用场景
- request 已经在处理 `401/403/500` 一类状态错误
- gateway 或 view 仍可能对同一个 HTTP 错误继续提示
- `handleApiError` 同时承接 HTTP 错误和业务错误，边界开始变脏

## 历史来源
- staged changes from `apex_dev`
- 关键文件：
  - `src/utils/request.ts`
  - `src/utils/notification.ts`

## 说明
这个样本只聚焦一件事：

- `status != 200` 应该由 request 层统一处理

它不讨论 `type === "business"` 的联动协议。那部分请看 `sample-06`。

## 先看这个
先消费这组最小结论，再决定是否下钻 before/after：

```ts
export function handleStatusError(error: any, defaultMsg = "操作失败") {
  const code = error?.response?.data?.code;
  const message =
    error?.response?.data?.message ??
    error?.response?.data?.msg ??
    error?.message ??
    defaultMsg;

  showNotification(code ? `[${code}]${message}` : message, { type: "error" });
}
```

```ts
if ([400, 401, 403, 500].includes(status)) {
  if (status === 401) {
    handleStatusError(error, errorMessage);
    await redirectToLogin();
    return Promise.reject(error);
  }

  handleStatusError(error, errorMessage);
  return Promise.reject(error);
}
```

## before

### `src/utils/request.ts`

```ts
if ([400, 401, 403, 500].includes(status)) {
  if (status === 401) {
    await redirectToLogin(errorMessage, error);
    return Promise.reject(error);
  }

  handleApiError(error, errorMessage);
  return Promise.reject(error);
}
```

## after

### `src/utils/notification.ts`

```ts
export function handleStatusError(error: any, defaultMsg = "操作失败") {
  const code = error?.response?.data?.code;
  const message =
    error?.response?.data?.message ??
    error?.response?.data?.msg ??
    error?.message ??
    defaultMsg;

  showNotification(code ? `[${code}]${message}` : message, { type: "error" });
}
```

### `src/utils/request.ts`

```ts
if ([400, 401, 403, 500].includes(status)) {
  if (status === 401) {
    handleStatusError(error, errorMessage);
    await redirectToLogin();
    return Promise.reject(error);
  }

  handleStatusError(error, errorMessage);
  return Promise.reject(error);
}
```

## 修改要点
- `handleStatusError` 作为公共 helper 暴露在 `notification.ts`
- request 继续负责 `status != 200` 的通用错误
- `redirectToLogin` 只保留清理状态和跳转职责
- 不再让 `handleApiError` 承接 HTTP 状态错误
- 重复通知优先通过边界拆分解决，而不是靠去重标记

## 这个样本证明什么
- `handleStatusError` 适合承接 HTTP 状态错误
- request 是处理 `status != 200` 的合适边界
- 401 提示与登录跳转可以拆成“先提示、再跳转”的清晰职责

## 这个样本不证明什么
- 不证明业务错误也应该走 `handleStatusError`
- 不讨论 `type === "business"` 的结构化协议
- 不讨论并发 401 自动去重
