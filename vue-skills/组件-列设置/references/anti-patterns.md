# 反模式

## 1. v-hasPerm 挂在 ColumnFilter 根组件

**错误**：`<ColumnFilter v-hasPerm="'sys:tenant:query'" ... />`

**正确**：权限包在原生节点上

```vue
<span v-hasPerm="'sys:tenant:query'" class="column-filter-wrap">
  <ColumnFilter v-model="selectedColumns" :columns="tableColumns" />
</span>
```

设备/租户/角色用 `v-hasPerm`；用户模块用 `v-if="toolbarPerms.query"`（与搜索按钮一致）。`BaseListToolbar` 场景下 **勿加 `ml-12px`**，间距由组件 `gap` 统一管理；设备管理页使用无 gap 的 `.action-buttons`，才需要 `ml-12px`。

## 2. buildTableColumns 未调用 t()

label 常量不会进入 i18n 抽取。须在 `buildTableColumns` 内对每个列名执行 `t("列名")`。

## 3. 只改工具栏不改表格

加了 `ColumnFilter` 但 `el-table-column` 仍硬编码 → 勾选无效果。必须 `visibleColumns` 驱动 `v-for`。

## 4. required 列可被取消

选择列、操作列必须 `required: true`，否则用户可隐藏导致无法操作。

## 5. localStorage 无非法 prop 过滤

列定义变更后旧缓存含未知 prop，直接 `JSON.parse` 赋值可能导致空表。应对 `validProps` 取交集（见 [`localStorage-keys.md`](localStorage-keys.md)）。

## 6. 误用用户模块插槽名

`#actions-extra` 仅适用于 `UserSearchBar`。`BaseListToolbar` 页面应直接写在 `#actions` 内。

## 7. 与本 skill 混淆的需求

| 用户说法 | 应路由 |
|----------|--------|
| 操作列折叠到「更多」 | `组件-操作列折叠` |
| 表格高度、分页被裁切 | `layout-fixedHeadTail-adaptiveMiddle` |
| 批量改业务文案 i18n | `i18n-server` |

## 8. 动态列丢失原 slot

迁移时须按 `column.prop` 分支保留：状态 `el-tag`、日期 `formatDateTime`、`OperationColumn` 等，仅改渲染方式不改业务逻辑。

## 9. BaseListToolbar 场景误加 ml-12px

**错误**：`class="column-filter-wrap ml-12px"`（租户/用户/角色/菜单等走 `BaseListToolbar` 的页面）

**原因**：`BaseListToolbar.__actions` 已有 `gap: 8px` 并清零 EP 相邻按钮 `margin-left`。再叠 `ml-12px` 会让列设置间距变为 8+12≈20px，与按钮之间不一致，也和设备管理页的 12px 语义不同。

**正确**：仅 `column-filter-wrap`，间距交给 `BaseListToolbar`：

```vue
<span v-hasPerm="'sys:tenant:query'" class="column-filter-wrap">
  <ColumnFilter v-model="selectedColumns" :columns="tableColumns" />
</span>
```

设备管理页（`.action-buttons` 无 flex gap）仍用 `ml-12px`，见 [`device/index.vue`](../../../apex_dev/src/views/deviceManage/device/index.vue)。
