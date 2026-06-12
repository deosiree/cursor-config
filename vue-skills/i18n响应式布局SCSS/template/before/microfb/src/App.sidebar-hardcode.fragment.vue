<template>
  <el-config-provider :locale="locale">
    <!-- 绛夊緟璺敱鍑嗗瀹屾垚锛岄伩鍏嶅竷灞€闂儊 -->
    <div
      v-if="!isRouterReady"
      class="router-loading"
    ></div>
    <!-- 涓诲簲鐢ㄥ唴瀹瑰尯鍩燂紙浜戠锛?-->
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
          <div
            class="layout-body"
            id="microfb-mount-area"
          >
            <!-- 涓诲簲鐢ㄨ矾鐢辫鍥?-->
            <div
              class="main-app-container"
              :class="{ 'main-app-container--hidden': !shouldShowMainRoute }"
            >
              <router-view />
            </div>

            <!-- 瀛愬簲鐢ㄥ鍣ㄥ尯鍩?-->
            <div class="subapp-container-area">
              <!-- 鏅€氬瓙搴旂敤鎸傝浇瀹瑰櫒锛堜娇鐢?registerApps锛屽鍣ㄥ浐瀹氫负 #subapp-container锛?-->
              <div
                v-if="isNormalAppRoute"
                id="subapp-container"
                class="subapp-viewport"
              ></div>

              <!-- 甯搁┗鍐呭瓨瀛愬簲鐢ㄥ鍣紙鍔ㄦ€佸垱寤猴紝鐢╭iankun鐨刲oadMicroApp 鏂瑰紡 锛?-->
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
// 鍩哄骇涓撶敤锛氶€氳繃璇█ store 椹卞姩 Element Plus locale 鍝嶅簲寮忓垏鎹紙瀛愬簲鐢ㄩ€氬父涓嶅湪 App 鏍瑰眰澶勭悊锛?const langStore = useLangStore();

const appConfigStore = useAppConfigStoreHook();

// 瀛愬簲鐢ㄦ槸鍚︽鍦ㄥ姞杞戒腑
const isLoadingSubApps = ref(true);
// 璺敱璺緞甯搁噺
const MAIN_APP_PATHS = ["/login"];
//鍏煎鐗规畩鐨勮矾鐢憋紝涓轰簡鏂板缓椤甸潰鍋氳烦杞殑锛岄渶瑕佽蛋鍒皊ubapp-container 閲岄潰
const SUB_APP_SPECIAL_PATHS = ["/log-viewer", "/resourceMonitor", "/remote-terminal", "/sh-viewer"];
const ROOT_PATHS = ["/", "/cloud", "/cloud/"];
const ERROR_PATHS = ["/error/", "/403", "/500"];

// 鐩戝惉璺敱鍑嗗鐘舵€佸拰搴旂敤鍔犺浇鐘舵€?router.isReady().then(() => {
  // 绛夊緟涓€灏忔鏃堕棿锛岃瀛愬簲鐢ㄦ湁鏈轰細鍔犺浇
  setTimeout(() => {
    isLoadingSubApps.value = false;
  }, 0);
});

// 璁惧妫€娴嬪拰鐩戝惉
let unwatchDevice: (() => void) | null = null;

// 鍒濆鍖栬澶囩被鍨?const initDevice = () => {
  const device = detectDevice();
  appStore.setDevice(device);
};

// 鐩戝惉璁惧绫诲瀷鍙樺寲
const startWatchDevice = () => {
  unwatchDevice = watchDeviceChange((device) => {
    appStore.setDevice(device);
  });
};

// 鑾峰彇搴旂敤鍒楄〃锛堜紭鍏堜娇鐢?store锛屽惁鍒欎粠缂撳瓨璇诲彇锛?const getAppList = () => {
  return appConfigStore.appList && appConfigStore.appList.length > 0
    ? appConfigStore.appList
    : getPersistedAppConfigs();
};

// 鑾峰彇甯搁┗鍐呭瓨搴旂敤鍒楄〃锛堝彧杩斿洖宸插姞杞界殑搴旂敤锛?const residentApps = computed(() => {
  const list = getAppList();
  if (!Array.isArray(list)) return [];

  // 鍙繑鍥炲凡鍚敤銆佸父椹诲唴瀛樼殑搴旂敤
  return list.filter((a) => a && a.enabled && a.residentMemory);
});

// 鑾峰彇鏅€氬簲鐢紙闈炲父椹诲唴瀛橈級鐨勮矾鐢卞墠缂€
const normalAppPrefixes = computed(() => {
  return getNormalAppPrefixes(getAppList());
});

// 鑾峰彇甯搁┗鍐呭瓨搴旂敤鐨勮矾鐢卞墠缂€锛堝寘鎷湭鍔犺浇鐨勶紝鐢ㄤ簬璺敱鍒ゆ柇锛?const residentAppPrefixes = computed(() => {
  return getResidentAppPrefixes(getAppList());
});

// 浠庡鍣ㄩ€夋嫨鍣ㄤ腑鎻愬彇 ID锛堝幓鎺?# 鍓嶇紑锛?const getContainerId = (container: string): string => {
  return container.startsWith("#") ? container.slice(1) : container;
};

// 鍒ゆ柇鏄惁鏄父椹诲唴瀛樺簲鐢ㄧ殑璺敱
const isResidentAppRoute = (app: any) => {
  return computed(() => isAppRouteMatch(route.path, app.activeRule));
};

// 鍒ゆ柇鏄惁鏄櫘閫氬簲鐢ㄨ矾鐢憋紙Apex銆丱psdeck 绛夐潪甯搁┗鍐呭瓨搴旂敤锛?const isNormalAppRoute = computed(() => {
  return isAnyPrefixMatch(route.path, normalAppPrefixes.value);
});

// 妫€鏌ヨ矾寰勬槸鍚﹀尮閰嶅瓙搴旂敤鍓嶇紑
const isSubAppPath = (path: string, prefixes: string[]): boolean => {
  const normalizedPath = path.replace(/\/+$/, "");
  return prefixes.some((prefix) => {
    const withoutCloud = prefix.replace(/^\/cloud/, "");
    return normalizedPath.startsWith(prefix) || normalizedPath.startsWith(withoutCloud);
  });
};

// 鍒ゆ柇褰撳墠璺敱鏄惁鏄富搴旂敤鑷繁鐨勮矾鐢?const isMainAppRoute = computed(() => {
  const path = route.path;
  const routeName = route.name;

  // 1. 涓诲簲鐢ㄧ殑鏄庣‘璺敱锛堢櫥褰曢〉绛夛級
  if (MAIN_APP_PATHS.some((p) => path.includes(p))) {
    return true;
  }

  // 2. 鏍硅矾寰?  if (ROOT_PATHS.includes(path)) {
    return true;
  }

  // 3. 閿欒椤甸潰锛?03銆?00绛夛紝浣嗕笉鍖呮嫭404锛?  if (ERROR_PATHS.some((p) => path.includes(p)) && !path.includes("/error/404")) {
    return true;
  }

  // 4. 404 椤甸潰鐗规畩澶勭悊
  if (routeName === "404") {
    // 濡傛灉瀛愬簲鐢ㄦ鍦ㄥ姞杞斤紝鏆備笉鏄剧ず404锛堢瓑寰呭瓙搴旂敤鍔犺浇瀹屾垚锛?    if (isLoadingSubApps.value) {
      return false;
    }

    // 妫€鏌ユ槸鍚︽槸瀛愬簲鐢ㄨ矾鐢?    const allSubAppPrefixes = [...normalAppPrefixes.value, ...residentAppPrefixes.value];
    const isSubApp = isSubAppPath(path, allSubAppPrefixes);

    // 濡傛灉鏄瓙搴旂敤璺敱锛屼笉鏄剧ず涓诲簲鐢ㄧ殑404锛堣瀛愬簲鐢ㄨ嚜宸卞鐞嗭級
    return !isSubApp;
  }

  return false;
});

// 鍒ゆ柇鏄惁鏄剧ず涓诲簲鐢ㄨ矾鐢?const shouldShowMainRoute = computed(() => {
  const path = route.path;

  // 1. 濡傛灉鏄富搴旂敤鑷繁鐨勮矾鐢憋紝鐩存帴鏄剧ず
  if (isMainAppRoute.value) {
    return true;
  }

  // 2. 瀛愬簲鐢ㄧ壒娈婅矾寰勶紙log-viewer绛夛級锛屼笉鏄剧ず涓诲簲鐢ㄨ矾鐢?  if (SUB_APP_SPECIAL_PATHS.some((p) => path.includes(p))) {
    return false;
  }

  // 3. 濡傛灉瀛愬簲鐢ㄦ鍦ㄥ姞杞斤紝涓斿綋鍓嶈矾鐢辨槸瀛愬簲鐢ㄨ矾鐢憋紝涓嶆樉绀轰富搴旂敤璺敱
  const allSubAppPrefixes = [...normalAppPrefixes.value, ...residentAppPrefixes.value];
  if (isLoadingSubApps.value && isSubAppPath(path, allSubAppPrefixes)) {
    return false;
  }

  // 4. 榛樿閫昏緫锛氬鏋滀笉鏄瓙搴旂敤璺敱锛屾樉绀轰富搴旂敤璺敱
  return !isSubAppPath(path, allSubAppPrefixes);
});

// 璺敱鏄惁鍑嗗濂斤紙闃叉璺敱瀹堝崼鏈畬鎴愭椂鏄剧ず甯冨眬瀵艰嚧闂儊锛?const isRouterReady = ref(false);
// 绛夊緟璺敱鍑嗗瀹屾垚
router.isReady().then(() => {
  isRouterReady.value = true;
  window.dispatchEvent(new CustomEvent("router-ready"));
});

// 鍒ゆ柇鏄惁闅愯棌宸︿晶鑿滃崟鍜岄《閮ㄧ敤鎴锋爣璇嗭紙URL 鍖呭惈 /log-viewer锛?const shouldHideLayout = computed(() => {
  return (
    route.path.includes("/log-viewer") ||
    route.path.includes("/resourceMonitor") ||
    route.path.includes("/remote-terminal") ||
    route.path.includes("/login") ||
    route.path.includes("/sh-viewer")
  );
});

const locale = computed(() => elementLocales[langStore.lang] || elementLocales["zh-CN"]); // 灏?Element Plus 缁勪欢搴撶殑璇█鐜涓庝綘搴旂敤褰撳墠鐨勮瑷€鐘舵€侊紙langStore锛夎繘琛屽悓姝ャ€傦紙鍚宱psdesk锛?
const routes = ref<RouteRecordRaw[]>([]);

const applyRoutes = (nextRoutes: RouteRecordRaw[]) => {
  routes.value = nextRoutes;
};

const refreshRoutes = () => syncMenuRefresh(applyRoutes);

const menuVersionSignal = useMenuVersionSignal();

/**
 * 鑿滃崟鐗堟湰鍙樺寲鏃讹紝鍒锋柊璺敱
 */
watch(menuVersionSignal, refreshRoutes, { flush: "post" });

/** 瀛愬簲鐢ㄨ彍鍗曠鐞嗛〉榛?Tag锛氫粎鏇存柊渚ф爮灞曠ず锛屼笉閲嶅缓鍔ㄦ€佽矾鐢便€佷笉 replace 褰撳墠椤?*/
function onMenuListUpdatedFromSubApp() {
  applyRoutes(buildMenuRoutesFromCache());
}

// 缁勪欢鎸傝浇鏃跺垵濮嬪寲
onMounted(async () => {
  window.addEventListener(MENU_LIST_UPDATED_EVENT, onMenuListUpdatedFromSubApp); // 鐩戝惉瀛愬簲鐢ㄨ彍鍗曟洿鏂颁簨浠?  // 鍒濆鍖栬澶囩被鍨嬫娴?  initDevice();
  startWatchDevice();

  // 浠庣紦瀛樻仮澶嶅簲鐢ㄩ厤缃?  appConfigStore.initFromCache();

  // 鍒濆鍖栬彍鍗?  void refreshRoutes();

  // 瑙﹀彂 App.vue 鎸傝浇瀹屾垚浜嬩欢锛岄€氱煡man.ts閲岄潰鐨勬櫘閫氬簲鐢ㄨ鎸傝浇浜嗭紝
  // 鍥犱负杩欎釜鏅€氬簲鐢ㄦ槸qiankun绠＄悊澹版槑鍛ㄦ湡锛屾墍浠ラ渶瑕佸湪璺敱鍑嗗濂戒箣鍚庢寕杞?  dispatchAppMounted();

  // 鍔犺浇甯搁┗鍐呭瓨搴旂敤 锛岄渶瑕佽嚜宸辩鐞嗗０鏄庡懆鏈?  const { loadResidentAppsFromCache } = await import("@/plugins/qiankun/subAppManager");
  await loadResidentAppsFromCache();
});

// 缁勪欢鍗歌浇鏃舵竻鐞?onUnmounted(() => {
  window.removeEventListener(MENU_LIST_UPDATED_EVENT, onMenuListUpdatedFromSubApp); // 绉婚櫎鐩戝惉瀛愬簲鐢ㄨ彍鍗曟洿鏂颁簨浠?  // 鍋滄鐩戝惉璁惧绫诲瀷鍙樺寲
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
    /* 涓嶄几缂╋紝淇濇寔鑷韩楂樺害 */
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

// 涓诲簲鐢ㄥ鍣ㄦ牱寮?.main-app-container {
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

// 瀛愬簲鐢ㄥ鍣ㄥ尯鍩?.subapp-container-area {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}

// 瀛愬簲鐢ㄥ鍣ㄦ牱寮?.subapp-viewport {
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

// 璺敱鍔犺浇鏃剁殑鏍峰紡
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
