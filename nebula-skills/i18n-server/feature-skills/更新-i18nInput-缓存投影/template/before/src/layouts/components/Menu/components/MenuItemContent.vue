<template>
  <!-- 菜单图标 -->
  <template v-if="icon">
    <el-icon v-if="isElIcon" class="menu-icon">
      <component :is="iconComponent" />
    </el-icon>
    <div v-else :class="`i-svg:${icon}`" class="menu-icon" />
  </template>
  <template v-else>
    <div class="i-svg:menu menu-icon" />
  </template>
  <!-- 菜单标题 -->
  <span v-if="title" class="ml-[10px]">
    {{ displayTitle }}
  </span>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { resolveI18nText } from "@/utils/i18n";

const props = defineProps<{
  icon?: string;
  title?: string;
}>();

const { locale } = useI18n();

/**
 * 获取到i18n语言后，再获取路由标题
 */
const displayTitle = computed(() => {
  void locale.value;
  return resolveI18nText(props.title);
});

const isElIcon = computed(() => props.icon?.startsWith("el-icon"));
const iconComponent = computed(() => props.icon?.replace("el-icon-", ""));
</script>

<style lang="scss" scoped>
.menu-icon {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  margin-right: 5px;
  font-size: 18px;
  color: currentcolor;
}
</style>
