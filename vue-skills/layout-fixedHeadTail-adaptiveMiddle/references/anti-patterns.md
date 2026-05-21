# 反模式与 red flags

## 反模式 1：只用 CSS max-height

```vue
<!-- 差 -->
<el-table style="max-height: 100%" />
```

**改法**：`:height="tableBodyHeight"` + `useTableBodyHeight`。

## 反模式 2：魔法数 calc

```scss
/* 差：缩放、工具栏高度变化时易失效 */
.table-wrapper {
  height: calc(100% - 106px);
}
```

**改法**：中间区 `flex: 1; min-height: 0` + 实测 wrapper 高度。

## 反模式 3：分页不防压缩

```vue
<!-- 差：分页直接作为 flex 子项，无 shrink 保护 -->
<Pagination />
```

**改法**：

```vue
<div class="role-list-table__pagination">
  <Pagination />
</div>
```

```scss
.role-list-table__pagination {
  flex-shrink: 0;
}
```

## 反模式 4：父级缺少 min-height: 0

```scss
/* 差 */
.bottom-container {
  height: 100%;
  /* 缺少 min-height: 0 */
}
```

**改法**：在每一层 flex 子项补 `min-height: 0`。

## 反模式 5：只改表格、不改父级链

仅在 `RoleListTable` 加 `:height`，但 `el-card__body` / 编排层未 `overflow: hidden` 且未 `min-height: 0` → 高度链仍断。

**改法**：按 `flex-height-chain.md` 从外到内补齐。

## 反模式 6：形态 B 只改子组件（租户/用户高发）

父页为 `index.vue` + `TenantTable` + `Pagination`，却只在 `TenantTable.vue` 改 `calc` 或 `:height`，**未**给父页 `.bottom-container` 加 `min-height: 0`、未给表格子树 `flex: 1`。

**改法**：按 `split-layout-parent-child.md` 同时改父页与子组件。

## agent red flags（应拒绝或先纠正）

- 「给表格外层加 `overflow: auto` 让整页滚」→ 未固定尾部分页
- 「用 `window.innerHeight - 400`」→ 未绑定列表容器实测
- 「保留 max-height 100% 再加 height」→ 应删除无效 CSS
- 在弹窗 Tab 上套用列表页整链 → 误用场景
