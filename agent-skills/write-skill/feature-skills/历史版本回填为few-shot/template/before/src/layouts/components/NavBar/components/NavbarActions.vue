<template>
  <div :class="['navbar-actions', navbarActionsClass]">
    <template v-if="isDesktop">
      <!-- 全屏 -->
      <div class="navbar-actions__item">
        <Fullscreen />
      </div>
      <!-- 语言选择 -->
      <div class="navbar-actions__item">
        <LangSelect />
      </div>
      <!-- 主题切换-->
      <div class="flex align--center" style="display: none">
        <button
          class="icon-btn cursor-pointer relative inline-flex h-7 w-40px items-center rounded-full border-2 border-transparent bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          @click="handleToggle"
        >
          <span
            class="transform rounded-full shadow-lg ring-0 transition-transform duration-300 ease-in-out"
            :style="{
              display: 'block',
              transition: 'transform 0.3s',
              transform:
                settingsStore.theme === ThemeMode.DARK ? 'translateX(14px)' : 'translateX(0)',
            }"
          >
            <div class="flex h-full w-full items-center justify-items-start">
              <el-icon v-if="settingsStore.theme === ThemeMode.DARK" color="#ffffff">
                <Moon />
              </el-icon>
              <el-icon v-else color="#ffffff">
                <Sunny />
              </el-icon>
            </div>
          </span>
        </button>
      </div>
    </template>

    <!-- 用户菜单 -->
    <div class="navbar-actions__item">
      <el-dropdown trigger="click">
        <div class="user-profile">
          <img
            class="user-profile__avatar"
            :src="userStore.userInfo.headerImg ? userStore.userInfo.headerImg : userIcon"
          />
          <span class="user-profile__name">
            {{ userStore.userInfo.userName }}
          </span>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item @click="handleProfileClick">
              {{ t("navbar.profile") }}
            </el-dropdown-item>
            <el-dropdown-item divided @click="logout">
              {{ t("navbar.logout") }}
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>

    <!-- 系统设置 -->
    <!--    <div-->
    <!--      v-if="defaultSettings.showSettings"-->
    <!--      class="navbar-actions__item"-->
    <!--      @click="handleSettingsClick"-->
    <!--    >-->
    <!--      <div class="i-svg:setting" />-->
    <!--    </div>-->
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";

import { DeviceEnum } from "@/enums/settings/device.enum";
import { useAppStore, useSettingsStore, useUserStore } from "@/store";
import { SidebarColor, ThemeMode } from "@/enums/settings/theme.enum";
import { LayoutMode } from "@/enums";
import Fullscreen from "@/components/Fullscreen/index.vue";

import LangSelect from "@/components/LangSelect/index.vue";
import { buildHostLoginUrl } from "@/utils/auth-mode";
import { LOGIN_PATH, ROOT_PATH } from "@/constants/navigation-paths";
import { APEX_PROFILE_PATH } from "@/constants/route-paths";

import userIcon from "@/assets/icons/user.png";

const settingsStore = useSettingsStore();
// 导入子组件

const { t } = useI18n();
const appStore = useAppStore();
const settingStore = useSettingsStore();
const userStore = useUserStore();

const router = useRouter();

// 是否为桌面设备
const isDesktop = computed(() => appStore.device === DeviceEnum.DESKTOP);

/*
 * 切换模式
 * */
const handleToggle = () => {
  if (settingsStore.theme === ThemeMode.DARK) {
    settingsStore.updateTheme(ThemeMode.LIGHT);
  } else {
    settingsStore.updateTheme(ThemeMode.DARK);
  }
};

/**
 * 打开个人中心页面
 */
function handleProfileClick() {
  router.push({ path: APEX_PROFILE_PATH });
}

// 根据主题和侧边栏配色方案选择样式类
const navbarActionsClass = computed(() => {
  const { theme, sidebarColorScheme, layout } = settingStore;

  // 暗黑主题下，所有布局都使用白色文字
  if (theme === ThemeMode.DARK) {
    return "navbar-actions--white-text";
  }

  // 明亮主题下
  if (theme === ThemeMode.LIGHT) {
    // 顶部布局和混合布局的顶部区域：
    // - 如果侧边栏是经典蓝色，使用白色文字
    // - 如果侧边栏是极简白色，使用深色文字
    if (layout === LayoutMode.TOP || layout === LayoutMode.MIX) {
      if (sidebarColorScheme === SidebarColor.CLASSIC_BLUE) {
        return "navbar-actions--white-text";
      } else {
        return "navbar-actions--dark-text";
      }
    }
  }

  return "navbar-actions--dark-text";
});

/**
 * 退出登录。
 *
 * 跳转策略：
 * 1. 优先跳转基座登录页（桥接模式）；
 * 2. 基座地址未配置时回退本地登录页。
 */
function logout() {
  ElMessageBox.confirm("确定注销并退出系统吗？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
    lockScroll: false,
    buttonSize: "small",
    closeOnClickModal: false,
  }).then(() => {
    userStore.logout().then(() => {
      const hostLoginUrl = buildHostLoginUrl(ROOT_PATH);
      if (hostLoginUrl) {
        window.location.href = hostLoginUrl;
        return;
      }
      router.push(LOGIN_PATH);
    });
  });
}

/**
 * 打开系统设置页面
 */
</script>

<style lang="scss" scoped>
.navbar-actions {
  display: flex;
  align-items: center;
  height: 100%;

  &__item {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 44px; /* 增加最小点击区域到44px，符合人机交互标准 */
    height: 100%;
    min-height: 44px;
    padding: 0 8px;
    text-align: center;
    cursor: pointer;
    transition: all 0.3s;

    // 确保子元素居中
    > * {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    // 确保 Element Plus 组件可以正常工作
    :deep(.el-dropdown),
    :deep(.el-tooltip) {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
    }

    // 图标样式
    :deep([class^="i-svg:"]) {
      font-size: 18px;
      line-height: 1;
      color: $nav-color;
      transition: color 0.3s;
    }
  }

  .user-profile {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    padding: 0 8px;

    &__avatar {
      flex-shrink: 0;
      width: 28px;
      height: 28px;
      border-radius: 50%;
    }

    &__name {
      margin-left: 8px;
      color: var(--el-text-color-regular);
      white-space: nowrap;
      transition: color 0.3s;
    }
  }
}

// 白色文字样式（用于深色背景：暗黑主题、顶部布局、混合布局）
.navbar-actions--white-text {
  .navbar-actions__item {
    :deep([class^="i-svg:"]) {
      color: rgba(255, 255, 255, 1);
    }
  }

  .user-profile__name {
    color: rgba(255, 255, 255, 1);
  }
}
.icon-btn {
  width: 40px;
  height: 24px;
  background: var(--sidebar-background);
  border: 1px solid white;
}

// 深色文字样式（用于浅色背景：明亮主题下的左侧布局）
.navbar-actions--dark-text {
  .user-profile__name {
    color: $nav-color !important;
  }
}

// 确保下拉菜单中的图标不受影响
:deep(.el-dropdown-menu) {
  [class^="i-svg:"] {
    color: var(--el-text-color-regular) !important;

    &:hover {
      color: var(--el-color-primary) !important;
    }
  }
}
</style>
