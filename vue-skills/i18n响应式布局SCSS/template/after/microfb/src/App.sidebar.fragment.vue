<template>
  <el-config-provider :locale="locale">
    <!-- 等待路由准备完成，避免布局闪烁 -->
    <div
      v-if="!isRouterReady"
      class="router-loading"
    ></div>
    <!-- 主应用内容区域（云端） -->
    <div class="layout">
      <div
        v-show="!shouldHideLayout"
        class="layout-header"
      >
        <Header />
      </div>
      <div class="layout-content">
        <div
          v-show="!shouldHideLayout"
          class="layout-sider"
          :class="{ 'layout-sider--collapsed': !appStore.sidebar.opened }"
          :style="
            appStore.sidebar.opened
              ? {
                  width: $localeLayout.sidebarWidth.md,
                  minWidth: $localeLayout.sidebarWidth.md,
                }
              : undefined
          "
        >
          <div class="layout-sider__header">
            <el-icon
              class="layout-sider__collapse-icon"
              @click="appStore.toggleSidebar"
            >
              <Fold v-if="appStore.sidebar.opened" />
              <Expand v-else />
            </el-icon>
          </div>
          <el-scrollbar>
            <BasicMenu
              :data="routes"
              base-path=""
            />
          </el-scrollbar>
        </div>
        <div
          class="layout-content__main"
          :class="{
            'layout-content__main--expanded': !appStore.sidebar.opened,
          }"
        >
          <div
            class="layout-body"
            id="microfb-mount-area"
          >
            <!-- 主应用路由视图 -->
            <div
              class="main-app-container"
              :class="{ 'main-app-container--hidden': !shouldShowMainRoute }"
            >
              <router-view />
            </div>

            <!-- 子应用容器区域 -->
            <div class="subapp-container-area">
              <!-- 普通子应用挂载容器（使用 registerApps，容器固定为 #subapp-container） -->
              <div
                v-if="isNormalAppRoute"
                id="subapp-container"
                class="subapp-viewport"
              ></div>

              <!-- 常驻内存子应用容器（动态创建，用qiankun的loadMicroApp 方式 ） -->
              <div
                v-for="app in residentApps"
                :key="app.name"
                :class="[
                  'subapp-viewport',
                  { 'subapp-viewport--hidden': !isResidentAppRoute(app).value },
                ]"
                :id="getContainerId(app.container)"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </el-config-provider>
</template>

<script lang="ts" setup>
import Header from "@/layout/header/index.vue";
import { computed, ref, onMounted, onUnmounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import type { RouteRecordRaw } from "vue-router";
import { useAppStore } from "@/store";
import { useLangStore } from "@/store/lang";
import BasicMenu from "@/layout/menu/index.vue";
import { MENU_LIST_UPDATED_EVENT, useMenuVersionSignal } from "@/services/menu/menu-repo";
import { buildMenuRoutesFromCache, syncMenuRefresh } from "@/services/menu/menu-sync";
import { Fold, Expand } from "@element-plus/icons-vue";
import { getPersistedAppConfigs, useAppConfigStoreHook } from "@/store/modules/appConfig.store";
import { elementLocales } from "@/i18n/element";
import { detectDevice, watchDeviceChange } from "@/utils/device";
import {
  getNormalAppPrefixes,
  getResidentAppPrefixes,
  isAppRouteMatch,
  isAnyPrefixMatch,
} from "@/plugins/qiankun/utils";
import { dispatchAppMounted } from "@/utils/app-lifecycle";

const route = useRoute();
const router = useRouter();
const appStore = useAppStore();
// 基座专用：通过语言 store 驱动 Element Plus locale 响应式切换（子应用通常不在 App 根层处理）
const langStore = useLangStore();

const appConfigStore = useAppConfigStoreHook();

// 子应用是否正在加载中
const isLoadingSubApps = ref(true);
// 路由路径常量
const MAIN_APP_PATHS = ["/login"];
//兼容特殊的路由，为了新建页面做跳转的，需要走到subapp-container 里面
const SUB_APP_SPECIAL_PATHS = ["/log-viewer", "/resourceMonitor", "/remote-terminal", "/sh-viewer"];
const ROOT_PATHS = ["/", "/cloud", "/cloud/"];
const ERROR_PATHS = ["/error/", "/403", "/500"];

// 监听路由准备状态和应用加载状态
router.isReady().then(() => {
  // 等待一小段时间，让子应用有机会加载
  setTimeout(() => {
    isLoadingSubApps.value = false;
  }, 0);
});

// 设备检测和监听
let unwatchDevice: (() => void) | null = null;

// 初始化设备类型
const initDevice = () => {
  const device = detectDevice();
  appStore.setDevice(device);
};

// 监听设备类型变化
const startWatchDevice = () => {
  unwatchDevice = watchDeviceChange((device) => {
    appStore.setDevice(device);
  });
};

// 获取应用列表（优先使用 store，否则从缓存读取）
const getAppList = () => {
  return appConfigStore.appList && appConfigStore.appList.length > 0
    ? appConfigStore.appList
    : getPersistedAppConfigs();
};

// 获取常驻内存应用列表（只返回已加载的应用）
const residentApps = computed(() => {
  const list = getAppList();
  if (!Array.isArray(list)) return [];

  // 只返回已启用、常驻内存的应用
  return list.filter((a) => a && a.enabled && a.residentMemory);
});

// 获取普通应用（非常驻内存）的路由前缀
const normalAppPrefixes = computed(() => {
  return getNormalAppPrefixes(getAppList());
});

// 获取常驻内存应用的路由前缀（包括未加载的，用于路由判断）
const residentAppPrefixes = computed(() => {
  return getResidentAppPrefixes(getAppList());
});

// 从容器选择器中提取 ID（去掉 # 前缀）
const getContainerId = (container: string): string => {
  return container.startsWith("#") ? container.slice(1) : container;
};

// 判断是否是常驻内存应用的路由
const isResidentAppRoute = (app: any) => {
  return computed(() => isAppRouteMatch(route.path, app.activeRule));
};

// 判断是否是普通应用路由（Apex、Opsdeck 等非常驻内存应用）
const isNormalAppRoute = computed(() => {
  return isAnyPrefixMatch(route.path, normalAppPrefixes.value);
});

// 检查路径是否匹配子应用前缀
const isSubAppPath = (path: string, prefixes: string[]): boolean => {
  const normalizedPath = path.replace(/\/+$/, "");
  return prefixes.some((prefix) => {
    const withoutCloud = prefix.replace(/^\/cloud/, "");
    return normalizedPath.startsWith(prefix) || normalizedPath.startsWith(withoutCloud);
  });
};

// 判断当前路由是否是主应用自己的路由
const isMainAppRoute = computed(() => {
  const path = route.path;
  const routeName = route.name;

  // 1. 主应用的明确路由（登录页等）
  if (MAIN_APP_PATHS.some((p) => path.includes(p))) {
    return true;
  }

  // 2. 根路径
  if (ROOT_PATHS.includes(path)) {
    return true;
  }

  // 3. 错误页面（403、500等，但不包括404）
  if (ERROR_PATHS.some((p) => path.includes(p)) && !path.includes("/error/404")) {
    return true;
  }

  // 4. 404 页面特殊处理
  if (routeName === "404") {
    // 如果子应用正在加载，暂不显示404（等待子应用加载完成）
    if (isLoadingSubApps.value) {
      return false;
    }

    // 检查是否是子应用路由
    const allSubAppPrefixes = [...normalAppPrefixes.value, ...residentAppPrefixes.value];
    const isSubApp = isSubAppPath(path, allSubAppPrefixes);

    // 如果是子应用路由，不显示主应用的404（让子应用自己处理）
    return !isSubApp;
  }

  return false;
});

// 判断是否显示主应用路由
const shouldShowMainRoute = computed(() => {
  const path = route.path;

  // 1. 如果是主应用自己的路由，直接显示
  if (isMainAppRoute.value) {
    return true;
  }

  // 2. 子应用特殊路径（log-viewer等），不显示主应用路由
  if (SUB_APP_SPECIAL_PATHS.some((p) => path.includes(p))) {
    return false;
  }

  // 3. 如果子应用正在加载，且当前路由是子应用路由，不显示主应用路由
  const allSubAppPrefixes = [...normalAppPrefixes.value, ...residentAppPrefixes.value];
  if (isLoadingSubApps.value && isSubAppPath(path, allSubAppPrefixes)) {
    return false;
  }

  // 4. 默认逻辑：如果不是子应用路由，显示主应用路由
  return !isSubAppPath(path, allSubAppPrefixes);
});

// 路由是否准备好（防止路由守卫未完成时显示布局导致闪烁）
const isRouterReady = ref(false);
// 等待路由准备完成
router.isReady().then(() => {
  isRouterReady.value = true;
  window.dispatchEvent(new CustomEvent("router-ready"));
});

// 判断是否隐藏左侧菜单和顶部用户标识（URL 包含 /log-viewer）
const shouldHideLayout = computed(() => {
  return (
    route.path.includes("/log-viewer") ||
    route.path.includes("/resourceMonitor") ||
    route.path.includes("/remote-terminal") ||
    route.path.includes("/login") ||
    route.path.includes("/sh-viewer")
  );
});

const locale = computed(() => elementLocales[langStore.lang] || elementLocales["zh-CN"]); // 将 Element Plus 组件库的语言环境与你应用当前的语言状态（langStore）进行同步。（同opsdesk）

const routes = ref<RouteRecordRaw[]>([]);

const applyRoutes = (nextRoutes: RouteRecordRaw[]) => {
  routes.value = nextRoutes;
};

const refreshRoutes = () => syncMenuRefresh(applyRoutes);

const menuVersionSignal = useMenuVersionSignal();

/**
 * 菜单版本变化时，刷新路由
 */
watch(menuVersionSignal, refreshRoutes, { flush: "post" });

/** 子应用菜单管理页黄 Tag：仅更新侧栏展示，不重建动态路由、不 replace 当前页 */
function onMenuListUpdatedFromSubApp() {
  applyRoutes(buildMenuRoutesFromCache());
}

// 组件挂载时初始化
onMounted(async () => {
  window.addEventListener(MENU_LIST_UPDATED_EVENT, onMenuListUpdatedFromSubApp); // 监听子应用菜单更新事件
  // 初始化设备类型检测
  initDevice();
  startWatchDevice();

  // 从缓存恢复应用配置
  appConfigStore.initFromCache();

  // 初始化菜单
  void refreshRoutes();

  // 触发 App.vue 挂载完成事件，通知man.ts里面的普通应用该挂载了，
  // 因为这个普通应用是qiankun管理声明周期，所以需要在路由准备好之后挂载
  dispatchAppMounted();

  // 加载常驻内存应用 ，需要自己管理声明周期
  const { loadResidentAppsFromCache } = await import("@/plugins/qiankun/subAppManager");
  await loadResidentAppsFromCache();
});

// 组件卸载时清理
onUnmounted(() => {
  window.removeEventListener(MENU_LIST_UPDATED_EVENT, onMenuListUpdatedFromSubApp); // 移除监听子应用菜单更新事件
  // 停止监听设备类型变化
  if (unwatchDevice) {
    unwatchDevice();
  }
});
</script>

<style lang="scss" scoped>
.layout {
  display: flex;
  flex-direction: column;
  width: 100vw;
  height: 100vh;
  overflow: hidden;

  > .logo {
    position: absolute;
    z-index: 10;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 46px;
    padding: 0 16px;
    background-color: var(--el-color-primary);

    span {
      height: 46px;
      font-size: 18px;
      font-weight: bold;
      line-height: 46px;
      color: #ffffff;
    }
  }

  &-header {
    box-sizing: border-box;
    display: flex;
    flex: 0 0 auto;
    align-items: center;
    justify-content: right;
    width: 100%;
    height: 48px;
    /* 不伸缩，保持自身高度 */
    background-color: var(--el-color-primary);
  }

  &-content {
    display: flex;
    flex: 1;
    width: 100%;
    overflow: hidden;

    .layout-sider {
      position: relative;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      background-color: #fff;
      border-right: 1px solid #e4e7ed;
      transition:
        width 0.3s,
        min-width 0.3s;

      :deep(.el-scrollbar) {
        flex: 1;
      }

      :deep(.el-menu--collapse) {
        width: 58px;
      }
      &--collapsed {
        width: 58px;
        min-width: 58px;

        .layout-sider__header {
          justify-content: center;
          padding: 0;
        }
      }

      &__header {
        display: flex;
        flex-shrink: 0;
        align-items: center;
        height: 48px;
        padding: 0 20px;
        color: #000000;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      }

      &__title {
        font-size: 18px;
        font-weight: 700;
        user-select: none;
      }

      &__collapse-icon {
        font-size: 18px;
        cursor: pointer;
        transition: opacity 0.3s;

        &:hover {
          opacity: 0.8;
        }
      }
    }

    &__main {
      display: flex;
      flex: 1;
      flex-direction: column;
      overflow: hidden;
      transition: margin-left 0.3s;

      &--expanded {
        margin-left: 0;
      }
    }
  }

  &-body {
    position: relative;
    box-sizing: border-box;
    flex: 1;
    overflow: hidden;
  }
}

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition:
    opacity 0.3s,
    transform 0.3s;
}

.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

.fade-slide-leave-from,
.fade-slide-enter-to {
  opacity: 1;
  transform: translateX(0);
}

.config-panel {
  position: fixed;
  top: 50%;
  left: 50%;
  z-index: 999;
  border: 10px solid var(--el-border-color);
  transform: translate(-50%, -50%);
}

// 主应用容器样式
.main-app-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: auto;
  z-index: 2;

  &--hidden {
    display: none;
  }
}

// 子应用容器区域
.subapp-container-area {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}

// 子应用容器样式
.subapp-viewport {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: auto;

  &--hidden {
    display: none;
  }
  > div {
    height: 100%;
  }
}

// 路由加载时的样式
.router-loading {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 0;
  width: 100vw;
  height: 100vh;
  background-color: #fff;
}
</style>
