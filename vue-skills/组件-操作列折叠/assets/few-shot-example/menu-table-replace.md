# Few-shot：菜单管理操作列替换（树表 + 弹窗内表）

## 用户诉求

「菜单管理是树表，`directory` / `page` 操作按钮不同，行内要露 3 个 + 更多；权限配置、API 配置弹窗里也有操作列。组件已有，不要手写探针表。」

## 前置条件

`OperationColumn` 套件已存在（见 [`operation-column-mvp.md`](operation-column-mvp.md)）。

## Before 问题

- `el-table-column` + 多个 `el-button`，`v-hasPerm` + 内联 svg
- 树表按 `row.type` 用 `v-if` 区分「添加子项」「权限配置」等
- 弹窗内 `PermissionConfigDialog` / `ApiConfigDialog` 各自一套操作列
- 易错：在业务页传 `probe-data-rows` 或枚举 `MenuType` 假行

## After 要点

### 1. 菜单主表（`menu/index.vue`）

树表 `:data` 常按 Tab 切换子集，**`list-data-length` 绑当前 Tab 可见行数**，与 `:data` 同步即可：

```vue
<OperationColumn
  label="操作"
  fixed="right"
  align="left"
  :list-data-length="getMenuChildren(tab.key).length"
  :inline-visible-count="3"
>
  <template #default="{ row }">
    <OpItem
      label="编辑"
      icon="edit"
      perm="sys:menu:edit"
      @click.stop="handleOpenDialog(undefined, row.id)"
    />
    <OpItem
      v-if="isDirectoryMenuType(row.type) || isMenuMenuType(row.type)"
      label="添加子项"
      icon="plus"
      perm="sys:menu:add"
      @click.stop="handleOpenDialog(row.id)"
    />
    <OpItem
      v-if="isPageMenuType(row.type)"
      label="权限配置"
      icon="Setting"
      perm="sys:menu:edit"
      @click.stop="handleOpenPermissionDialog(row)"
    />
    <OpItem
      label="删除"
      icon="delete"
      type="danger"
      perm="sys:menu:delete"
      @click.stop="handleDelete(row.id)"
    />
  </template>
</OperationColumn>
```

- `v-if` 留在 **`OpItem` 上**（与迁移前按钮一致）
- 列上**不要**再写 `width="200"`
- 探针由组件从表数据按 `type` 取样，业务**不传** `probe-data-rows`

### 2. 弹窗内平表（Permission / API）

与主表同构，`:list-data-length="tableData.length"`，`:inline-visible-count="3"`：

```vue
<OperationColumn
  label="操作"
  fixed="right"
  align="center"
  :list-data-length="tableData.length"
  :inline-visible-count="3"
>
  <template #default="{ row }">
    <OpItem label="编辑" icon="edit" perm="sys:menu:edit" @click="handleEditPermission(row)" />
    <!-- 其余 OpItem … -->
  </template>
</OperationColumn>
```

### 3. import

```ts
import OperationColumn from "@/components/OperationColumn/index.vue";
import OpItem from "@/components/OperationColumn/OpItem.vue";
```

## 样本路径

| 场景 | 片段（after 形态，便于复制） |
|------|------------------------------|
| 菜单主表操作列 | [`template/after/.../menu/menu-index-operation-column.fragment.vue`](../../template/after/src/views/system/menu/menu-index-operation-column.fragment.vue) |
| 弹窗内操作列 | [`template/after/.../menu/dialog-tables-operation-column.fragment.vue`](../../template/after/src/views/system/menu/dialog-tables-operation-column.fragment.vue) |

完整页面在目标仓库 `apex_dev/src/views/system/menu/`；本 skill 只沉淀**操作列片段**，不拷贝整页 `index.vue`。

## 列宽探针

- 树表 + 多 `v-if`：组件 DFS 取样 + `row.type` 去重，见 [`references/column-width-probe.md`](../../references/column-width-probe.md)
- 业务只传 `list-data-length`；异步加载后数据到达会自动重探针

## 与租户 / 用户样本的差异

| 点 | 租户 | 用户 | 菜单 |
|----|------|------|------|
| 文案 | `$t` | 硬编码中文 | 硬编码中文 |
| `inline-visible-count` | 1 | 1 | **3**（按产品） |
| `list-data-length` | `data.length` | `data.length` | **`getMenuChildren(tab.key).length`** |
| 结构 | 平表 | 平表 + `v-if` | **树表** + `row.type` 多 `v-if` |

## 推广

平表场景对照 [`tenant-table-replace.md`](tenant-table-replace.md)、[`user-table-replace.md`](user-table-replace.md) 同构替换。
