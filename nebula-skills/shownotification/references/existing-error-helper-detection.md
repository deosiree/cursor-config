# existing-error-helper-detection

## 目标
回答一个常见误区：

- `showNotificationError(err, fallbackMessage)` 是默认模板名
- 但 skill 不应把它当成唯一合法函数名

真正要识别的是“仓库里是否已经有等价的错误提示 helper”。

## 检测顺序
1. 先搜现有 helper 名称
2. 再判定职责是否等价
3. 再决定复用还是新增

推荐搜索：

```powershell
rg -n "handleApiError\(|showNotificationError\(|handleGatewayError\(|concurApiErr\(|newConcurLock\(" src
```

```powershell
rg -n "err\?\.error\?\.code|err\?\.response\?\.data\?\.code|showNotification\(.*type:\s*\"error\"" src
```

## 最小等价判定标准
若某个 helper 满足以下多数条件，就应视为候选复用对象：

- 能读取错误对象中的 `code` / `message`
- 至少兼容 `message` fallback
- 能统一输出错误通知
- 在 request / gateway / view 中已有稳定调用

函数名不是标准。

例如：
- `handleApiError`
- `showNotificationError`
- 领域内的 `notifyRequestError`

都可能是等价 helper。

### 结论 D：并发批次错误（专用，非 handleGatewayError 替代）

同一 gateway 方法内多路并行 HTTP 失败时，使用：

- `newConcurLock()`：创建 `{ notified: false }`
- `concurApiErr(lock, error, errMsg?)`：每路 console，business 整批 toast 一次

入口：`[[../feature-skills/并发HTTP错误通知/SKILL.md]]`。不要与单次 `handleGatewayError` 混用。

## 复用优先级
- 已有一个稳定 helper：优先复用
- 没有等价 helper：新增最小 helper
- 有多个候选 helper：必须申请人类介入确认

## 何时触发人类介入
- 找到一个等价 helper，但名称与默认模板不同
- 找到多个候选 helper，职责边界不清
- request / gateway / view 混用多个 helper，迁移会影响调用边界
- 需要判断是直接复用现名，还是在其上新增领域包装器，例如 `handleGatewayError`

## 典型结论

### 结论 A：直接复用
仓库里已经有 `handleApiError(err, fallbackMessage)`，并且它已经负责：

- 展示 `[code]message`
- fallback 到 message 或默认文案
- 发出统一错误通知

这时不要再新增 `showNotificationError`。

### 结论 B：复用 + 包装
仓库里已有 `handleApiError`，但某个领域存在大量重复的：

```ts
try {
  await apiCall();
} catch (err) {
  handleApiError(err, "加载失败");
  throw err;
}
```

这时可以复用现成 helper，再包装成：

```ts
handleGatewayError(() => apiCall(), "加载失败")
```

### 结论 C：新增最小 helper
仓库里没有现成 helper，业务层还在散落地：

- 手写 `[code]message`
- `showNotification("失败", { type: "error" })`

这时才建议新增 `showNotificationError(err, fallbackMessage)` 一类最小模板。
