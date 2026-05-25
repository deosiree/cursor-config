<!--
  角色列表操作列 after 片段（摘自 RoleListTable.vue）。
  仅作 skill 复制样本，非独立可运行组件。
-->
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
