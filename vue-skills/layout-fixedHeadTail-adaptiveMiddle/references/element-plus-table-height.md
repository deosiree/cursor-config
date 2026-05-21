# Element Plus 表格高度与滚动

## 核心规则

`el-table` 要在 **表体（tbody）** 内滚动，需要传入 **数值型** 的 `height` 或 `max-height` **prop**。

仅写 CSS：

```html
<el-table style="max-height: 100%" />
```

在父级高度未收敛时 **通常无效**，表格仍按全部行高渲染，把分页顶出视口。

## 推荐写法

```vue
<div ref="tableWrapperRef" class="table-wrapper">
  <el-table :height="tableBodyHeight" :data="list" />
</div>
```

```ts
const tableWrapperRef = ref<HTMLElement | null>(null);
const { tableBodyHeight } = useTableBodyHeight(tableWrapperRef);
```

- `tableBodyHeight` 来自 `.table-wrapper` 的 `clientHeight`（`ResizeObserver` 同步）
- 使用 `height` prop 时表头固定、body 滚动（与菜单管理页一致）

## height 与 max-height 的选择

| prop | 行为 | 适用 |
|------|------|------|
| `height` | 固定表格总高，body 滚动 | 列表区高度已由 flex 分配定死 |
| `max-height` | 不超过某高度，内容少时变矮 | 行数少时不想留大块空白 |

本 skill 默认 **`height`**，与 nebula 角色列表、`menu/index.vue` 的 `:height="resolveTableHeight(...)"` 一致。

## 何时不必用 composable

若父级已通过 `PageTabShell` 等壳组件提供稳定的 `contentHeight`（像素值），可直接：

```vue
<el-table :height="resolveTableHeight(contentHeight)" />
```

不必再对 `.table-wrapper` 做 `ResizeObserver`，避免重复测算。
