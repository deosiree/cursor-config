<template>
  <div class="breadcrumb-container">
    <el-button
      v-if="showBack"
      link
      class="back-button"
      @click="handleBack"
    >
      返回
    </el-button>
    <el-breadcrumb
      v-else
      class="flex-y-center"
    >
      <el-breadcrumb-item
        v-for="(item, index) in breadcrumbs"
        :key="item.path"
      >
        <span
          v-if="item.redirect === 'noredirect' || index === breadcrumbs.length - 1"
          class="color-gray-400"
        >
          {{ resolveI18nText(item.meta.title) }}
        </span>
        <a
          v-else
          @click.prevent="handleLink(item)"
        >
          {{ resolveI18nText(item.meta.title) }}
        </a>
      </el-breadcrumb-item>
    </el-breadcrumb>
  </div>
</template>

<script setup lang="ts">
import { RouteLocationMatched } from "vue-router";
import { compile } from "path-to-regexp";
import { useI18n } from "vue-i18n";
import router from "@/router";
import { REDIRECT_ROUTE_PREFIX, ROOT_PATH } from "@/constants/navigation-paths";

import { resolveI18nText as resolveI18nTextFromUtils } from "@/utils/i18n";

const { locale } = useI18n();

/** 依赖 locale 触发语言切换后重算展示文案 */
function resolveI18nText(title: unknown) {
  void locale.value;
  return resolveI18nTextFromUtils(title);
}

const currentRoute = useRoute();
const pathCompile = (path: string) => {
  const { params } = currentRoute;
  const toPath = compile(path);
  return toPath(params);
};

const breadcrumbs = ref<Array<RouteLocationMatched>>([]);

const showBack = computed(() => {
  // 显示返回按钮的规则：
  // 1) 路由元信息显式声明需要返回按钮
  return Boolean(currentRoute.meta?.showBack);
});

function handleBack() {
  // 优先后退，若无可退记录则回到首页
  if (history.length > 1) {
    router.back();
  } else {
    router.push(ROOT_PATH);
  }
}

function getBreadcrumb() {
  let matched = currentRoute.matched.filter((item) => item.meta && item.meta.title);
  const first = matched[0];
  if (!isDashboard(first)) {
    matched = [{ path: ROOT_PATH, meta: { title: "" } } as any].concat(matched);
  }
  breadcrumbs.value = matched.filter((item) => {
    return item.meta && item.meta.title && item.meta.breadcrumb !== false;
  });
}

function isDashboard(route: RouteLocationMatched) {
  const name = route && route.name;
  if (!name) {
    return false;
  }
  return name.toString().trim().toLocaleLowerCase() === "Dashboard".toLocaleLowerCase();
}

function handleLink(item: any) {
  const { redirect, path } = item;
  if (redirect) {
    router.push(redirect).catch((err) => {
      console.warn(err);
    });
    return;
  }
  router.push(pathCompile(path)).catch((err) => {
    console.warn(err);
  });
}

watch(
  () => currentRoute.path,
  (path) => {
    if (path.startsWith(REDIRECT_ROUTE_PREFIX)) {
      return;
    }
    getBreadcrumb();
  }
);

onBeforeMount(() => {
  getBreadcrumb();
});
</script>

<style lang="scss" scoped>
.breadcrumb-container {
  display: block;
}

.breadcrumb-container :deep(.el-breadcrumb) {
  display: block;
}

.back-button {
  align-self: flex-start;
  font-size: 14px;
}

// 覆盖 element-plus 的样式
.el-breadcrumb__inner,
.el-breadcrumb__inner a {
  font-weight: 400 !important;
}
</style>
