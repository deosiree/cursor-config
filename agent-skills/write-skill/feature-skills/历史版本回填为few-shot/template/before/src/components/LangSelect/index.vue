<template>
  <el-dropdown trigger="click" @command="handleLanguageChange">
    <div
      v-if="locale === 'zh-cn'"
      class="i-svg:common-language-chinese w-24px h-24px"
      :class="size"
    />
    <div
      v-else-if="locale === 'en'"
      class="i-svg:common-language-english w-24px h-24px"
      :class="size"
    />
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item
          v-for="item in langOptions"
          :key="item.value"
          :disabled="appStore.language === item.value"
          :command="item.value"
        >
          {{ item.label }}
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script setup lang="ts">
import { useAppStore } from "@/store/modules/app.store";
import { LanguageEnum } from "@/enums/settings/locale.enum";
import { setGlobalState } from "@/plugins/qiankun/actions";
import { showNotification } from "@/utils/notification";

defineProps({
  size: {
    type: String,
    required: false,
  },
});

const langOptions = [
  { label: "中文", value: LanguageEnum.ZH_CN },
  { label: "English", value: LanguageEnum.EN },
];

const appStore = useAppStore();
const { locale, t } = useI18n();

/**
 * 处理语言切换
 *
 * @param lang  语言（zh-cn、en）
 */
function handleLanguageChange(lang: string) {
  locale.value = lang;
  appStore.changeLanguage(lang);

  // 如果在 qiankun 场景下运行，同时把语言同步给主应用/其他子应用
  setGlobalState({ language: lang });

  showNotification(t("langSelect.message.success"), { type: "success" });
}
</script>
