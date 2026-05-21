# Few-shot：用户管理列表高度修复（形态 B）

## 用户诉求

用户管理 `el-table` 写了 `style="max-height: 100%"` 但 tbody 无滚动；浏览器放大后底部分页被裁切。

## 形态判定

**形态 B**：`UserSearchBar` + `UserTable` + `Pagination` 在 `user/index.vue` 为兄弟节点；表格在子组件。

## Before 问题

- 父页 `.bottom-container` 缺少 `min-height: 0`；误在父页写 `.table-wrapper { calc(100% - 106px) }`
- 分页无 `flex-shrink: 0` 外包
- `UserTable.vue` 使用 `calc(100% - 106px)` 与 `style="max-height: 100%"`

## After 要点

### `user/index.vue`

```vue
<div class="user-list-page__body">
  <UserTable ... />
</div>
<div class="user-list-page__pagination">
  <Pagination v-if="total > 0" ... />
</div>
```

```scss
.bottom-container { min-height: 0; }
.user-manage :deep(.base-list-toolbar) { flex-shrink: 0; }
.user-list-page__body { flex: 1; min-height: 0; overflow: hidden; }
.user-list-page__pagination { flex-shrink: 0; }
```

### `UserTable.vue`

```ts
const { tableBodyHeight } = useTableBodyHeight(tableWrapperRef);
```

```vue
<el-table :height="tableBodyHeight" ... />
```

删除 `calc(100% - 106px)` 与 `style="max-height: 100%"`。

## 对照路径

- `template/before|after/src/views/system/user/index.vue`
- `template/before|after/src/views/system/user/components/UserTable.vue`
- 与租户形态 B 改法一致，类名前缀为 `user-list-page__*`
