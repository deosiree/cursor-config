<template>
  <div :class="['navbar-actions', navbarActionsClass]">
    <!-- 全屏 -->
    <!-- <div class="navbar-actions__item">
      <Fullscreen />
    </div> -->
    <!--info-->
    <div class="navbar-actions__item">
      <SvgIcon
        name="common-info"
        width="20"
        height="20"
        color="#ffffff"
      ></SvgIcon>
    </div>

    <!--bell-->

    <div class="navbar-actions__item">
      <SvgIcon
        name="common-bell-white"
        width="20"
        height="20"
      ></SvgIcon>
    </div>
    <div class="navbar-actions__item">
      <LangSelect />
    </div>
    <!-- 主题切换-->
    <!--      <div class="flex align&#45;&#45;center">-->
    <!--        <button-->
    <!--          class="icon-btn cursor-pointer relative inline-flex h-7 w-40px items-center rounded-full border-2 border-transparent bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"-->
    <!--          @click="handleToggle"-->
    <!--        >-->
    <!--          <span-->
    <!--            class="transform rounded-full shadow-lg ring-0 transition-transform duration-300 ease-in-out"-->
    <!--            :style="{-->
    <!--              display: 'block',-->
    <!--              transition: 'transform 0.3s',-->
    <!--              transform:-->
    <!--                settingsStore.theme === ThemeMode.DARK ? 'translateX(14px)' : 'translateX(0)',-->
    <!--            }"-->
    <!--          >-->
    <!--            <div class="flex h-full w-full items-center justify-items-start">-->
    <!--              <el-icon v-if="settingsStore.theme === ThemeMode.DARK" color="#ffffff">-->
    <!--                <Moon />-->
    <!--              </el-icon>-->
    <!--              <el-icon v-else color="#ffffff"><Sunny /></el-icon>-->
    <!--            </div>-->
    <!--          </span>-->
    <!--        </button>-->
    <!--      </div>-->

    <!-- 用户菜单 -->
    <div class="navbar-actions__item">
      <el-dropdown trigger="click">
        <div class="user-profile">
          <img
            class="user-profile__avatar"
            :src="userIcon"
          />
          <span class="user-profile__name">{{ userInfo?.username || "游客" }}</span>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item @click="handleProfileClick">个人中心</el-dropdown-item>
            <el-dropdown-item @click="logout">退出登录</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";

// import Fullscreen from "@/components/Fullscreen/index.vue";
import SvgIcon from "@/components/SvgIcon/index.vue";
import LangSelect from "@/components/LangSelect/index.vue";

import userIcon from "@/assets/icons/user.png";
import { getPersistedAppConfigs, useAppConfigStoreHook } from "@/store/modules/appConfig.store";
import { storeToRefs } from "pinia";
import { useUserStore } from "@/store";
const userStore = useUserStore();
const { userInfo } = storeToRefs(userStore);

const router = useRouter();
const appConfigStore = useAppConfigStoreHook();

function normalizePrefix(prefix: string) {
  const p = String(prefix || "").replace(/\/+$/, "");
  return p.startsWith("/cloud/") ? p.slice("/cloud".length) : p;
}

/**
 * 打开个人中心页面
 */
function handleProfileClick() {
  const list =
    appConfigStore.appList && appConfigStore.appList.length > 0
      ? appConfigStore.appList
      : getPersistedAppConfigs();
  const enabled = list.filter((a) => a.enabled);
  const preferred = enabled.find((a) => a.name === "Apex") || enabled[0] || null;
  if (!preferred) return;
  router.push({ path: `${normalizePrefix(preferred.activeRule)}/profile` });
}

// 根据主题和侧边栏配色方案选择样式类
const navbarActionsClass = computed(() => {
  return "navbar-actions--white-text";
});

/**
 * 退出登录
 */
function logout() {
  ElMessageBox.confirm("确定注销并退出系统吗？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
    lockScroll: false,
  }).then(() => {
    void userStore.logout();
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

    //// 图标样式
    //:deep([class^="i-svg:"]) {
    //  font-size: 18px;
    //  line-height: 1;
    //  color: $nav-color;
    //  transition: color 0.3s;
    //}
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
