<template>
  <BaseLayout>
    <!-- 宸︿晶鑿滃崟鏍?-->
    <div class="layout__sidebar" :class="{ 'layout__sidebar--collapsed': !isSidebarOpen }">
      <div class="layout-sidebar">
        <!-- 涓昏彍鍗曞唴瀹?-->
        <el-scrollbar>
          <BasicMenu :data="routes" base-path="" />
        </el-scrollbar>
      </div>
    </div>

    <!-- 涓诲唴瀹瑰尯 -->
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

// 甯冨眬鐩稿叧鍙傛暟
const { isShowTagsView, isSidebarOpen } = useLayout();

const routes = constantRoutes;
</script>

<style lang="scss" scoped>
.layout {
  &__sidebar {
    width: $sidebar-width;
    transition: width 0.28s;

    &--collapsed {
      width: $sidebar-width-collapsed;
    }

    .layout-sidebar {
      position: relative;
      height: 100%;
      background-color: #fff;
      transition: width 0.28s;

      &.has-logo {
        .el-scrollbar {
          height: calc(100vh - $navbar-height);
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
