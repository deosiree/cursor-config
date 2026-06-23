<template>
  <el-card shadow="hover" class="page-no-permission">
    <el-empty class="page-no-permission__empty" :description="resolvedDescription" />
  </el-card>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";

defineOptions({
  name: "PageNoPermission",
});

const props = defineProps<{
  description?: string;
}>();

const { t } = useI18n();

const resolvedDescription = computed(() => props.description || t("暂无页面访问权限"));
</script>

<style scoped lang="scss">
.page-no-permission {
  width: 100%;
  height: 100%;

  :deep(.el-card__body) {
    height: 100%;
    padding: 13px;
  }

  &__empty {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    min-height: 320px;
  }
}
</style>
