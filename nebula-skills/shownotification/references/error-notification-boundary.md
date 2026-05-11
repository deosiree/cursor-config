# error-notification-boundary

## 目的
解释为什么后端错误应统一走 `showNotificationError(err, fallbackMessage)`，而不是每层都自己 `showNotification("失败", { type: "error" })`。

## 边界原则
- request 层适合处理协议级、HTTP 级、网络级错误
- gateway 层适合处理领域内可归类的错误
- view 层适合处理本地前置校验、成功提示与纯前端状态提示

## 关键规则
- 如果下层已经对同一个后端错误提示并继续抛错，上层不要再重复提示
- view 层不要手写后端错误文案；优先消费下层已经收口的异常链路
- 统一使用 `showNotificationError` 可以把 `[code]message` 的展示逻辑收在一个地方

## 最小示例

```ts
function resolvePasswordForTransit(...) {
  try {
    ...
  } catch (err) {
    showNotificationError(err, "密码加密失败");
    throw err;
  }
}
```

调用方此时只消费异常阻断，不再二次提示。
