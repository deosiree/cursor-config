import { computed } from "vue";
import i18n from "@/i18n";
import { useTableColumnSettings, type TableColumnDef } from "@/composables/useTableColumnSettings";

function t(key: string): string {
  return String(i18n.global.t(key));
}

/** localStorage 列可见性缓存 key（与历史 menu 页兼容） */
export const MENU_COLUMN_STORAGE_KEY = "menu_manage_table_columns";

/** 菜单表格列头 i18n 文案 key */
export const MENU_TABLE_COLUMN_LABEL = {
  menuName: "菜单名称",
  type: "类型",
  routePath: "路由路径",
  sort: "排序",
  isVisible: "显示状态",
  isSystemOnly: "仅平台显示",
  actions: "操作",
} as const;

/** 菜单表格列 prop 联合类型 */
export type MenuTableColumnProp = keyof typeof MENU_TABLE_COLUMN_LABEL;

/**
 * 构建菜单表格列元数据（供 ColumnFilter 与 visibleColumns 使用）。
 * 内含 t() 调用供 i18n-extract 扫描。
 */
export function buildMenuTableColumns(): TableColumnDef[] {
  t(MENU_TABLE_COLUMN_LABEL.menuName);
  t(MENU_TABLE_COLUMN_LABEL.type);
  t(MENU_TABLE_COLUMN_LABEL.routePath);
  t(MENU_TABLE_COLUMN_LABEL.sort);
  t(MENU_TABLE_COLUMN_LABEL.isVisible);
  t(MENU_TABLE_COLUMN_LABEL.isSystemOnly);
  t(MENU_TABLE_COLUMN_LABEL.actions);

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
