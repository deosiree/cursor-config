<template>
  <el-dropdown trigger="click" @command="handleLanguageChange">
    <span>{{ currentLabel }}</span>
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item v-for="item in langOptions" :key="item.value" :command="item.value">
          {{ item.label }}
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { useLangStore } from "@/stores/lang";

const { t, locale } = useI18n();
const langStore = useLangStore();

const langOptions = [
  { label: "中文", value: "zh-CN" },
  { label: "English", value: "en-US" },
];

const currentLabel = computed(
  () => langOptions.find((item) => item.value === locale.value)?.label ?? locale.value
);

function handleLanguageChange(lang: "zh-CN" | "en-US") {
  langStore.setLang(lang);
  locale.value = lang;
  console.log(t("切换语言成功！"));
}
</script>
