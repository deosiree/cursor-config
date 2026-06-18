---
name: hook-submit-guard
description: 弹窗/表单确定连点防重：useSubmitGuard 锁提交逻辑，loading 绑表单容器 v-loading + 确定按钮 disabled；不用 useLoading 全屏遮罩。
---

# hook-submit-guard

弹窗、表单 **确定** 提交防重：`useSubmitGuard` 提供内存锁；`loading` 绑弹窗**内容区**内层 wrapper 的 `v-loading`（对齐 `BaseDialog`），确定按钮仅 `:disabled`。

## 何时使用

- 弹窗确定连点会触发多次 `create` / `update`
- 需要按钮禁用 + 表单区局部遮罩，但不上全屏 `ElLoading`
- 替换 `useDebounceFn` 作为提交防重手段

## 何时不要使用

- 路由首屏、列表查询全屏 loading → [`hook-loading`](../hook-loading/SKILL.md) + `useLoading`
- 租户多步向导已有 `confirmLoading` → 保持现状
- 安全配置 Tab 保存已有 `saving` + `FormActionButtons` → 保持现状
- HTTP 401/500 提示去重 → `useRequestLock`（拦截器层，与按钮防重无关）

## API

路径：`src/composables/useSubmitGuard.ts`

```ts
export function useSubmitGuard(): {
  loading: Ref<boolean>;
  startLoad: () => boolean;
  stopLoad: () => void;
};
```

| 成员 | 说明 |
|------|------|
| `loading` | 绑弹窗内容区 wrapper 的 `v-loading`；确定按钮 `:disabled="loading"` |
| `startLoad()` | 校验通过后调用；已锁则返回 `false` |
| `stopLoad()` | `finally` 中调用，关闭遮罩并恢复按钮 |

## 标准范式（API 在弹窗内）

```ts
const { loading: submitLoading, startLoad, stopLoad } = useSubmitGuard();
```

```vue
<el-dialog v-model="visible" ...>
  <div v-loading="submitLoading" class="submit-dialog-body">
    <ElForm ... />
  </div>
</el-dialog>

<el-button type="primary" :disabled="submitLoading" @click="handleSubmit">
  {{ $t("确定") }}
</el-button>
```

**勿**把 `v-loading` 直接绑在 `el-dialog` 组件上（Teleport 根节点，遮罩不显示）。参考 `BaseDialog` 的 `app-base-dialog__body`。

列表弹窗：仅在内容容器（如 `.api-dialog-content`）绑 `v-loading`，**不要**再在 `el-table` 上重复绑同一 loading。

有弹窗遮罩时，**不要**再给确定按钮加 `:loading`。

```ts
async function handleSubmit() {
  const valid = await formRef.value?.validate().catch(() => false);
  if (!valid) return;
  if (!startLoad()) return;
  try {
    await Gateway.create(payload);
  } finally {
    stopLoad();
  }
}
```

**嵌套弹窗**：外层列表删除/拉数仍用独立 `internalLoading` + `dialogLoading`；内层新增/编辑表单用 `submitLoading`，二者不合并。

**提交后刷新**：弹窗 `stopLoad` 关窗后再启全屏 `useLoading` 拉取资料（如个人中心 `refreshProfile({ refreshing: true })`），勿与弹窗 `submitLoading` 重叠。

**与 hook-loading 边界**：局部 `v-loading` 仅罩弹窗内容区；`useLoading` 全屏锁页另案。同一请求不要既 `useLoading` 又 `v-loading`（见 hook-loading 反模式 #7）。

## 父组件提交（API 在父级）

子组件只 `emit('submit')`，父级持 hook 并将 `loading` 以 `confirmLoading` prop 下发：

```ts
const { loading: confirmLoading, startLoad, stopLoad } = useSubmitGuard();

async function handleFormSubmit(payload) {
  if (!startLoad()) return;
  try {
    await Gateway.create(payload);
  } finally {
    stopLoad();
  }
}
```

页面若已有表格 `loading`，解构别名：`loading: confirmLoading`。

**子组件遮罩接线（二选一，勿重复）：**

| 子组件形态 | 遮罩写法 |
|------------|----------|
| 原生 `el-dialog` | `<div v-loading="props.confirmLoading" class="submit-dialog-body">` 包 tabs/表单 |
| `SinglePaneDialog` / `BaseDialog` | 传 `:loading="props.confirmLoading"`（body 已有 `v-loading`），**勿**再包 wrapper |

```vue
<!-- 原生 dialog（角色编辑等） -->
<el-dialog v-model="visible" ...>
  <div v-loading="props.confirmLoading" class="submit-dialog-body">
    <el-tabs>...</el-tabs>
  </div>
  <template #footer>
    <el-button type="primary" :disabled="props.confirmLoading" @click="emit('submit')" />
  </template>
</el-dialog>

<!-- SinglePaneDialog（用户编辑等） -->
<SinglePaneDialog v-model="visible" :loading="props.confirmLoading" :show-confirm="false">
  <UserFormFields ... />
  <template #footer>
    <el-button type="primary" :disabled="props.confirmLoading" @click="emit('submit')" />
  </template>
</SinglePaneDialog>
```

Few-shot：[`assets/few-shot-example/user-edit-dialog.md`](assets/few-shot-example/user-edit-dialog.md)

## 选型对照

| 场景 | 方案 |
|------|------|
| 弹窗确定防连点 | 弹窗 `v-loading` + 按钮 `:disabled`（`useSubmitGuard`） |
| 弹窗列表删除/拉数 | 容器 `v-loading`（勿与 table 重复） |
| 首屏/列表全屏遮罩 | `useLoading` |
| 多步向导确定 | `confirmLoading`（租户） |
| 页面内 Tab 保存 | `saving` + 按钮 loading（安全配置） |

## 延伸阅读

- 反模式：[`references/anti-patterns.md`](references/anti-patterns.md)
- Few-shot（菜单）：[`assets/few-shot-example/api-config-dialog.md`](assets/few-shot-example/api-config-dialog.md)
- Few-shot（用户 Mode B）：[`assets/few-shot-example/user-edit-dialog.md`](assets/few-shot-example/user-edit-dialog.md)
- 全屏 loading 边界：[`hook-loading/SKILL.md`](../hook-loading/SKILL.md)
