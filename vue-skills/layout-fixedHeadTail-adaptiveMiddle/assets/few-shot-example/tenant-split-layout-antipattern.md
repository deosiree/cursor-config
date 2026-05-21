# Few-shot：形态 B 反例（租户/用户分裂布局）

## 场景

用户说：「租户列表 / 用户列表缩放后分页被挡住」。页面 **不是** 角色管理那种单文件三段式，而是：

- 父页：`BaseListToolbar` + `TenantTable` + `Pagination`
- 子组件：仅 `el-table` + `calc(100% - 106px)`

## 错误修法（agent 不应只做这些）

```scss
/* 只改子组件 — 不够 */
.table-wrapper {
  height: calc(100% - 120px); /* 换魔法数 */
}
```

```vue
<!-- 只加 CSS max-height — 不够 -->
<el-table style="max-height: 100%" />
```

## 正确修法要点

### 父页 `tenant/index.vue`

```scss
.bottom-container {
  height: 100%;
  min-height: 0; /* 新增 */
}
.list-page__body {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}
.list-page__pagination {
  flex-shrink: 0;
}
```

```vue
<BaseListToolbar ... />
<div class="list-page__body">
  <TenantTable class="h-full" ... />
</div>
<div class="list-page__pagination">
  <Pagination ... />
</div>
```

### 子组件 `TenantTable.vue`

```vue
<div ref="tableWrapperRef" class="table-wrapper">
  <el-table :height="tableBodyHeight" ... />
</div>
```

```ts
const { tableBodyHeight } = useTableBodyHeight(tableWrapperRef);
```

```scss
.table-wrapper {
  flex: 1;
  min-height: 0;
  overflow: hidden;
  /* 删除 height: calc(100% - 106px) */
}
```

## 与角色样本的关系

- 角色 `855cec2c` = **形态 A**，见 `role-list-height-fix-855cec2c.md`
- 租户/用户 = **形态 B**，必须 **父 + 子** 两层同时改

## 判定口诀

> 分页在 `index.vue`、表格在 `*Table.vue` → 形态 B，先改父页 flex，再改子表 `:height`。
