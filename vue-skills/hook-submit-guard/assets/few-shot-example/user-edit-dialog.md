# Few-shot：UserEditDialog（Mode B + SinglePaneDialog）

触发语：「用户新增/编辑弹窗确定连点会重复提交」

## 分工

- **父页** [`user/index.vue`](../../../../apex_dev/src/views/system/user/index.vue)：持 `useSubmitGuard`，`startLoad/stopLoad` 包住 Gateway 请求
- **子组件** [`UserEditDialog.vue`](../../../../apex_dev/src/views/system/user/components/UserEditDialog.vue)：只展示，接收 `confirmLoading`

## 子组件遮罩

`SinglePaneDialog` → `BaseDialog` 已在 body 支持 `v-loading="loading"`，直接传 prop：

```vue
<SinglePaneDialog
  v-model="visible"
  :loading="props.confirmLoading"
  :show-confirm="false"
>
  <UserFormFields ... />
  <template #footer>
    <el-button type="primary" :disabled="props.confirmLoading" @click="emit('submit')" />
  </template>
</SinglePaneDialog>
```

**勿**再包 `submit-dialog-body`；**勿**给确定按钮加 `:loading`。

## 同模式复用

- `UserResetPasswordDialog.vue`
- 原生 `el-dialog` 场景见 `RoleEditDialog.vue`（用 wrapper，不用 SinglePaneDialog）
