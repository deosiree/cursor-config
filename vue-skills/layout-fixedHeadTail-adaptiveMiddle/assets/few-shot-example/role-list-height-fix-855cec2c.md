# Few-shot：角色管理列表高度修复（855cec2c）

## 用户诉求

检查角色管理列表的表单与分页动态高度。浏览器放大比例后显示不全：分页被挤出视口，表格没有内部滚动条。

期望：分页完整显示；表格在中间区域出现纵向滚动条。

## 仓库与 commit

| 项 | 值 |
|----|-----|
| 仓库 | `apex_dev` |
| Before | `855cec2c^` |
| After | `855cec2c68eea73a096a1ea949c38356aa73f95c` |
| Message | `fix(views): 角色管理：动态计算表格高度+固定首尾、中间自适应的弹性布局` |

## RED 诊断摘要

1. `RoleListTable.vue` 中 `el-table` 仅 `style="max-height: 100%"`
2. `.table-wrapper` 无 flex 样式
3. 分页无 `flex-shrink: 0` 包裹
4. 父级 `bottom-container` 缺 `min-height: 0`

## Before 关键片段

```vue
<div class="table-wrapper">
  <el-table
    style="max-height: 100%"
    ...
  />
</div>
<Pagination v-if="total > 0" ... />
```

```scss
.role-list-table {
  display: flex;
  flex-direction: column;
  height: 100%;
  /* 无 min-height: 0，无 table-wrapper / pagination 分段 */
}
```

## After 关键片段

```vue
<div ref="tableWrapperRef" class="table-wrapper">
  <el-table :height="tableBodyHeight" ... />
</div>
<div class="role-list-table__pagination">
  <Pagination v-if="total > 0" ... />
</div>
```

```ts
const tableWrapperRef = ref<HTMLElement | null>(null);
const { tableBodyHeight } = useTableBodyHeight(tableWrapperRef);
```

```scss
.table-wrapper {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}
.role-list-table__pagination {
  flex-shrink: 0;
}
```

新增 `src/composables/useTableBodyHeight.ts`（`ResizeObserver` + `window.resize` 降级）。

## 验收结果（预期）

- 100% / 125% / 150% 缩放：分页完整可见
- 行数多时：表格 body 滚动，表头固定
- 窗口 resize：高度随容器更新

## 完整样本路径

- `template/before/src/views/system/role/components/role/RoleListTable.vue`
- `template/after/src/views/system/role/components/role/RoleListTable.vue`
- `template/after/src/composables/useTableBodyHeight.ts`
