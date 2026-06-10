# ColumnFilter 与列配置契约

## ColumnItem

```ts
interface ColumnItem {
  prop: string;
  label: string;
  required?: boolean;  // true：始终显示，popover 内 disabled
  visible?: boolean;   // 默认是否选中（非 required 列）
}
```

## 页面侧状态

| 变量 | 类型 | 职责 |
|------|------|------|
| `tableColumns` | `ref<ColumnItem[]>` | 全量列定义，传给 `ColumnFilter :columns` |
| `selectedColumns` | `ref<string[]>` | 用户勾选的 prop 列表，`v-model` 绑定 |
| `visibleColumns` | `computed` | 表格实际渲染列 |

```ts
const visibleColumns = computed(() =>
  tableColumns.value.filter(
    (column) => selectedColumns.value.includes(column.prop) || column.required
  )
);
```

## buildTableColumns

- 用 `TABLE_COLUMN_LABEL` 常量承载中文 label
- 函数体内对每个 label 调用 `t("...")`，保证 i18n 抽取
- `required: true` 用于选择列、操作列
- `visible: false` 表示默认不勾选（仍可在 popover 打开）

## ColumnFilter props

| prop | 说明 |
|------|------|
| `columns` | `tableColumns` |
| `modelValue` / `v-model` | `selectedColumns` |

重置逻辑（组件内）：选中所有 `required` 或 `visible !== false` 的非 required 列。

## 表格动态渲染

```vue
<template v-for="column in visibleColumns" :key="column.prop">
  <el-table-column v-if="column.prop === 'tenantName'" :label="$t(column.label)" ... />
  <OperationColumn v-else-if="column.prop === 'actions'" ... />
</template>
```

- 复杂 slot（状态 tag、日期格式化）保留在对应分支
- `OperationColumn` 作为 `actions` 分支，不单独写死在外层

## 表格组件 prop

子表组件接收 `visibleColumns`（可导出 `XxxTableColumn` 类型与 `ColumnItem` 同构）。
