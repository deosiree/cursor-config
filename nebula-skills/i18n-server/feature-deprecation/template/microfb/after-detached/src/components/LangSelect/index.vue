<template>
  <el-dropdown trigger="click" @command="handleLanguageChange">
    <span>{{ LOGIN_UI_TEXT.languageToggle }}</span>
  </el-dropdown>
</template>

<script setup lang="ts">
import { LOGIN_UI_TEXT } from "@/constants/ui-text";
import { useLangStore } from "@/stores/lang";

const langStore = useLangStore();

function handleLanguageChange(lang: string) {
  langStore.setLang(lang);
}
</script>
