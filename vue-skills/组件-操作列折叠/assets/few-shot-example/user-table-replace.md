# Few-shot：用户表操作列替换（before/after）

## 用户诉求

「用户列表操作列：编辑行内显示，其余进『更多』；多 `v-if` 与启用/停用切换后操作列要刷新。」

## 前置条件

`OperationColumn` 套件已存在（见 [`operation-column-mvp.md`](operation-column-mvp.md)）。

## After 要点

### 列壳

```vue
<OperationColumn
  label="操作"
  fixed="right"
  :list-data-length="data.length"
  :inline-visible-count="2"
>
```

槽位 **2** = 最多 **1** 个行内 OpItem + **1** 槽「更多」。

### 要点

- 列壳：`OperationColumn` + `:list-data-length="data.length"`
- `v-if` 保留在 `OpItem`（`status`、`showResendActivation` 等）
- 探针覆盖 `status` / `showResendActivation`（`tblProbeFp`）；行内签名 watch 处理同位数 `v-if` 替换

## 对照路径

- before：[`template/before/.../user/UserTable.vue`](../../template/before/src/views/system/user/components/UserTable.vue)
- after：[`template/after/.../user/UserTable.vue`](../../template/after/src/views/system/user/components/UserTable.vue)

## 验收

- 典型行：「编辑」+「更多」
- 启用用户后：「停用用户」行内显示正确（非仍显示停用）
- 不改业务 i18n
