# MVP Sample 06

## 标题
把 `code != 0` 封装为 `type === "business"`，再由 `handleGatewayError` 消费

## 适用场景
- request 已经把 `status != 200` 的错误单独处理
- `status == 200 && code != 0` 仍缺少稳定错误类型协议
- gateway 现在还在对所有错误无差别 `handleApiError`

## 历史来源
- staged changes from `apex_dev`
- 关键文件：
  - `src/utils/request.ts`
  - `src/utils/notification.ts`

## 说明
这个样本只聚焦一件事：

- `status == 200 && code != 0` 的业务错误，如何稳定进入 gateway 层

它不讨论 `handleStatusError` 的具体实现。那部分请看 `sample-05`。

## 先看这个
先消费这组最小结论，再决定是否下钻 before/after：

```ts
return Promise.reject({
  type: "business",
  error: new Error(message || "Business Error"),
  response,
});
```

```ts
if ((error as any)?.type === "business") {
  handleApiError(error, defaultMsg);
}
```

## before

### `src/utils/notification.ts`

```ts
export async function handleGatewayError<T>(action: () => Promise<T>, defaultMsg = "操作失败") {
  try {
    return await action();
  } catch (error) {
    handleApiError(error, defaultMsg);
    throw error;
  }
}
```

### `src/utils/request.ts`

```ts
if (response.data.code !== 0) {
  return Promise.reject(new Error(response.data.message || "Business Error"));
}
```

## after

### `src/utils/request.ts`

```ts
if (response.data.code !== 0) {
  return Promise.reject({
    type: "business",
    error: new Error(response.data.message || "Business Error"),
    response,
  });
}
```

### `src/utils/notification.ts`

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

## 修改要点
- request 显式声明“这是业务错误”，而不是继续裸抛普通错误
- gateway 不再对所有错误无差别提示
- `type === "business"` 是 request / gateway 的联动协议
- `code != 0` 的业务错误不再混入 HTTP 状态错误链路

## 这个样本证明什么
- `type === "business"` 是一个足够小而稳定的联动协议
- gateway 只消费业务错误，可以避免 request 已处理错误被再次提示
- 结构化错误对象比继续猜 `status/message` 更稳定

## 这个样本不证明什么
- 不要求所有项目都必须用这个字符串字面量
- 不要求把错误体系扩展成完整枚举系统
- 不讨论 `handleStatusError` 的具体实现细节
