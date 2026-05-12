---
name: shownotification
description: Use when nebula 项目中需要统一普通提示与后端错误提示，识别或新增稳定错误提示 helper，或治理 [code]message 与重复弹窗问题时
---

# shownotification

## 目标
把通知规范收敛为两条稳定规则：

1. 普通业务提示统一使用 `showNotification(message, { type, ...options })`
2. 后端错误统一使用“仓库内稳定错误提示 helper”，并展示 `[code]message`

本 skill 只负责通知职责，不负责国际化、全局 i18n 注入或 `useI18n()` 使用规范。

## 何时使用
- 新增前端提示逻辑，需要判断该用 `showNotification` 还是错误提示 helper
- 旧代码存在 `ElMessage`、手写 `[code]message` 拼接、或后端错误提示口径不一致
- gateway / request / view 多层都在 `catch` 提示，怀疑存在重复弹窗
- 其它微服务准备首次接入统一错误提示 helper

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
以下场景统一使用“错误提示 helper”：

- API 请求失败
- gateway 层消费业务异常
- request 工具层读取后端 `code`、`message`

示例：

```ts
try {
  await apiCall();
} catch (err) {
  errorNotificationHelper(err, "加载失败");
  throw err;
}
```

命名规则：

- `showNotificationError(err, fallbackMessage)` 只是默认占位名，不是强制命名
- 若仓库内已有等价 helper，例如 `handleApiError`，优先复用现名
- 若扫描到多个候选 helper 或职责重叠，必须申请人类介入确认复用哪一个

展示规则：

- 有后端 `code` 时：展示 `[code]message`
- 无 `code` 时：展示 `message`
- 无后端 message 时：回退到 `fallbackMessage`
- 推荐最小实现口径：
  先读 `err.error.code/message`，再读 `err.response.data.code/message`，再退化到 `err.message`，最后回退到 `fallbackMessage`
- 首次补 helper 时，`assets/examples/bootstrap-showNotificationError.md` 的最小模板优先级最高；
  若没有明确额外约束，不要自行扩展为“更完整封装版”
- 若仓库已有现成 helper，则先判断是否等价；只有不存在等价 helper 时，才新增 `showNotificationError` 一类最小模板名

## 通知边界

### request 层
- 可以统一处理协议错误、HTTP 错误、网络错误
- 若这里已经提示，调用方不要再对同一错误重复提示

### gateway / helper 层
- 可以对“该领域能明确归类的错误”做统一提示
- 典型场景：密码传输加密失败、认证失败、MFA 校验失败
- 若这里已经通过错误提示 helper 或 `handleGatewayError(() => action(), "...")` 提示并继续抛错，上层只负责阻断，不再重复提示

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

```ts
// 仓库里已经有 handleApiError，却又新补一个 showNotificationError
catch (err) {
  showNotificationError(err, "请求失败");
}
```

另外，不要把翻译函数包装写进本 skill 的推荐示例中。
本 skill 推荐的最小写法始终是不包 `t()` 的普通字符串 fallback。
另外，不要默认把私有解析函数、已提示标记函数、埋点分支、错误分类器之类的重封装写进 `showNotificationError`；
重复弹窗优先通过 request / gateway / view 边界治理，而不是在 helper 内做黑盒兜底。

### 最小模板约束

当任务目标是“新增错误提示 helper”或“首次接入统一错误提示”时，默认必须先先扫仓库现状：

1. 搜索是否已有 `handleApiError`、`showNotificationError` 或其他等价 helper
2. 判断其是否满足 `[code]message` / `message` / fallback 的最小职责
3. 若已有等价 helper，优先复用并申请人类确认
4. 只有不存在等价 helper 时，才新增如下级别的最小 helper

默认新增模板可命名为 `showNotificationError`：

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

### 现成 helper 复用门禁

出现以下情况时，不要直接新增 `showNotificationError`，先申请人类介入：

- 扫描到一个等价 helper，例如 `handleApiError`
- 扫描到多个相似 helper，但调用边界不同
- request / gateway / view 已经混用多个 helper，复用策略会影响迁移边界

## 执行步骤
1. 先搜索现有错误提示 helper：`handleApiError`、`showNotificationError` 或其他具备 `[code]message` / fallback 能力的函数
2. 输出 `existingHelperDetection`
3. 搜索 `ElMessage` 残留点
4. 搜索后端错误是否仍然使用 `showNotification(... { type: "error" })`
5. 搜索是否存在散落的 `err?.error?.code` 拼接逻辑
6. 若项目里没有等价 helper，先按最小模板补齐 helper，不要顺手叠加其他职责
7. 将普通提示统一到 `showNotification`
8. 将后端错误统一到“仓库已确认复用的错误提示 helper”
9. 检查 helper / gateway / request / view 是否存在同一错误重复提示
10. 回归关键交互，确认 `[code]message` 展示正常

推荐搜索命令：

```powershell
rg -n "\bElMessage\b|ElMessage\.(success|warning|error|info)" src mock
```

```powershell
rg -n "showNotificationError\(|err\?\.error\?\.code|showNotification\(.*type:\s*\"error\"" src
```

```powershell
rg -n "handleApiError\(|showNotificationError\(|handleGatewayError\(" src
```

## MVP 样本

先看最小模板，再看真实历史样本：

- `[[assets/examples/bootstrap-showNotificationError.md]]`
- `[[assets/examples/minimal-usage.md]]`

优先使用以下真实历史样本理解最小成功实践：

- `[[assets/mvp-samples/sample-01-showNotificationError-code-message.md]]`
- `[[assets/mvp-samples/sample-02-auth-gateway-password-error.md]]`
- `[[assets/mvp-samples/sample-04-existing-helper-reuse-handleGatewayError.md]]`
- `[[assets/mvp-samples/sample-03-boundary-note-non-notification-history.md]]`

## references

- `[[references/error-notification-boundary.md]]`
- `[[references/code-message-display.md]]`
- `[[references/existing-error-helper-detection.md]]`
- `[[references/repeated-notification-avoidance.md]]`

## 验收标准
- 普通提示统一走 `showNotification`
- 后端错误统一走仓库内已确认的错误提示 helper
- 后端错误展示 `[code]message`
- 不存在手写 `[code]message` 拼接分支
- 不存在同一错误的重复弹窗
- skill 示例全部使用普通字符串 fallback，不包 `t()`
- 若仓库已有等价 helper，不会机械新增第二个同类函数

## 样本阅读顺序
- 先读 `assets/examples/bootstrap-showNotificationError.md`
  解决“这个项目里还没有错误提示 helper 时，我最少要补什么”
- 再读 `assets/examples/minimal-usage.md`
  解决“已经确认 helper 后，业务代码怎么调用”
- 最后读 `assets/mvp-samples/sample-01...` 和 `sample-02...`
  解决“真实历史里是怎么从 before 改到 after 的”

## 使用示例

```text
使用 $shownotification 扫描 microfb 登录链路，
先识别是否已有现成错误提示 helper，
再把普通业务提示和后端错误提示分流，
要求所有来自后端的报错统一展示 [code]message，
并检查是否存在 request/gateway/view 重复弹窗。
```
