<!--
  菜单主表操作列 after 片段（摘自 menu/index.vue）。
  仅作 skill 复制样本，非独立可运行组件。
-->
<OperationColumn
  label="操作"
  fixed="right"
  align="center"
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
