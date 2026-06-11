import type { RouteRecordRaw } from "vue-router";
import { constantRoutes } from "@/router";
import { store, useUserStoreHook } from "@/store";
import router from "@/router";

import RoleGateway from "@/gateway/system/role/role.gateway";
import EmptyLayout from "@/layouts/views/EmptyLayout.vue";
import { readMenuTree } from "@/services/menu/menu-repo";
import {
  isDirectoryMenuType,
  isMenuOrPageType,
  isFunctionMenuType,
} from "@/enums/system/menu.enum";
import {
  normalizeMenuRedirect,
  normalizeMenuRoutePath,
  resolveTopLevelMenuRedirect,
} from "@/store/modules/menu-route-normalization";

const viewModules = {
  ...import.meta.glob("/src/views/**/*.vue"),
  ...import.meta.glob("@/src/views/**/*.vue"),
};
export function buildRoutesFromMenus(menus: any[] = []): any[] {
  const toBool = (n: any) => n === 1 || n === true;
  const safeJSON = (s: any) => {
    if (typeof s !== "string" || !s) return s ?? null;
    try {
      //返回的是一个key,value的数组
      const keyValueArray = JSON.parse(s.replace(/'/g, '"'));
      //遍历数组 把key当成对象的key,value 当成对象的value,最终返回一个对象
      const result: any = {};
      keyValueArray.forEach((item: any) => {
        result[item.key] = item.value;
      });
      return result;
    } catch {
      return s;
    }
  };

  function pickView(raw: string) {
    // 后端可能给 component 或 routePath，如: 'system/user' | '/system/user' | 'system/user/index'
    let p = String(raw || "").replace(/^\/+/, "");
    if (!p) return null;

    // 如果已经以 .vue 结尾，直接查找
    if (p.endsWith(".vue")) {
      const k1 = `/src/views/${p}`;
      const k2 = `src/views/${p}`;
      return viewModules[k1] || viewModules[k2] || null;
    }

    // 先尝试直接查找 .vue 文件（如: system/user.vue）
    const directPath = `${p}.vue`;
    let k1 = `/src/views/${directPath}`;
    let k2 = `src/views/${directPath}`;
    const result = viewModules[k1] || viewModules[k2];
    if (result) return result;

    // 如果找不到，再尝试 /index.vue（如: system/user/index.vue）
    if (!p.endsWith("/index")) p += "/index";
    p += ".vue";
    k1 = `/src/views/${p}`;
    k2 = `src/views/${p}`;
    return viewModules[k1] || viewModules[k2] || null;
  }

  /**
   * 是否显示组件
   * @param node
   * @param type
   * @returns
   */
  const resolveComponent = (node: any, type: any) => {
    if (isDirectoryMenuType(type)) return EmptyLayout;
    if (isFunctionMenuType(type)) return null;
    if (isMenuOrPageType(type)) {
      const mod = pickView(node.component || node.routePath || "");
      return mod ?? EmptyLayout;
    }
    return EmptyLayout;
  };

  const walk = (nodes: any[], isTop = false): any[] =>
    (nodes || [])
      .filter((n) => n && n.isVisible !== false && !isFunctionMenuType(n.type)) // 只保留显示且非功能项
      .sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0))
      .map((n) => {
        const normalizedType = n.type;
        // 确保路径以 "/" 开头
        const routePath = normalizeMenuRoutePath(n.routePath);
        // 先处理子路由
        const children = walk(n.children || [], false);

        // 确定 redirect
        const redirect = isTop
          ? resolveTopLevelMenuRedirect(n.redirect, routePath, children)
          : normalizeMenuRedirect(n.redirect);

        const route = {
          path: routePath,
          name: n.routeName || n.id,
          redirect,
          component: resolveComponent(n, normalizedType),
          meta: {
            title: n.menuName,
            icon: n.icon || "",
            hidden: n.isVisible === false, // 后端控制显示
            keepAlive: toBool(n.keepAlive),
            alwaysShow: toBool(n.alwaysShow),
            pathParams: safeJSON(n.params),
            id: n.id,
            code: n.code || "",
            type: normalizedType,
          },
          children,
        };
        return route;
      });

  return walk(menus, true);
}

export function buildRoutesFromMenuTreeV2(menus: any[] = []): any[] {
  const toBool = (n: any) => n === 1 || n === true;

  function pickView(raw: string) {
    let p = String(raw || "").replace(/^\/+/, "");
    if (!p) return null;
    if (p.endsWith(".vue")) {
      const k1 = `/src/views/${p}`;
      const k2 = `src/views/${p}`;
      return viewModules[k1] || viewModules[k2] || null;
    }
    const directPath = `${p}.vue`;
    let k1 = `/src/views/${directPath}`;
    let k2 = `src/views/${directPath}`;
    const result = viewModules[k1] || viewModules[k2];
    if (result) return result;
    if (!p.endsWith("/index")) p += "/index";
    p += ".vue";
    k1 = `/src/views/${p}`;
    k2 = `src/views/${p}`;
    return viewModules[k1] || viewModules[k2] || null;
  }

  /**
   * 根据节点类型解析并返回对应的组件
   * @param node - 菜单节点对象，包含类型和组件信息
   * @returns 返回对应类型的组件，如果没有匹配则返回EmptyLayout
   */
  const resolveComponent = (node: any) => {
    // 如果是目录类型，返回EmptyLayout组件
    if (isDirectoryMenuType(node?.type)) return EmptyLayout;
    // 如果是功能类型，返回null
    if (isFunctionMenuType(node?.type)) return null;
    // 尝试获取组件，优先使用node.component，其次使用node.routePath
    const mod = pickView(node.component || node.routePath || "");
    // 如果找到组件则返回，否则返回EmptyLayout
    return mod ?? EmptyLayout;
  };

  const walk = (nodes: any[], isTop = false): any[] =>
    (nodes || [])
      .filter((n) => n && !isFunctionMenuType(n.type))
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
      .map((n) => {
        const routePath = normalizeMenuRoutePath(n.routePath);
        const children = walk(n.children || [], false);
        const redirect = isTop
          ? resolveTopLevelMenuRedirect(n.redirect, routePath, children)
          : normalizeMenuRedirect(n.redirect);

        return {
          path: routePath,
          name: n.routeName || n.id,
          redirect,
          component: resolveComponent(n),
          meta: {
            title: n.name,
            icon: n.icon || "",
            hidden: n.isVisible === false,
            keepAlive: toBool(n.keepAlive),
            alwaysShow: false,
            pathParams: n.params,
            id: n.id,
            code: "",
            type: n.type,
          },
          children,
        };
      });

  return walk(menus, true);
}

export const usePermissionStore = defineStore("permission", () => {
  // 存储所有路由，包括静态路由和动态路由
  const routes = ref<RouteRecordRaw[]>([]);
  // 混合模式左侧菜单路由
  const sideMenuRoutes = ref<RouteRecordRaw[]>([]);
  // 路由是否加载完成
  const routesLoaded = ref(false);
  routes.value = [...constantRoutes];

  function generateRoutes() {
    return new Promise<RouteRecordRaw[]>((resolve, reject) => {
      readMenuTree<any[]>({
        remoteLoader: async () => {
          const menus = await RoleGateway.getRoleMenuList({
            id: <string>useUserStoreHook().userInfo.roleId,
            types: [0, 1],
          });
          return Array.isArray(menus?.result) ? menus.result : [];
        },
      })
        .then(({ menus }) => {
          const dynamicRoutes = buildRoutesFromMenus(menus || []);
          routes.value = [...constantRoutes, ...dynamicRoutes];
          routesLoaded.value = true;
          resolve(dynamicRoutes);
        })
        .catch((error) => {
          console.error("❌ Failed to generate routes:", error);
          routesLoaded.value = false;
          reject(error);
        });
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
    const constantRouteNames = new Set(constantRoutes.map((route) => route.name).filter(Boolean));

    // 从 router 实例中移除动态路由
    routes.value.forEach((route) => {
      if (route.name && !constantRouteNames.has(route.name)) {
        router.removeRoute(route.name);
      }
    });

    // 重置为仅包含常量路由
    routes.value = [...constantRoutes];
    sideMenuRoutes.value = [];
    routesLoaded.value = false;
  };

  return {
    routes,
    sideMenuRoutes,
    routesLoaded,
    generateRoutes,
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
