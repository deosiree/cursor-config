# code-message-display

## 目标
统一“所有来自后端的报错，前端展示 `[code]message`”的规则。

## 展示规则
- 有 `err.error.code` 且有 `err.error.message`：展示 `[code]message`
- 只有 `message`：展示 `message`
- 都没有：展示 fallback 文案

## 禁止项
- 在业务代码里手写 `const code = ...; const msg = ...; showNotification(code + msg, ...)`
- 同一个项目里一部分错误显示 code、一部分错误不显示 code
- 把 `[code]message` 的拼接逻辑散落在多个模块

## 推荐入口

```ts
showNotificationError(err, "请求失败");
```

## 说明
本规则只讨论通知展示，不讨论国际化，不要求 fallback 文案必须包 `t()`。
