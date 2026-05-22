# Few-shot：用户表操作列替换（before/after）

## 用户诉求

「用户列表操作列按钮多、有状态 v-if，接入 OperationColumn，不要改 i18n。」

## 前置条件

`OperationColumn` 套件已存在（见 [`operation-column-mvp.md`](operation-column-mvp.md)）。

## Before 问题

- `el-table-column` + 多个 `el-button`
- 硬编码中文文案
- `v-if` 依赖 `status`、`isCurrentUser` 等

## After 要点

- 列壳：`OperationColumn` + `:list-data-length="data.length"`
- 每个按钮 → `OpItem`，`v-if` 保留在 `OpItem` 上
- **不**批量改 `$t()`（见 [`optional-i18n.md`](../../references/optional-i18n.md)）

## 样本路径

- Before：[`template/before/.../UserTable.vue`](../../template/before/src/views/system/user/components/UserTable.vue)
- After：[`template/after/.../UserTable.vue`](../../template/after/src/views/system/user/components/UserTable.vue)

## 列宽探针

- 多 `v-if` 由组件从 `:data` 取样，业务不传 `probe-data-rows`
- 见 [`references/column-width-probe.md`](../../references/column-width-probe.md)

## 推广

对照租户样本 [`tenant-table-replace.md`](tenant-table-replace.md) 同构替换；树表见 [`menu-table-replace.md`](menu-table-replace.md)。
