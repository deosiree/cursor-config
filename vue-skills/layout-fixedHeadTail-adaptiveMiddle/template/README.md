# template 说明

本目录存放 apex_dev 角色管理列表高度修复的 **真实历史样本**。

## 样本一：角色管理（形态 A）— commit `855cec2c`

### before（`855cec2c^`）

- `el-table` 使用 `style="max-height: 100%"`
- `.table-wrapper` 无 flex 约束

### after（`855cec2c`）

- 新增 `useTableBodyHeight.ts`
- `RoleListTable.vue` 头-中-尾 flex + `:height="tableBodyHeight"`

路径：`before|after/src/views/system/role/...`

## 样本二：租户管理（形态 B）

### before

- 父页 `tenant/index.vue`：`bottom-container` 无 `min-height: 0`；分页无 `flex-shrink: 0`
- 子组件 `TenantTable.vue`：`calc(100% - 106px)` + `max-height: 100%`

### after

- 父页：`.tenant-list-page__body` + `.tenant-list-page__pagination`
- 子组件：`useTableBodyHeight` + `:height`，去掉 calc

路径：`before|after/src/views/tenant/index.vue`、`.../TenantTable.vue`

## 样本三：用户管理（形态 B）

### before / after

- 父页：`system/user/index.vue` — 中间区 `user-list-page__body`、分页 `user-list-page__pagination`
- 子组件：`components/UserTable.vue` — `useTableBodyHeight` + `:height`

路径：`before|after/src/views/system/user/index.vue`、`.../UserTable.vue`

## 阅读顺序建议

1. 形态 A：`after/.../role/RoleListTable.vue` + `useTableBodyHeight.ts`
2. 形态 B：对比 `tenant/` 或 `system/user/` 的 index + Table before/after（两页改法同构）
