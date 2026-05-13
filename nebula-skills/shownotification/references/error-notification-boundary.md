# error-notification-boundary

## 目的

解释为什么后端错误应统一走“错误提示 helper”，而不是每层都自己 `showNotification("失败", { type: "error" })`。

## 边界原则

- request 层适合处理协议级、HTTP 级、网络级错误
- gateway 层适合处理领域内可归类的错误
- view 层适合处理本地前置校验、成功提示与纯前端状态提示

## 关键规则

- 如果下层已经对同一个后端错误提示并继续抛错，上层不要再重复提示
- view 层不要手写后端错误文案；优先消费下层已经收口的异常链路
- 统一使用错误提示 helper 可以把 `[code]message` 的展示逻辑收在一个地方
- 若仓库里已有等价 helper，例如 `handleApiError`，
  优先复用现成 helper，而不是机械新增 `showNotificationError`
- gateway 上收场景同样适用这条规则：
  优先复用现成 helper，再视需要包装成 `handleGatewayError(() => action(), "...")`

## 状态错误与业务错误的进一步拆层

当一个仓库里已经出现 request / gateway 对同一错误重复通知时，只靠“统一错误提示 helper”还不够，通常还要继续拆成两类错误：

- HTTP 状态错误：`status != 200`
- 业务错误：`status == 200 && code != 0`

推荐边界：

- request 处理协议错误、网络错误、HTTP 状态错误
- gateway 处理业务错误
- view 只处理本地前置校验、成功提示和异常控制流

如果已经进入这条模式：

- `handleStatusError` 负责 `status != 200`
- `handleApiError` 负责 `status == 200 && code != 0`
- 不要再让 `handleApiError` 同时承接 HTTP 状态错误

## 联动提示

如果 request 已经用 `handleStatusError` 处理 `status != 200`，
那么 gateway 包装器就不应该再对所有错误统一调用 `handleApiError`。

正确联动应该是：

- request 先把 HTTP 错误收口
- request 在 `code != 0` 时抛出结构化业务错误对象
- gateway 只消费这类结构化业务错误

这样可以把“重复弹窗”问题收敛为边界治理，而不是在 helper 内做黑盒去重。

## 最小示例

```ts
function resolvePasswordForTransit(...) {
  try {
    ...
  } catch (err) {
    errorNotificationHelper(err, "密码加密失败");
    throw err;
  }
}
```

调用方此时只消费异常阻断，不再二次提示。
