# bootstrap-showNotificationError

## 适用场景
- 当前微服务里还没有 `showNotificationError`
- 你要第一次接入“后端错误统一展示 `[code]message`”
- 你不想先翻历史仓库，只想知道最小 helper 应该长什么样

## 最小模板

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

export function showNotificationError(err: any, fallbackMessage?: string) {
  const message = err?.error?.message ?? err?.message ?? fallbackMessage ?? "操作失败";
  const code = err?.error?.code ? `[${err.error.code}]` : "";
  showNotification(code + message, { type: "error" });
}
```

## 接入顺序
1. 先补 `showNotificationError`
2. 再把手写 `[code]message` 拼接迁到这个 helper
3. 最后把调用方的后端错误分支统一改成 `showNotificationError(err, "...")`

## 最小调用示例

```ts
try {
  await apiCall();
} catch (err) {
  showNotificationError(err, "加载失败");
  throw err;
}
```

## 不要做的事
- 不要在业务代码里继续手写 `[code]message`
- 不要把 `t(...)` 包进这个 skill 的推荐模板
- 不要让 helper、gateway、view 对同一错误重复提示
