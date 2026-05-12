# minimal-usage

在已经存在 `showNotification` / 错误提示 helper 的前提下，业务代码按下面分流。

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
  errorNotificationHelper(err, "加载失败");
  throw err;
}
```

这里的 `errorNotificationHelper` 是占位写法：
- 若仓库里已有 `handleApiError`，优先复用 `handleApiError`
- 若仓库里已有 `showNotificationError`，继续沿用
- 只有仓库里不存在等价 helper，才新增 `showNotificationError`

边界提示：
- 若 `request` 或 gateway 已经对同一后端错误提示过，上层不要再重复调用错误提示 helper

## helper 首次接入

如果当前项目里还没有现成错误提示 helper，先看：

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
