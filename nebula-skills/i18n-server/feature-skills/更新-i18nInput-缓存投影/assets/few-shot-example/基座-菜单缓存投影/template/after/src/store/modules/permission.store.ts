import type { RouteRecordRaw } from "vue-router";
import { store } from "@/store";
import router from "@/router";
import remain from "@/router/modules/remaining.ts";
import { MenuTypeEnum, normalizeMenuType } from "@/enums/seccenter/menu.v2.enum";
import { readMenuCache } from "@/services/menu/menu-repo";
import Layout from "@/layout/index.vue";
const viewModules = {
  ...import.meta.glob("/src/views/**/*.vue"),
  ...import.meta.glob("@/src/views/**/*.vue"),
};

/**
 * 将后端菜单转为前端路由
 * @param menus 后端返回的菜单数组
 */
export function buildRoutesFromMenus(menus: any[] = []): any[] {
  const toBool = (n: any) => n === 1 || n === true;
  const safeJSON = (s: any) => {
    if (typeof s !== "string" || !s) return s ?? null;
    try {
      return JSON.parse(s.replace(/'/g, '"'));
    } catch {
      return s;
    }
  };

  /**
   * 根据路由路径选择组件
   * @param raw 路由路径
   * @returns 选择的组件
   */
  function pickView(raw: string) {
    // 后端可能给 component 或 routePath，如: 'system/user' | '/system/user' | 'system/user/index'
    let p = String(raw || "").replace(/^\/+/, "");
    if (!p) return null;
    if (!p.endsWith(".vue")) {
      if (!p.endsWith("/index")) p += "/index";
      p += ".vue";
    }
    const candidates = [p];

    // 兼容“路由路径与组件目录层级不一致”的场景
    if (p.startsWith("system/")) {
      candidates.push(p.slice("system/".length));
    } else {
      candidates.push(`system/${p}`);
    }

    for (const candidate of candidates) {
      const k1 = `/src/views/${candidate}`;
      const k2 = `src/views/${candidate}`;
      const mod = viewModules[k1] || viewModules[k2];
      if (mod) return mod;
    }

    return null;
  }

  /**
   * 解析组件
   * @param node 节点
   * @param isTop 是否是顶层节点
   * @returns 解析后的组件
   */
  const resolveComponent = (node: any, isTop: boolean) => {
    if (isTop) return Layout;
    const type = normalizeMenuType(node?.type, MenuTypeEnum.UNSPECIFIED);
    if (type === MenuTypeEnum.FUNCTION) {
      throw new Error(`功能项不得进入侧边栏路由生成器: ${String(node?.id || "")}`);
    }
    if (type === MenuTypeEnum.DIRECTORY) {
      return Layout;
    }
    const mod = pickView(node.component || node.routePath || "");
    return mod ?? (() => import("@/views/error/404.vue"));
  };

  const isFunctionType = (node: any) =>
    normalizeMenuType(node?.type, MenuTypeEnum.UNSPECIFIED) === MenuTypeEnum.FUNCTION;

  const isPageType = (node: any) =>
    normalizeMenuType(node?.type, MenuTypeEnum.UNSPECIFIED) === MenuTypeEnum.PAGE;

  /**
   * 遍历菜单树生成路由
   * @param nodes 菜单树节点
   * @param isTop 是否是顶层节点
   * @returns 生成的路由数组
   */
  const walk = (nodes: any[], isTop = false): any[] =>
    (nodes || [])
      .filter((n) => n && n.isVisible !== false && !isFunctionType(n))
      .sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0))
      .map((n) => {
        const normalizedType = normalizeMenuType(n?.type, MenuTypeEnum.UNSPECIFIED);
        const route = {
          path: n.routePath || "/",
          name: n.routeName || n.id,
          redirect: n.redirect || undefined,
          component: resolveComponent(n, isTop),
          meta: {
            title: n.menuName || "",
            icon: n.icon || "",
            hidden: false, // 菜单显隐由前置 filter 处理，这里固定为 false，可能是为了消费电站的显隐，保留字段
            keepAlive: toBool(n.keepAlive),
            alwaysShow: toBool(n.alwaysShow),
            params: safeJSON(n.params),
            id: n.id,
            code: n.code || "",
            type: normalizedType,
          },
          children: isPageType(n) ? [] : walk(n.children || [], false),
        };
        return route;
      });

  // 顶层（parentId=0）的作为一级路由，统一挂 Layout
  const roots = menus.filter((m) => m.parentId === "0");
  return walk(roots, true);
}
/**
 * 归一化为根路径开头，避免子路由提升为顶层后出现无前导斜杠的非法 path。
 *
 * @param p 待归一化的路由路径
 * @returns 以 `/` 开头的标准路径
 */
function ensureRootPath(p: string) {
  const s = String(p || "");
  return s.startsWith("/") ? s : `/${s}`;
}

/**
 * 判断当前路由节点是否需要注入 Layout 容器组件。
 *
 * @param r 路由节点
 * @returns 当节点含子路由且未显式指定 component 时返回 true
 */
function needsLayout(r: any) {
  // 有子路由且自身不是具体页面组件时，给一个容器
  return Array.isArray(r.children) && r.children.length > 0 && !r.component;
}

/**
 * 根据斜杠规则扁平化路由
 * @param routes 路由数组
 * @returns 扁平化后的路由数组
 */
export function flattenRoutesBySlashRule(routes: any[]): any[] {
  const result: any[] = [];

  for (const r of routes || []) {
    const isRootShown = String(r.name || "").startsWith("/");

    if (isRootShown) {
      // 顶层展示：补容器
      if (needsLayout(r)) r.component = Layout;
      result.push(r);
      continue;
    }

    // 顶层不展示：提升子路由为根
    if (Array.isArray(r.children)) {
      for (const c of r.children) {
        c.path = ensureRootPath(c.path);
        if (needsLayout(c)) c.component = Layout;
        result.push(c);
      }
    }
  }

  return result;
}

/**
 * 权限路由存储
 */
export const usePermissionStore = defineStore("permission", () => {
  const staticRoutes = remain as unknown as RouteRecordRaw[];
  // 存储所有路由，包括静态路由和动态路由
  const routes = ref<RouteRecordRaw[]>([]);
  // 混合模式左侧菜单路由
  const sideMenuRoutes = ref<RouteRecordRaw[]>([]);
  // 路由是否加载完成
  const routesLoaded = ref(false);

  /**
   * 生成动态路由并写入权限路由状态。
   *
   * @returns Promise<RouteRecordRaw[]> 仅返回动态部分（不包含静态路由）
   */
  function generateRoutes() {
    return new Promise<RouteRecordRaw[]>((resolve, reject) => {
      /**
       * 将菜单树应用到 store，并标记路由加载完成。
       *
       * @param menus 后端或缓存返回的菜单树
       */
      const applyMenus = (menus: any[]) => {
        const dynamicRoutes = buildRoutesFromMenus(menus || []);
        const rootRoutes = flattenRoutesBySlashRule(dynamicRoutes);
        routes.value = [...staticRoutes, ...rootRoutes];
        routesLoaded.value = true;
        resolve(dynamicRoutes);
      };

      try {
        const cachedMenus = readMenuCache().menus;
        applyMenus(Array.isArray(cachedMenus) ? cachedMenus : []);
      } catch (error) {
        console.error("❌ Failed to generate routes:", error);
        routesLoaded.value = false;
        reject(error);
      }
    });
  }

  /**
   * 根据父菜单路径设置侧边菜单
   *
   * @param parentPath 父菜单的路径，用于查找对应的菜单项
   */
  const updateSideMenu = (parentPath: string) => {
    const matchedItem = routes.value.find((item) => item.path === parentPath);
    if (matchedItem && matchedItem.children) {
      sideMenuRoutes.value = matchedItem.children;
    }
  };

  /**
   * 重置路由
   */
  const resetRouter = () => {
    // 创建常量路由名称集合，用于O(1)时间复杂度的查找
    const constantRouteNames = new Set(staticRoutes.map((route) => route.name).filter(Boolean));

    // 从 router 实例中移除动态路由
    let removedCount = 0;
    const allRoutes = router.getRoutes(); // 从 router 实例获取所有路由
    allRoutes.forEach((route) => {
      if (!route.name) return;
      if (typeof route.name !== "string") return;
      if (!constantRouteNames.has(route.name)) {
        router.removeRoute(route.name);
        removedCount++;
      }
    });

    console.log(
      `[PermissionStore] 已移除 ${removedCount} 个动态路由，剩余 ${router.getRoutes().length} 个路由`
    );

    // 重置为仅包含常量路由
    routes.value = [...staticRoutes];
    sideMenuRoutes.value = [];
    routesLoaded.value = false;
  };

  /**
   * 基于当前菜单缓存重建动态路由（不刷新页面）。
   */
  const reloadRoutesFromCache = async () => {
    resetRouter();
    const dynamicRoutes = await generateRoutes();
    dynamicRoutes.forEach((route: RouteRecordRaw) => {
      router.addRoute(route);
    });
    return dynamicRoutes;
  };

  return {
    routes,
    sideMenuRoutes,
    routesLoaded,
    generateRoutes,
    reloadRoutesFromCache,
    updateSideMenu,
    resetRouter,
  };
});

/**
 * 导出此hook函数用于在非组件环境(如其他store、工具函数等)中获取权限store实例
 *
 * 在组件中可直接使用usePermissionStore()，但在组件外部需要传入store实例
 * 此函数简化了这个过程，避免每次都手动传入store参数
 */
export function usePermissionStoreHook() {
  return usePermissionStore(store);
}
