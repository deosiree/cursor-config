<template>
  <!-- 布局大小 -->
  <el-tooltip :content="t('布局大小')" effect="dark" placement="bottom">
    <el-dropdown trigger="click" @command="handleSizeChange">
      <div class="i-svg:size" />
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item
            v-for="item of sizeOptions"
            :key="item.value"
            :disabled="appStore.size == item.value"
            :command="item.value"
          >
            {{ item.label }}
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </el-tooltip>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { ComponentSize } from "@/enums/settings/layout.enum";
import { useAppStore } from "@/store/modules/app.store";
import { showNotification } from "@/utils/notification";

const { t } = useI18n();

const sizeOptions = computed(() => {
  return [
    { label: t("默认"), value: ComponentSize.DEFAULT },
    { label: t("大型"), value: ComponentSize.LARGE },
    { label: t("小型"), value: ComponentSize.SMALL },
  ];
});

const appStore = useAppStore();
function handleSizeChange(size: string) {
  appStore.changeSize(size);
  showNotification(t("布局大小切换成功"), { type: "success" });
}
</script>
