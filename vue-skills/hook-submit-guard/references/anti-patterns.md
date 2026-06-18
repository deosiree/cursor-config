# 反模式

## 1. 确定按钮无 disabled

连续点击会并行通过 `validate` 并多发请求。有弹窗 `v-loading` 时，按钮至少 `:disabled`；无遮罩时可加 `:loading`。

## 2. 仅用 useDebounceFn 防重

防抖窗口结束后仍可二次提交；且按钮无即时反馈。

## 3. 误用 useLoading 锁全屏做弹窗提交

提交场景过重；应用 `useSubmitGuard`。全屏 loading 见 `hook-loading`。

## 4. 误用 useRequestLock

该锁用于拦截器 401/500 提示去重（localStorage），与表单提交生命周期不匹配。

## 5. 仅用 internalLoading + v-loading 不锁确定按钮

表格局部 loading 不阻止内层弹窗确定按钮连点。

## 6. 校验失败仍 startLoad

须在 `validate` 通过后再 `startLoad()`，避免按钮误进入 loading。

## 7. 缺少 finally stopLoad

请求失败或早退后按钮永久禁用。

## 8. 容器与 table 重复 v-loading

同一 `dialogLoading` 绑在 `.api-dialog-content` 与 `el-table` 会出现双 spinner。仅保留容器一处。

## 9. v-loading 绑在 el-dialog 组件上

Element Plus 弹窗 Teleport 后指令不生效，提交时无遮罩。应在弹窗 slot 内层 wrapper 绑（见 `BaseDialog`）。

## 10. 容器 v-loading 与按钮 :loading 同时

遮罩与按钮 spinner 重复。有容器遮罩时按钮仅 `:disabled`。

## 11. 嵌套弹窗混用 loading 源

外层列表 `dialogLoading` 与内层提交 `submitLoading` 应分离，勿合并为一个 ref。
