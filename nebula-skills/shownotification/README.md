# shownotification 套件说明

## 背景
nebula 历史上同时存在这些通知问题：

- `ElMessage` 与 `showNotification` 混用
- 后端错误有时直接 `showNotification("失败", { type: "error" })`
- 有些地方手写 `[code]message` 拼接
- request / gateway / view 多层 catch 时可能重复弹窗

因此本套件把通知分成两类统一治理：

- 普通业务提示：`showNotification(message, { type, ...options })`
- 后端错误提示：`showNotificationError(err, fallbackMessage)`

## 本套件解决什么
- 统一普通提示入口
- 给后端错误新增统一入口 `showNotificationError`
- 统一 `[code]message` 展示规则
- 限制同一错误只在约定边界提示一次

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
showNotificationError(err, "加载失败");
showNotificationError(err, "密码重置失败");
```

如果项目里还没有 `showNotificationError`，先从：

- `assets/examples/bootstrap-showNotificationError.md`

开始，不要直接跳到历史样本。

## 套件内容

- `SKILL.md`
  主入口与执行规则
- `references/`
  长说明与职责边界
- `assets/mvp-samples/`
  来自 microfb 的真实 `commit^ -> commit` MVP 样本
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

真实历史片段若包含 `t(...)`，会保留为历史证据；但本套件自己的推荐写法仍以普通字符串 fallback 为准。

## 适用方式

```text
使用 $shownotification 收口某个模块的提示逻辑：
1. 普通提示统一走 showNotification
2. 后端错误统一走 showNotificationError(err, fallbackMessage)
3. 所有来自后端的报错展示 [code]message
4. 检查是否存在重复弹窗
```
