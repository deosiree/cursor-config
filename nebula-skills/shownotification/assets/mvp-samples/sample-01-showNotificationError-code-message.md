# MVP Sample 01

## 标题
引入 `showNotificationError`，统一 `[code]message` 展示

## 适用场景
- 项目里还没有统一的后端错误通知入口
- request / 页面还在手写错误提示
- 希望所有来自后端的报错都显示 `[code]message`

## 历史版本
- before: `f8dd32018bc312458df8fd47768a7e9d7bd415bd^`
- after: `f8dd32018bc312458df8fd47768a7e9d7bd415bd`

## 说明
以下片段直接摘自 `microfb` 历史提交，只做了最小裁剪。
原 commit 里还有 i18n 改动，但不属于本 skill 的职责，本文不展开。

如果你不是在做“历史回填”，而是在给新项目第一次接入 `showNotificationError`，
请先看 `[[../examples/bootstrap-showNotificationError.md]]`，再回来看这个样本。

## 先看这个
按本 skill 的职责收口，先消费这版不包 `t()` 的推荐写法，再决定是否下钻真实历史：

```ts
catch (error) {
  showNotificationError(error, "验证失败，请重试");
}
```

只有当你需要回答“这个规范在真实项目里是怎么从 before 改到 after 的”时，
再继续看下面的历史真实片段。

## 只关注的最小片段
- `src/utils/notification.ts`
  新增 `showNotificationError(err, fallbackMessage)`
- `src/utils/request.ts`
  后端错误展示 `[code]message`
- `src/views/login/components/VerifyTwoFactor.vue`
  页面 catch 改为消费 `showNotificationError(error, "...")`

## 历史真实片段：before

### `src/utils/notification.ts`

```ts
export function showNotification(message: string, option?: Partial<NotificationOptions>) {
  const defaultOptions: Partial<NotificationOptions> = {
    position: "bottom-right",
    duration: 3000,
  };

  const finalOptions: NotificationOptions = {
    ...defaultOptions,
    ...option,
    message,
  } as NotificationOptions;

  ElNotification(finalOptions);
}
```

### `src/utils/request.ts`

```ts
if (status !== 200) {
  const errorMessage = data?.message || `请求失败，状态码：${status}`;
  showNotification(errorMessage, { type: "error" });
  return Promise.reject(new Error(errorMessage));
}
```

### `src/views/login/components/VerifyTwoFactor.vue`

```ts
catch (error) {
  const errorMessage = error instanceof Error ? error.message : t("验证失败，请重试");
  showNotification(errorMessage, { type: "error" });
}
```

## 历史真实片段：after

### 历史真实片段

### `src/utils/notification.ts`

```ts
export function showNotificationError(err: any, fallbackMessage?: string) {
  const code = err?.error?.code ?? err?.response?.data?.code;
  const msg =
    err?.error?.message ??
    err?.response?.data?.message ??
    err?.message ??
    fallbackMessage ??
    "操作失败";

  showNotification(code ? `[${code}]${msg}` : msg, { type: "error" });
}
```

### `src/utils/request.ts`

```ts
if (status !== 200) {
  const errorMessage = data?.message || t("请求失败，状态码") + `: ${status}`;
  const errorCode = data?.code ? `[${data.code}]` : "";
  showNotification(errorCode + errorMessage, { type: "error" });
  return Promise.reject(new Error(errorMessage));
}
```

### `src/views/login/components/VerifyTwoFactor.vue`

```ts
catch (error) {
  showNotificationError(error, t("验证失败，请重试"));
}
```

## 为什么这里仍保留 `t(...)`
上面是历史真实代码，保留它是为了证明这个 commit 确实这样改过。
但本 skill 自己的推荐写法，以上面的“先看这个”为准。

## 修改要点
- 先新增统一的后端错误入口 `showNotificationError`
- 再把 request 层的 `[code]message` 展示逻辑收口
- 页面层不再自己判断 `Error` 或拼消息，直接消费统一入口
- helper 至少兼容 `err.error.*` 与 `err.response.data.*`

## 这个样本证明什么
- `showNotificationError` 是新增型模板能力
- `[code]message` 的展示逻辑应收口到统一入口
- 页面不应再手写后端错误拼接

## 不属于本样本范围
- 同一 commit 中与 i18n 相关的改动
- `t(...)` 包装
- 全局纯函数接翻译注入
