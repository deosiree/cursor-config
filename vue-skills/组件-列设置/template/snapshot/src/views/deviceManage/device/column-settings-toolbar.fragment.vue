<!-- 设备管理列设置：工具栏片段（真相源 apex_dev device/index.vue，已提交） -->
<!-- 列过滤组件：v-hasPerm 须包在原生节点上，避免挂在 ColumnFilter 根组件 -->
<span v-hasPerm="'deviceManage:device:query'" class="column-filter-wrap ml-12px">
  <ColumnFilter v-model="selectedColumns" :columns="tableColumns" />
</span>
