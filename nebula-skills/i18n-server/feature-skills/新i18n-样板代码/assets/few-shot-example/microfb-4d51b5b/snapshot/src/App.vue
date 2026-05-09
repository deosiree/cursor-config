<template>
  <el-config-provider :locale="locale">
    <!-- 等待路由准备完成，避免布局闪烁 -->
    <!-- <div
      v-if="!isRouterReady"
      class="router-loading"
    ></div> -->
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
          <div class="layout-body">
            <!-- 主应用内容区域（云端） -->
            <router-view v-if="!isSubApp" />

            <!-- 子应用挂载容器（边端） -->
            <div
              ref="subappHost"
              class="subapp-viewport"
            ></div>
          </div>
        </div>
      </div>
    </div>
  </el-config-provider>
</template>

<script lang="ts" setup>
import Header from "@/layout/header/index.vue";
import { computed, ref, onMounted, nextTick, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import type { RouteRecordRaw } from "vue-router";
import { useAppStore } from "@/store";
import { useLangStore } from "@/store/lang";
import BasicMenu from "@/layout/menu/index.vue";
import { useMenuVersionSignal } from "@/services/menu/menu-repo";
import { syncMenuRefresh } from "@/services/menu/menu-sync";
import { Fold, Expand } from "@element-plus/icons-vue";
import { getPersistedAppConfigs, useAppConfigStoreHook } from "@/store/modules/appConfig.store";
import { elementLocales } from "@/i18n/element";

const route = useRoute();
const router = useRouter();
const appStore = useAppStore();
// 基座专用：通过语言 store 驱动 Element Plus locale 响应式切换（子应用通常不在 App 根层处理）
const langStore = useLangStore();
const subappHost = ref<HTMLElement | null>(null);

const appConfigStore = useAppConfigStoreHook();

const subAppRoutePrefixes = computed(() => {
  const list =
    appConfigStore.appList && appConfigStore.appList.length > 0
      ? appConfigStore.appList
      : getPersistedAppConfigs();
  return list
    .filter((a) => a.enabled)
    .map((a) => String(a.activeRule || ""))
    .filter(Boolean)
    .map((p) => p.replace(/\/+$/, ""));
});

function normalizePrefix(prefix: string) {
  const p = prefix.replace(/\/+$/, "");
  return p.startsWith("/cloud/") ? p.slice("/cloud".length) : p;
}

const isSubApp = computed(() => {
  const path = route.path.replace(/\/+$/, "");
  return subAppRoutePrefixes.value.some((prefix) => path.startsWith(normalizePrefix(prefix)));
});

function ensureSubappContainerPlaced() {
  const container = document.getElementById("subapp-container");
  const host = subappHost.value;
  if (!container || !host) return;
  if (container.parentElement !== host) {
    host.appendChild(container);
  }
  container.style.display = "";
}

// 路由是否准备好（防止路由守卫未完成时显示布局导致闪烁）
const isRouterReady = ref(false);
// 等待路由准备完成
router.isReady().then(() => {
  isRouterReady.value = true;
  // 路由准备好后，通知 qiankun 可以启动（如果还没有启动）
  window.dispatchEvent(new CustomEvent("router-ready"));
});

watch(
  () => route.fullPath,
  async () => {
    await nextTick();
    ensureSubappContainerPlaced();
  }
);

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

// 组件挂载时初始化
onMounted(() => {
  ensureSubappContainerPlaced();

  // 初始化菜单
  void refreshRoutes();
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
      width: 200px;
      min-width: 200px;
      overflow: hidden;
      background-color: #fff;
      border-right: 1px solid #e4e7ed;
      transition:
        width 0.3s,
        min-width 0.3s;
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
        align-items: center;
        justify-content: center;
        height: 48px;
        padding: 0 16px;
        color: #000000;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      }

      &__title {
        font-size: 18px;
        font-weight: 700;
        user-select: none;
      }

      &__collapse-icon {
        font-size: 20px;
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

// 子应用容器样式
.subapp-viewport {
  width: 100%;
  height: 100%;
  overflow: auto;
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
