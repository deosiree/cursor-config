# 页面形态与 ColumnFilter 落点

## 形态 A：内联工具栏（设备管理）

- **列状态**：与表格同在 `index.vue`
- **ColumnFilter**：工具栏 `action-buttons` 内
- **表格**：同文件 `v-for="column in visibleColumns"`
- **样本**：[`template/snapshot/`](../template/snapshot/src/views/deviceManage/device/)

适用：单页内工具栏+表格，无子表组件拆分。

## 形态 B：分页 + 子表（租户管理）

- **列状态**：父页 [`tenant/index.vue`](../template/after/src/views/tenant/index.vue)
- **ColumnFilter**：`BaseListToolbar` `#actions` 删除按钮后
- **表格**：[`TenantTable.vue`](../template/after/src/views/tenant/components/TenantTable.vue) 接收 `:visible-columns`
- **样本**：`template/before|after/.../tenant/`

```vue
<!-- index.vue -->
<span v-hasPerm="'sys:tenant:query'" class="column-filter-wrap">
  <ColumnFilter v-model="selectedColumns" :columns="tableColumns" />
</span>
<TenantTable :visible-columns="visibleColumns" ... />
```

## 形态 C：搜索栏插槽（用户管理）

- **列状态**：父页 [`user/index.vue`](../template/after/src/views/system/user/index.vue)
- **ColumnFilter**：经 [`UserSearchBar`](../template/after/src/views/system/user/components/UserSearchBar.vue) 的 **`#actions-extra`** 插槽
- **表格**：[`UserTable.vue`](../template/after/src/views/system/user/components/UserTable.vue) 动态列

```vue
<!-- index.vue -->
<UserSearchBar ...>
  <template #actions-extra>
    <span v-if="toolbarPerms.query" class="column-filter-wrap">
      <ColumnFilter v-model="selectedColumns" :columns="tableColumns" />
    </span>
  </template>
</UserSearchBar>
```

**注意**：`#actions-extra` 为用户模块扩展插槽，其他页面若工具栏在 `BaseListToolbar` 内直接用 `#actions`，勿误抄插槽名。

## 形态 D：表组件自闭环（角色管理）

- **列状态 + ColumnFilter**：均在 [`RoleListTable.vue`](../template/after/src/views/system/role/components/role/RoleListTable.vue)
- **无 selection 列**；无父页传参
- **样本**：`template/before|after/.../role/RoleListTable.vue`

适用：工具栏与表格已封装在同一列表组件内。

## 选型口诀

| 结构 | 选形态 |
|------|--------|
| 工具栏+表在同一文件 | A |
| 父页 + `*Table.vue` + `BaseListToolbar` | B |
| 父页 + 独立 `*SearchBar.vue` | C（需插槽） |
| 列表组件内含工具栏+表 | D |

## BaseListToolbar 间距约定

形态 B/C/D 及 `PageTabShell`（内嵌 `BaseListToolbar`）的间距由 [`BaseListToolbar.vue`](../../../apex_dev/src/components/ListToolbar/BaseListToolbar.vue) 统一维护，业务页勿再加 `ml-12px` 或自定义 filters gap。

| 区域 | 规则 | 像素 |
|------|------|------|
| `__filters` 内表单控件 | `gap` + `align-items: center` | 8px |
| `__filters` ↔ `__actions` | `__tools` 的 `gap` | 12px |
| `__actions` 内按钮 / 列设置 span | `gap` + 清零 EP `.el-button + .el-button` margin | 8px |

形态 A（设备管理）使用 `.search-fields { gap: 8px }` + `.action-buttons` 无 gap + 列设置 `ml-12px`，与上表不同，**勿照搬**到 `BaseListToolbar` 页面。详见 [`anti-patterns.md`](anti-patterns.md) §9。
