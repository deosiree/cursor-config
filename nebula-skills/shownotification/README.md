# shownotification 套件说明

## 背景

nebula 历史上同时存在这些通知问题：

- `ElMessage` 与 `showNotification` 混用
- 后端错误有时直接 `showNotification("失败", { type: "error" })`
- 有些地方手写 `[code]message` 拼接
- request / gateway / view 多层 catch 时可能重复弹窗

因此本套件把通知分成两类统一治理：

- 普通业务提示：`showNotification(message, { type, ...options })`
- 后端错误提示：复用仓库内稳定错误提示 helper；若不存在，
  再新增 `showNotificationError(err, fallbackMessage)` 一类最小 helper

在重复弹窗风险较高的仓库里，还要继续把后端错误拆成两类：

- HTTP 状态错误：`status != 200`
- 业务错误：`status == 200 && code != 0`

## 本套件解决什么

- 统一普通提示入口
- 给后端错误建立统一入口，优先复用仓库现有 helper
- 统一 `[code]message` 展示规则
- 限制同一错误只在约定边界提示一次
- 说明何时需要把 HTTP 状态错误与业务错误继续分层

## 本套件不解决什么

- 不负责 i18n 规范
- 不讨论 `useI18n()` 在全局工具中的注入策略
- 不覆盖确认框、阻断式弹窗

## 最小推荐写法

普通提示：

```ts
showNotification("保存成功", { type: "success" });
showNotification("请先选择文件", { type: "warning" });
```

后端错误：

```ts
handleApiError(err, "加载失败");
handleApiError(err, "密码重置失败");
```

这里的 `handleApiError` 只是示例。
本套件不强制 helper 名称，判断标准是职责：

- 能从错误对象中读取 `code/message` 或 `message`
- 能统一输出错误通知
- 能提供 fallback 文案
- 能被 request / gateway / view 边界稳定复用

默认 helper 风格以 `assets/examples/bootstrap-showNotificationError.md` 为准：

- 保持 `microfb` 式单函数最小实现
- 兼容 `err.error.*` 与 `err.response.data.*`
- 不默认在 helper 内做重复弹窗打标记
- 不默认拆私有解析函数或增加额外职责

## 状态错误 vs 业务错误

当 request、gateway、view 对同一个错误可能重复提示时，不要把所有后端错误都继续塞给同一个 helper。

推荐分层：

- `handleStatusError` 负责 `status != 200` 的 HTTP 状态错误
- `handleApiError` 负责 `status == 200 && code != 0` 的业务错误
- request 负责通用状态错误
- gateway 负责消费结构化业务错误

这样处理的重点不是“多一个 helper”，而是把提示边界拆干净。

## 结构化业务错误联动

如果 request 已经把 `status != 200` 收口掉，那么 `code != 0` 不应该再继续裸抛普通错误，而应显式标记为业务错误：

```ts
return Promise.reject({
  type: "business",
  error: new Error(message || "Business Error"),
  response,
});
```

gateway 再只消费这一类结构化错误：

```ts
if ((error as any)?.type === "business") {
  handleApiError(error, defaultMsg);
}
```

这条协议的价值是：

- 不靠 `status` 猜业务错误
- 不靠 `message` 猜错误来源
- 不让 request 已处理过的 HTTP 错误再进入 gateway 二次通知
- 不需要把 helper 扩成黑盒去重器

执行优先级补充：

- 第一步先搜索仓库里是否已经有等价 helper
- 第二步若已有 helper，优先建议复用并申请人类确认是否沿用现名
- 第三步只有在没有现成 helper 时，才把 helper 落成最小模板
- 第二步再改调用边界
- 第三步才处理重复弹窗
- 不要把“边界治理”偷换成“把 helper 做大”

如果项目里还没有现成错误提示 helper，先从：

- `assets/examples/bootstrap-showNotificationError.md`

开始，不要直接跳到历史样本。

## 函数名适配原则

- 优先复用仓库已有 helper，例如 `handleApiError`
- 名称不是判断标准，职责才是判断标准
- `showNotificationError(err, fallbackMessage)` 只是默认最小模板名，不是强制命名
- 若扫描到多个候选 helper，不要直接新增或重命名，先让申请人/维护者确认复用哪个

## 人类门禁

以下情况必须先申请人类确认：

- 已发现一个等价 helper，但名称与默认模板不同
- 已发现多个候选 helper，职责重叠
- request / gateway / view 已混用多个 helper，复用策略会影响迁移边界
- 需要判断是直接复用现名，还是再包一层领域化包装器，例如 `handleGatewayError`

## 套件内容

- `SKILL.md`
  主入口与执行规则

- `references/`
  长说明与职责边界

- `assets/mvp-samples/`
  来自真实仓库变更的 MVP 样本，当前同时覆盖 `microfb` 与 `apex_dev`

- `assets/examples/`
  不依赖具体业务上下文的最小示例与首次接入模板

- `__template__/notification-migration-checklist.md`
  执行与验收清单

## 历史样本范围

本套件只抽通知职责直接相关的最小片段。

即使原始提交里顺带包含：

- `t(...)`
- `useI18n()`
- 全局纯函数接 i18n 注入

这些内容也不会进入本套件的 MVP 样本主体。

真实历史片段若包含 `t(...)`，会保留为历史证据；
但本套件自己的推荐写法仍以普通字符串 fallback 为准。

## 建议阅读顺序

如果你正在处理 request / gateway 重复通知，建议按这个顺序读：

1. `assets/mvp-samples/sample-05-handleStatusError-http-boundary.md`
2. `assets/mvp-samples/`
   `sample-06-business-error-tagging-with-handleGatewayError.md`

其中：

- `sample-05` 解决“HTTP 状态错误应该收在哪里”
- `sample-06` 解决“业务错误如何稳定进入 gateway 统一提示”

## 适用方式

```text
使用 $shownotification 收口某个模块的提示逻辑：
1. 普通提示统一走 showNotification
2. 后端错误先识别仓库现成 helper，再统一走已确认复用的错误提示 helper
3. 所有来自后端的报错展示 [code]message
4. 检查是否存在重复弹窗
```
