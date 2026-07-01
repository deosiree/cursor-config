import { isDirectoryMenuType, isMenuMenuType, isPageMenuType } from "@/enums/system/menu.enum";
import type { MenuVO } from "@/types/menu";
import { trans } from "vue-i18n-kit-sy/runtime";

/** 菜单行操作命令 */
export type MenuRowActionCommand = "edit" | "addChild" | "permissionConfig" | "delete";

/** 菜单行操作 i18n 文案 key */
export const MENU_ROW_ACTION_LABEL = {
  edit: trans("编辑"),
  addChild: trans("新增子项"),
  permissionConfig: trans("权限配置"),
  delete: trans("删除"),
} as const;

/** 菜单行操作项（Tab 下拉与 OperationColumn 共用） */
export type MenuRowActionItem = {
  command: MenuRowActionCommand;
  perm: string;
  icon?: string;
  label: string;
  divided?: boolean;
};

/** runMenuRowAction 的回调集合 */
export type MenuRowActionHandlers = {
  onEdit: (menuId: string) => void;
  onAddChild: (parentId: string) => void;
  onPermissionConfig: (row: MenuVO) => void;
  onDelete: (row: MenuVO) => void;
};

export function isMenuRowActionVisibleForType(row: MenuVO, command: MenuRowActionCommand): boolean {
  switch (command) {
    case "edit":
    case "delete":
      return true;
    case "addChild":
      return isDirectoryMenuType(row.type) || isMenuMenuType(row.type);
    case "permissionConfig":
      return isPageMenuType(row.type);
    default:
      return false;
  }
}

export function getMenuRowActions(
  row: MenuVO,
  hasPerm: (perm: string) => boolean
): MenuRowActionItem[] {
  const candidates: MenuRowActionItem[] = [
    {
      command: "edit",
      perm: "sys:menu:edit",
      icon: "edit",
      label: MENU_ROW_ACTION_LABEL.edit,
    },
    {
      command: "addChild",
      perm: "sys:menu:add",
      icon: "plus",
      label: MENU_ROW_ACTION_LABEL.addChild,
    },
    {
      command: "permissionConfig",
      perm: "sys:menu:edit",
      icon: "Setting",
      label: MENU_ROW_ACTION_LABEL.permissionConfig,
    },
    {
      command: "delete",
      perm: "sys:menu:delete",
      icon: "delete",
      label: MENU_ROW_ACTION_LABEL.delete,
      divided: true,
    },
  ];

  return candidates.filter(
    (action) => hasPerm(action.perm) && isMenuRowActionVisibleForType(row, action.command)
  );
}

export function runMenuRowAction(
  command: MenuRowActionCommand,
  row: MenuVO,
  handlers: MenuRowActionHandlers
): void {
  const menuId = row.id;
  if (!menuId) return;

  switch (command) {
    case "edit":
      handlers.onEdit(menuId);
      break;
    case "addChild":
      handlers.onAddChild(menuId);
      break;
    case "permissionConfig":
      handlers.onPermissionConfig(row);
      break;
    case "delete":
      handlers.onDelete(row);
      break;
    default:
      break;
  }
}
