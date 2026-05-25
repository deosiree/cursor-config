<!--
  弹窗内表操作列 after 片段（PermissionConfigDialog / ApiConfigDialog）。
  仅作 skill 复制样本，非独立可运行组件。
-->
<!-- PermissionConfigDialog：3 槽位（2 行内 + 更多） -->
<OperationColumn
  label="操作"
  fixed="right"
  align="center"
  :list-data-length="tableData.length"
  :inline-visible-count="3"
>
  <template #default="{ row }">
    <OpItem
      label="编辑"
      icon="edit"
      perm="sys:menu:edit"
      @click="handleEditPermission(row)"
    />
    <OpItem
      label="API配置"
      icon="Setting"
      perm="sys:menu:configApi"
      @click="handleOpenApiDialog(row)"
    />
    <OpItem
      label="删除"
      icon="delete"
      type="danger"
      perm="sys:menu:delete"
      @click="handleDeletePermission(row.id)"
    />
  </template>
</OperationColumn>

<!-- ApiConfigDialog：4 槽位（3 行内 + 更多） -->
<OperationColumn
  label="操作"
  fixed="right"
  align="center"
  :list-data-length="tableData.length"
  :inline-visible-count="4"
>
  <template #default="{ row }">
    <OpItem
      label="编辑"
      icon="edit"
      perm="sys:menu:configApi"
      @click="handleEditApi(row)"
    />
    <OpItem
      label="删除"
      icon="delete"
      type="danger"
      perm="sys:menu:configApi"
      @click="handleDeleteApi(row.id)"
    />
  </template>
</OperationColumn>
