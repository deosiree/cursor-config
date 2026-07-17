/**
 * 菜单 path 唯一性（文档口径，无 i18n 依赖）。
 */

const DIR_OR_PAGE = new Set(["directory", "page"]);

function findNodeById(nodes, id) {
  const target = String(id);
  const walk = (list = []) => {
    for (const n of list) {
      if (n.id != null && String(n.id) === target) return n;
      if (n.children?.length) {
        const hit = walk(n.children);
        if (hit) return hit;
      }
    }
    return null;
  };
  return walk(Array.isArray(nodes) ? nodes : []);
}

/** 扁平收集 directory/page 非空 routePath */
export function flatPaths(nodes) {
  const items = [];
  const walk = (list = []) => {
    for (const node of list) {
      const path = String(node.routePath ?? "").trim();
      if (path && DIR_OR_PAGE.has(String(node.type ?? ""))) {
        items.push({
          id: node.id != null ? String(node.id) : "",
          routePath: path,
        });
      }
      if (node.children?.length) walk(node.children);
    }
  };
  walk(Array.isArray(nodes) ? nodes : []);
  return items;
}

/** directory/page：同项目 routePath 不得与其它 dir/page 精确重复 */
export function chkPathDup(pathRaw, excludeId, nodes) {
  const routePath = String(pathRaw ?? "").trim();
  if (!routePath) return;
  const excludeIdStr = excludeId == null ? "" : String(excludeId);
  const exists = flatPaths(nodes).some((it) => {
    if (!it.routePath) return false;
    if (excludeIdStr && it.id && it.id === excludeIdStr) return false;
    return it.routePath === routePath;
  });
  if (exists) {
    throw new Error("当前项目下的路由路径已存在");
  }
}

/** function：routePath 不得与父链上任一节点 routePath 相同 */
export function chkAncPath(pathRaw, parentId, nodes) {
  const routePath = String(pathRaw ?? "").trim();
  if (!routePath) return;
  if (parentId == null || parentId === "") return;

  const tree = Array.isArray(nodes) ? nodes : [];
  let currentParentId = parentId;
  while (currentParentId != null && currentParentId !== "") {
    const parent = findNodeById(tree, currentParentId);
    if (!parent) break;
    const parentPath = String(parent.routePath ?? "").trim();
    if (parentPath && parentPath === routePath) {
      throw new Error("不能与父链上的路由路径相同");
    }
    currentParentId = parent.parentId;
  }
}
