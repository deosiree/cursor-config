# minimal-usage

在已经存在 `showNotification` / `showNotificationError` helper 的前提下，业务代码按下面分流。

## 普通提示

```ts
showNotification("保存成功", { type: "success" });
showNotification("请先选择文件", { type: "warning" });
showNotification("验证码缺失，请重新获取", { type: "error" });
```

## 后端错误

```ts
try {
  await apiCall();
} catch (err) {
  showNotificationError(err, "加载失败");
  throw err;
}
```

## helper 首次接入

如果当前项目里还没有 `showNotificationError`，先看：

- `[[bootstrap-showNotificationError.md]]`

## 禁止的重复提示

```ts
try {
  await gatewayCall();
} catch (err) {
  // gateway 内已经提示过，这里不要再重复通知
  throw err;
}
```
