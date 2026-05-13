# business-error-tagging-protocol

## 目的
解释为什么 `status == 200 && code != 0` 的业务错误，不应该继续沿用普通 HTTP 错误语义，而应显式封装为结构化业务错误并交给 gateway 层统一处理。

## 为什么需要这个协议

如果 request 已经处理了 `status != 200`，但 `code != 0` 仍然只是：

- `throw new Error(message)`
- 或让 gateway 对所有 `catch` 到的错误统一 `handleApiError`

就会出现两个问题：

1. gateway 无法稳定区分“HTTP 状态错误”与“业务错误”
2. request 已经处理过的状态错误，可能再次被 gateway 统一提示，形成重复弹窗

所以这里需要一个显式协议，而不是继续靠 `message`、`status` 或调用位置猜错误类型。

## 推荐错误形态

```ts
return Promise.reject({
  type: "business",
  error: new Error(message || "Business Error"),
  response,
});
```

关键点：

- `type === "business"` 是 request 与 gateway 的联动协议
- `error` 用来承接已有错误语义
- `response` 保留后端 `code/message/data`

## gateway 侧联动

```ts
export async function handleGatewayError<T>(action: () => Promise<T>, defaultMsg = "操作失败") {
  try {
    return await action();
  } catch (error) {
    if ((error as any)?.type === "business") {
      handleApiError(error, defaultMsg);
    }
    throw error;
  }
}
```

这条联动的核心不是 `handleGatewayError` 这个名字，而是：

- gateway 只消费结构化业务错误
- HTTP 状态错误不再进入 gateway 统一提示

## 边界结论

- request 负责 `status != 200` 的状态错误
- request 负责把 `code != 0` 包装成结构化业务错误
- gateway 只消费 `type === "business"`
- view 不再对已经被下层处理过的后端错误重复提示

## 不推荐写法

```ts
catch (error) {
  handleApiError(error, "操作失败");
  throw error;
}
```

这类“对所有错误无差别提示”的网关包装，在 request 已经处理过状态错误时会重新提示同一个错误。

## 这个协议不解决什么

- 不讨论全局自动去重
- 不讨论 i18n 注入
- 不讨论日志、埋点、监控
- 不要求把所有错误都升级成完整枚举体系

它只解决一件事：让 `status == 200 && code != 0` 的业务错误，能稳定进入 gateway 层，而不会和 HTTP 状态错误混流。
