<template>
  <el-dropdown trigger="click" @command="handleLanguageChange">
    <div
      v-if="langStore.lang === 'zh-CN'"
      class="i-svg:common-language-chinese w-24px h-24px"
      :class="size"
    />
    <div
      v-else-if="langStore.lang === 'en-US'"
      class="i-svg:common-language-english w-24px h-24px"
      :class="size"
    />
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item
          v-for="item in langOptions"
          :key="item.value"
          :disabled="langStore.lang === item.value"
          :command="item.value"
        >
          {{ item.label }}
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { langOptions, type Lang } from "@/i18n/messages";
import { setGlobalState } from "@/plugins/qiankun/actions";
import { useLangStore } from "@/store/modules/lang.store";
import { showNotification } from "@/utils/notification";

defineProps({
  size: {
    type: String,
    required: false,
  },
});

const { t } = useI18n();
const langStore = useLangStore();

/**
 * 处理语言切换
 *
 * @param lang  语言（zh-CN、en-US）
 */
function handleLanguageChange(lang: Lang) {
  langStore.setLang(lang);

  // 如果在 qiankun 场景下运行，同时把语言同步给主应用/其他子应用
  setGlobalState({ language: lang });

  showNotification(t("语言切换成功"), { type: "success" });
}
</script>
