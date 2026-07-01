import { computed } from "vue";
import { useTableColumnSettings, type TableColumnDef } from "@/composables/useTableColumnSettings";
import { trans } from "vue-i18n-kit-sy/runtime";

/** localStorage 列可见性缓存 key（与历史 menu 页兼容） */
export const MENU_COLUMN_STORAGE_KEY = "menu_manage_table_columns";

/** 菜单表格列头 i18n 文案 key */
export const MENU_TABLE_COLUMN_LABEL = {
  menuName: trans("菜单名称"),
  type: trans("类型"),
  routePath: trans("路由路径"),
  sort: trans("排序"),
  isVisible: trans("显示状态"),
  isSystemOnly: trans("仅平台显示"),
  actions: trans("操作"),
} as const;

/** 菜单表格列 prop 联合类型 */
export type MenuTableColumnProp = keyof typeof MENU_TABLE_COLUMN_LABEL;

/** 构建菜单表格列元数据（供 ColumnFilter 与 visibleColumns 使用） */
export function buildMenuTableColumns(): TableColumnDef[] {
  return [
    { prop: "menuName", label: MENU_TABLE_COLUMN_LABEL.menuName, visible: true },
    { prop: "type", label: MENU_TABLE_COLUMN_LABEL.type, visible: true },
    { prop: "routePath", label: MENU_TABLE_COLUMN_LABEL.routePath, visible: true },
    { prop: "sort", label: MENU_TABLE_COLUMN_LABEL.sort, visible: true },
    { prop: "isVisible", label: MENU_TABLE_COLUMN_LABEL.isVisible, visible: true },
    { prop: "isSystemOnly", label: MENU_TABLE_COLUMN_LABEL.isSystemOnly, visible: true },
    { prop: "actions", label: MENU_TABLE_COLUMN_LABEL.actions, required: true },
  ];
}

export function useMenuTableColumns() {
  const settings = useTableColumnSettings(MENU_COLUMN_STORAGE_KEY, buildMenuTableColumns);

  const visibleColumnProps = computed(() =>
    settings.visibleColumns.value.map((column) => column.prop)
  );

  return {
    ...settings,
    visibleColumnProps,
  };
}
