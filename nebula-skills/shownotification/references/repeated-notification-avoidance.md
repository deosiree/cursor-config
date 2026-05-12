# repeated-notification-avoidance

## 目标
避免同一后端错误在 helper / gateway / view 多层 catch 中被重复弹出。

## 常见重复链路
- helper 内 `showNotificationError(err, "...")` 后 `throw`
- gateway 外层 `catch` 再 `showNotificationError(err, "...")`
- 页面层又 `catch` 一次并提示

## 处理规则
- 谁最了解该错误语义，谁负责提示
- 下层已经提示并继续抛错时，上层只负责阻断流程，不再重复提示
- view 层只处理本地校验与成功提示；后端错误优先交给 request / gateway
- 默认先做“边界去重”，不默认在 `notification.ts` 内加入“已弹过标记”
- 只有当仓库确实无法通过 request / gateway / view 边界消重时，才考虑额外机制；这属于例外方案，不写入默认模板

## 最小示例

```ts
const password = resolvePasswordForTransit(form.password, loginCfg);

try {
  await apiCall(password);
} catch (err) {
  showNotificationError(err, "登录失败");
  throw err;
}
```

这里 `resolvePasswordForTransit(...)` 如果内部已经提示“密码加密失败”，外层就不要再对同一错误提示一次“登录失败”。
