// 设备管理列设置：脚本片段（真相源 apex_dev device/index.vue，已提交）
// 与表格同文件时：onMounted 首行调用 initSelectedColumns()

/************************* 表格列显示/隐藏 *************************/
const TABLE_COLUMN_LABEL = {
  selection: "选择",
  deviceName: "设备名称",
  deviceKey: "设备ID",
  machineCode: "机器码",
  deviceDesc: "设备描述",
  deviceTypeName: "设备型号",
  status: "设备状态",
  createTime: "创建时间",
  lastOnlineTime: "最后心跳时间",
  address: "地区",
  actions: "操作",
} as const;

const buildTableColumns = () => {
  t("选择");
  t("设备名称");
  t("设备ID");
  t("机器码");
  t("设备描述");
  t("设备型号");
  t("设备状态");
  t("创建时间");
  t("最后心跳时间");
  t("地区");
  t("操作");

  return [
    { prop: "selection", label: TABLE_COLUMN_LABEL.selection, required: true },
    { prop: "deviceName", label: TABLE_COLUMN_LABEL.deviceName, visible: true },
    { prop: "deviceKey", label: TABLE_COLUMN_LABEL.deviceKey, visible: true },
    { prop: "machineCode", label: TABLE_COLUMN_LABEL.machineCode, visible: false },
    { prop: "deviceDesc", label: TABLE_COLUMN_LABEL.deviceDesc, visible: true },
    { prop: "deviceTypeName", label: TABLE_COLUMN_LABEL.deviceTypeName, visible: true },
    { prop: "status", label: TABLE_COLUMN_LABEL.status, visible: true },
    { prop: "createTime", label: TABLE_COLUMN_LABEL.createTime, visible: true },
    { prop: "lastOnlineTime", label: TABLE_COLUMN_LABEL.lastOnlineTime, visible: false },
    { prop: "address", label: TABLE_COLUMN_LABEL.address, visible: false },
    { prop: "actions", label: TABLE_COLUMN_LABEL.actions, required: true },
  ];
};

const tableColumns = ref(buildTableColumns());
const selectedColumns = ref<string[]>([]);

const visibleColumns = computed(() => {
  return tableColumns.value.filter(
    (column) => selectedColumns.value.includes(column.prop) || column.required
  );
});

const initSelectedColumns = () => {
  const storageKey = "device_manage_table_columns";
  const savedColumns = localStorage.getItem(storageKey);

  if (savedColumns) {
    selectedColumns.value = JSON.parse(savedColumns);
  } else {
    selectedColumns.value = tableColumns.value
      .filter((column) => !column.required && column.visible !== false)
      .map((column) => column.prop);
  }
};

watch(
  selectedColumns,
  (newVal) => {
    const storageKey = "device_manage_table_columns";
    localStorage.setItem(storageKey, JSON.stringify(newVal));
  },
  { deep: true }
);

// 表格模板侧：
// <template v-for="column in visibleColumns" :key="column.prop">
//   <el-table-column v-if="column.prop === 'deviceName'" ... />
// </template>
