# Few-shot：租户管理列表高度修复（形态 B）

## 用户诉求

租户管理列表浏览器放大后，底部分页显示不全（被裁切），表格无内部滚动条。

## 形态判定

**形态 B**：`BaseListToolbar` + `TenantTable` + `Pagination` 均在 `tenant/index.vue` 内为兄弟节点；表格逻辑在子组件。

## Before 问题

- 父页 `.bottom-container` 缺少 `min-height: 0`
- 分页直接放在 flex 列末尾，无 `flex-shrink: 0`
- `TenantTable.vue` 使用 `height: calc(100% - 106px)` 与 `style="max-height: 100%"`

## After 要点

### `tenant/index.vue`

```vue
<div class="tenant-list-page__body">
  <TenantTable ... />
</div>
<div class="tenant-list-page__pagination">
  <Pagination ... />
</div>
```

```scss
.bottom-container { min-height: 0; }
.tenant-list-page__body { flex: 1; min-height: 0; overflow: hidden; }
.tenant-list-page__pagination { flex-shrink: 0; }
```

### `TenantTable.vue`

```ts
const { tableBodyHeight } = useTableBodyHeight(tableWrapperRef);
```

```vue
<el-table :height="tableBodyHeight" />
```

## 样本路径

- `template/before/src/views/tenant/index.vue`
- `template/before/src/views/tenant/components/TenantTable.vue`
- `template/after/src/views/tenant/index.vue`
- `template/after/src/views/tenant/components/TenantTable.vue`
