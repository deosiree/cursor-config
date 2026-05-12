---
name: shownotification
description: Use when nebula 项目中需要统一普通提示与后端错误提示，新增接入 showNotificationError，或治理 [code]message 与重复弹窗问题时
---

# shownotification

## 目标
把通知规范收敛为两条稳定规则：

1. 普通业务提示统一使用 `showNotification(message, { type, ...options })`
2. 后端错误统一使用 `showNotificationError(err, fallbackMessage)`，并展示 `[code]message`

本 skill 只负责通知职责，不负责国际化、全局 i18n 注入或 `useI18n()` 使用规范。

## 何时使用
- 新增前端提示逻辑，需要判断该用 `showNotification` 还是 `showNotificationError`
- 旧代码存在 `ElMessage`、手写 `[code]message` 拼接、或后端错误提示口径不一致
- gateway / request / view 多层都在 `catch` 提示，怀疑存在重复弹窗
- 其它微服务准备首次接入 `showNotificationError`

## 何时不要使用
- 只做表单规则、字段 validator、本地校验文案本身
- 讨论国际化注入、`useI18n()` 在全局工具中的使用限制
- 处理 `ElMessageBox`、确认弹窗、阻断式交互

## 核心规则

### 规则 1：普通提示
以下场景统一使用 `showNotification`：

- 成功提示
- 本地前置校验失败
- 本地流程阻断
- 警告、信息、无后端错误对象的前端错误

示例：

```ts
showNotification("保存成功", { type: "success" });
showNotification("请先选择文件", { type: "warning" });
showNotification("验证码缺失，请重新获取", { type: "error" });
```

### 规则 2：后端错误
以下场景统一使用 `showNotificationError`：

- API 请求失败
- gateway 层消费业务异常
- request 工具层读取后端 `code`、`message`

示例：

```ts
try {
  await apiCall();
} catch (err) {
  showNotificationError(err, "加载失败");
  throw err;
}
```

展示规则：

- 有后端 `code` 时：展示 `[code]message`
- 无 `code` 时：展示 `message`
- 无后端 message 时：回退到 `fallbackMessage`
- 推荐最小实现口径：
  先读 `err.error.code/message`，再读 `err.response.data.code/message`，再退化到 `err.message`，最后回退到 `fallbackMessage`
- 首次补 helper 时，`assets/examples/bootstrap-showNotificationError.md` 的最小模板优先级最高；
  若没有明确额外约束，不要自行扩展为“更完整封装版”

## 通知边界

### request 层
- 可以统一处理协议错误、HTTP 错误、网络错误
- 若这里已经提示，调用方不要再对同一错误重复提示

### gateway / helper 层
- 可以对“该领域能明确归类的错误”做统一提示
- 典型场景：密码传输加密失败、认证失败、MFA 校验失败
- 若这里已经 `showNotificationError(err, "...")` 并继续抛错，上层只负责阻断，不再重复提示

### view 层
- 只负责普通业务提示与成功提示
- 对已经在 request / gateway 层提示过的后端错误，不要再重复通知

## 禁止项

以下写法在业务代码中视为违规：

```ts
ElMessage.success("保存成功");
ElMessage.error("请求失败");
```

以下写法在处理后端错误时也视为违规：

```ts
catch (err) {
  showNotification("请求失败", { type: "error" });
}
```

```ts
catch (err) {
  const code = err?.error?.code ? `[${err.error.code}]` : "";
  const msg = err?.error?.message ?? "请求失败";
  showNotification(code + msg, { type: "error" });
}
```

另外，不要把翻译函数包装写进本 skill 的推荐示例中。
本 skill 推荐的最小写法始终是不包 `t()` 的普通字符串 fallback。
另外，不要默认把私有解析函数、已提示标记函数、埋点分支、错误分类器之类的重封装写进 `showNotificationError`；
重复弹窗优先通过 request / gateway / view 边界治理，而不是在 helper 内做黑盒兜底。

### 最小模板约束

当任务目标是“新增 `showNotificationError`”或“首次接入统一错误提示”时，默认必须先落到如下级别的最小 helper：

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

只有在用户或仓库现状明确要求时，才允许在这个 helper 上额外增加职责。

默认不允许额外增加的职责：
- 重复弹窗自动去重标记
- 私有解析函数拆分
- 埋点、监控、日志上报
- 错误类型枚举分流
- 国际化注入

如果需要处理“重复弹窗”，先改调用边界：
- request 已提示，则 view 不再提示
- gateway 已提示，则上层只阻断不再提示
- 只有边界治理无法落地时，才单独说明为何必须扩 helper

## 执行步骤
1. 搜索 `ElMessage` 残留点
2. 搜索后端错误是否仍然使用 `showNotification(... { type: "error" })`
3. 搜索是否存在散落的 `err?.error?.code` 拼接逻辑
4. 若项目里还没有 `showNotificationError`，先按最小模板补齐 helper，不要顺手叠加其他职责
5. 将普通提示统一到 `showNotification`
6. 将后端错误统一到 `showNotificationError(err, fallbackMessage)`
7. 检查 helper / gateway / request / view 是否存在同一错误重复提示
8. 回归关键交互，确认 `[code]message` 展示正常

推荐搜索命令：

```powershell
rg -n "\bElMessage\b|ElMessage\.(success|warning|error|info)" src mock
```

```powershell
rg -n "showNotificationError\(|err\?\.error\?\.code|showNotification\(.*type:\s*\"error\"" src
```

## MVP 样本

先看最小模板，再看真实历史样本：

- `[[assets/examples/bootstrap-showNotificationError.md]]`
- `[[assets/examples/minimal-usage.md]]`

优先使用以下真实历史样本理解最小成功实践：

- `[[assets/mvp-samples/sample-01-showNotificationError-code-message.md]]`
- `[[assets/mvp-samples/sample-02-auth-gateway-password-error.md]]`
- `[[assets/mvp-samples/sample-03-boundary-note-non-notification-history.md]]`

## references

- `[[references/error-notification-boundary.md]]`
- `[[references/code-message-display.md]]`
- `[[references/repeated-notification-avoidance.md]]`

## 验收标准
- 普通提示统一走 `showNotification`
- 后端错误统一走 `showNotificationError`
- 后端错误展示 `[code]message`
- 不存在手写 `[code]message` 拼接分支
- 不存在同一错误的重复弹窗
- skill 示例全部使用普通字符串 fallback，不包 `t()`

## 样本阅读顺序
- 先读 `assets/examples/bootstrap-showNotificationError.md`
  解决“这个项目里还没有 `showNotificationError` 时，我最少要补什么”
- 再读 `assets/examples/minimal-usage.md`
  解决“已经有 helper 后，业务代码怎么调用”
- 最后读 `assets/mvp-samples/sample-01...` 和 `sample-02...`
  解决“真实历史里是怎么从 before 改到 after 的”

## 使用示例

```text
使用 $shownotification 扫描 microfb 登录链路，
把普通业务提示和后端错误提示分流，
要求所有来自后端的报错统一展示 [code]message，
并检查是否存在 request/gateway/view 重复弹窗。
```
