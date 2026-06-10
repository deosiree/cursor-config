# Few-shot：租户表列设置（before/after）

## 用户诉求

「参照设备管理，给租户列表加列设置，默认隐藏联系人和创建时间。」

## 前置条件

`ColumnFilter` 已存在 → **应用-列设置**，形态 **B**。

## Before 信号

- [`TenantTable.vue`](../../template/before/src/views/tenant/components/TenantTable.vue)：硬编码 9 个 `el-table-column`
- [`index.vue`](../../template/before/src/views/tenant/index.vue)：工具栏无 `ColumnFilter`

## After 要点

### 父页 index.vue

- `#actions` 内增加 `ColumnFilter`（`sys:tenant:query`）
- 列配置块 + `tenant_manage_table_columns`
- `:visible-columns="visibleColumns"` 传 `TenantTable`

### TenantTable.vue

- `visibleColumns` prop + `TenantTableColumn` 类型
- `v-for` 按 `column.prop` 分支，保留状态 tag、`OperationColumn`

### 默认列

显示：租户名、手机号、邮箱、状态、到期时间  
隐藏：联系人、创建时间

## 对照路径

- before：[`template/before/.../tenant/`](../../template/before/src/views/tenant/)
- after：[`template/after/.../tenant/`](../../template/after/src/views/tenant/)

## 验收

- 列设置按钮与搜索同权限
- 勾选联系人/创建时间后表格即时显示
- 刷新后偏好恢复
