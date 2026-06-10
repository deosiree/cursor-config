# Few-shot：角色表列设置（before/after）

## 用户诉求

「角色管理列表加列设置。」

## 前置条件

`ColumnFilter` 已存在 → **应用-列设置**，形态 **D**。

## Before 信号

- [`RoleListTable.vue`](../../template/before/src/views/system/role/components/role/RoleListTable.vue)：
  - 工具栏仅搜索、新增
  - 3 个静态数据列 + `OperationColumn`
  - 无 selection 列

## After 要点

### 单文件 RoleListTable.vue

- `#actions` 内增加 `ColumnFilter`（`sys:role:query`）
- 列配置块 + `role_manage_table_columns` 写在同文件
- 表格 `v-for="column in visibleColumns"`

### 列定义

- `roleName`、`description`、`userCount`：默认全显
- `actions`：`required: true`

## 对照路径

- before：[`template/before/.../RoleListTable.vue`](../../template/before/src/views/system/role/components/role/RoleListTable.vue)
- after：[`template/after/.../RoleListTable.vue`](../../template/after/src/views/system/role/components/role/RoleListTable.vue)

## 验收

- 三列均可勾选隐藏（操作列除外）
- 编辑/删除 `OpItem` 不变
