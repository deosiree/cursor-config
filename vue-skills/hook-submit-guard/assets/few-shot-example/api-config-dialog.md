# Few-shot：ApiConfigDialog 新增 API 防连点

触发语：「权限配置新增 API 连点确定会重复创建」

## before（问题）

- 确定按钮无 `:disabled`
- 列表区容器与 `el-table` 重复 `v-loading="dialogLoading"`（双 spinner）
- 内层表单用 wrapper `v-loading`，与弹窗层级重复
- `handleSubmitApi` 无提交锁，连点可多次 `addFuncApi`

## after（修复）

1. `import { useSubmitGuard } from "@/composables/useSubmitGuard"`
2. `const { loading: submitLoading, startLoad, stopLoad } = useSubmitGuard()`
3. 内层弹窗 slot 用 `<div v-loading="submitLoading" class="submit-dialog-body">` 包裹表单（**勿**绑在 `el-dialog` 上）
4. 列表区仅在 `.api-dialog-content` 绑 `dialogLoading`，table 不再重复
5. 校验通过后 `if (!startLoad()) return`
6. `try { await MenuGateway.addFuncApi(...) } finally { stopLoad() }`
7. 确定按钮：`:disabled="submitLoading"`（勿加 `:loading`）

## 同模块复用

- `MenuFormDialog`（权限/菜单编辑弹窗）
- `ApiWhitelistDialog`
- `PermissionConfigDialog`（列表容器单点 loading）
