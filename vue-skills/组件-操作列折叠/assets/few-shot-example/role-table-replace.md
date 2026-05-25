# Few-shot：角色表操作列替换

## 用户诉求

「角色列表只有编辑、删除，组件已有，接入 OperationColumn。」

## 前置条件

`OperationColumn` 套件已存在。

## After 要点

```vue
<OperationColumn
  label="操作"
  fixed="right"
  align="left"
  :list-data-length="(list ?? []).length"
  :inline-visible-count="3"
>
  <template #default="{ row }">
    <OpItem label="编辑" icon="edit" perm="sys:role:edit" @click.stop="emit('edit', row)" />
    <OpItem
      label="删除"
      icon="delete"
      type="danger"
      perm="sys:role:delete"
      @click.stop="emit('delete', row)"
    />
  </template>
</OperationColumn>
```

槽位 **3**：2 个 OpItem 时常全行内、无「更多」。

## 样本路径

[`role-list-operation-column.fragment.vue`](../../template/after/src/views/system/role/role-list-operation-column.fragment.vue)

完整表结构见目标仓库 `src/views/system/role/components/role/RoleListTable.vue`（与 fragment 操作列段一致）。
