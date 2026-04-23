<template>
  <el-dropdown trigger="click" @command="handleLanguageChange">
    <span>{{ t("login.languageToggle") }}</span>
  </el-dropdown>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { useAppStore } from "@/store/modules/app.store";

const appStore = useAppStore();
const { locale, t } = useI18n();

function handleLanguageChange(lang: string) {
  locale.value = lang;
  appStore.changeLanguage(lang);
}
</script>
