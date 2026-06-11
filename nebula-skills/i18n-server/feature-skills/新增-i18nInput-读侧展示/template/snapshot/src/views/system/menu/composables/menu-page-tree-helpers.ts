import type { MenuVO } from "@/types/menu";
import { resolveI18nJsonText } from "@/utils/i18n";

/**
 * 按关键字递归过滤菜单树（Tab 根列表与表格数据源共用）。
 */
export function filterMenusByKeyword(items: MenuVO[], keyword: string, locale?: string): MenuVO[] {
  const normalizedKeyword = keyword.trim().toLowerCase();
  if (!normalizedKeyword) return items;

  return items.reduce<MenuVO[]>((result, item) => {
    const menuName = resolveI18nJsonText(item.name, locale, item.menuName || "").toLowerCase();
    const routeName = (item.routeName || "").toLowerCase();
    const routePath = (item.routePath || "").toLowerCase();
    const component = (item.component || "").toLowerCase();

    const isMatch =
      menuName.includes(normalizedKeyword) ||
      routeName.includes(normalizedKeyword) ||
      routePath.includes(normalizedKeyword) ||
      component.includes(normalizedKeyword);

    const filteredChildren =
      item.children && item.children.length > 0
        ? filterMenusByKeyword(item.children, normalizedKeyword, locale)
        : [];

    if (isMatch || filteredChildren.length > 0) {
      result.push({
        ...item,
        children: filteredChildren,
      });
    }

    return result;
  }, []);
}

/** 从菜单树中移除指定节点（删除后本地乐观更新）。 */
export function removeNodeFromTree(items: MenuVO[], nodeId: string): MenuVO[] {
  return items
    .filter((item) => item.id !== nodeId)
    .map((item) => ({
      ...item,
      children:
        item.children && item.children.length > 0
          ? removeNodeFromTree(item.children, nodeId)
          : item.children,
    }));
}

/** 从过滤后的根菜单列表取某 Tab 的子树。 */
export function getMenuChildrenFromRoots(roots: MenuVO[], parentId: string | undefined): MenuVO[] {
  if (!parentId) return [];
  const rootMenu = roots.find((menu) => menu.id === parentId);
  return rootMenu?.children || [];
}

/** 从过滤后的根菜单列表按 Tab key 取根节点。 */
export function getRootMenuByIdFromRoots(roots: MenuVO[], tabKey: string): MenuVO | undefined {
  return roots.find((menu) => menu.id === tabKey);
}
