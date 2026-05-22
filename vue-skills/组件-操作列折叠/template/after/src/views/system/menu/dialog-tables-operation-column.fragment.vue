<!--
  弹窗内表操作列 after 片段（PermissionConfigDialog / ApiConfigDialog 同构）。
  仅作 skill 复制样本，非独立可运行组件。
-->
<!-- PermissionConfigDialog -->
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

<!-- ApiConfigDialog：列壳与 inline-visible-count 相同，OpItem 文案/事件按业务替换 -->
