<template>
  <BaseLayout>
    <!-- 左侧菜单栏 -->
    <div
      class="layout__sidebar"
      :class="{ 'layout__sidebar--collapsed': !isSidebarOpen }"
      :style="
        isSidebarOpen
          ? { width: $localeLayout.sidebarWidth.md, minWidth: $localeLayout.sidebarWidth.md }
          : undefined
      "
    >
      <div class="layout-sidebar">
        <!-- 主菜单内容 -->
        <el-scrollbar>
          <BasicMenu :data="routes" base-path="" />
        </el-scrollbar>
      </div>
    </div>

    <!-- 主内容区 -->
    <div
      :class="{
        hasTagsView: isShowTagsView,
        'layout__main--collapsed': !isSidebarOpen,
      }"
      class="layout__main"
    >
      <!--      <NavBar />-->
      <AppMain />
    </div>
  </BaseLayout>
</template>

<script setup lang="ts">
import { useLayout } from "../composables/useLayout";
import BaseLayout from "./BaseLayout.vue";
// import NavBar from "../components/NavBar/index.vue";
import AppMain from "../components/AppMain/index.vue";
import BasicMenu from "../components/Menu/BasicMenu.vue";

import { constantRoutes } from "@/router";

// 布局相关参数
const { isShowTagsView, isSidebarOpen } = useLayout();

const routes = constantRoutes;
</script>

<style lang="scss" scoped>
.layout {
  &__sidebar {
    transition: width 0.28s;

    &--collapsed {
      width: $sidebar-width-collapsed;
    }

    .layout-sidebar {
      position: relative;
      display: flex;
      flex-direction: column;
      height: 100%;
      background-color: #fff;
      transition: width 0.28s;

      :deep(.el-scrollbar) {
        flex: 1;
      }

      &.has-logo {
        .el-scrollbar {
          height: calc(100vh - $navbar-height);
        }
      }

      :deep(.el-menu:not(.el-menu--collapse)) {
        width: 100% !important;

        .el-sub-menu__title,
        .el-menu-item {
          min-width: 0;
        }

        .menu-icon {
          flex-shrink: 0;
        }

        .el-sub-menu__title > span,
        .el-menu-item > span {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }

      :deep(.el-menu) {
        border: none;
      }
    }
  }

  &__main {
    width: 100%;
    height: 100%;
    overflow-y: hidden;
    transition: 0.28s;
  }
}
</style>
