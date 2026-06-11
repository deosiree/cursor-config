<template>
  <!-- 菜单图标 -->
  <template v-if="icon">
    <el-icon
      v-if="isElIcon"
      class="menu-icon"
    >
      <component :is="iconComponent" />
    </el-icon>
    <svg-icon
      v-else
      :name="icon"
      class="icon-item"
      width="18"
      height="18"
    />
  </template>
  <!-- 菜单标题 -->
  <span
    v-if="title"
    :class="isElIcon ? 'menu-title1' : 'menu-title'"
  >
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
  width: 18px !important;
  height: 18px !important;
  color: currentcolor;
  margin-right: 0 !important;
}
.menu-title {
  margin-left: 10px;
}
.menu-title1 {
  margin-left: 10px;
}
</style>
