# Few-shot：用户表列设置（before/after）

## 用户诉求

「用户管理也加列设置，默认不显示创建时间。」

## 前置条件

`ColumnFilter` 已存在 → **应用-列设置**，形态 **C**。

## Before 信号

- [`UserTable.vue`](../../template/before/src/views/system/user/components/UserTable.vue)：静态列
- [`UserSearchBar.vue`](../../template/before/src/views/system/user/components/UserSearchBar.vue)：无 `#actions-extra`
- [`index.vue`](../../template/before/src/views/system/user/index.vue)：无列配置块

## After 要点

### UserSearchBar.vue

- `#actions` 末尾增加 `<slot name="actions-extra" />`

### index.vue

- `#actions-extra` 插槽内放 `ColumnFilter`（`v-if="toolbarPerms.query"`）
- 列配置块 + `user_manage_table_columns`
- `:visible-columns` 传 `UserTable`

### UserTable.vue

- 动态列；保留 `isCurrentUser` 选择禁用、`OperationColumn` 多 `v-if` 操作

### 默认列

隐藏：创建时间

## 对照路径

- before：[`template/before/.../user/`](../../template/before/src/views/system/user/)
- after：[`template/after/.../user/`](../../template/after/src/views/system/user/)

## 验收

- 列设置出现在删除按钮后
- 启用/停用/解锁等操作列行为不变
