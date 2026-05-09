<template>
  <el-config-provider :locale="elementLocale" :size="size">
    <div id="apex-app">
      <QianKunLayout v-if="isQiankunEnv()">
        <router-view />
      </QianKunLayout>
      <LeftLayout v-else />
    </div>
  </el-config-provider>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useAppStore } from "@/store";
import { useLangStore } from "@/store/modules/lang.store";
import { ComponentSize } from "@/enums/settings/layout.enum";
import { elementLocales } from "@/i18n/element";
import { isQiankunEnv } from "@/plugins/qiankun";
import LeftLayout from "@/layouts/views/LeftLayout.vue";
import QianKunLayout from "@/layouts/views/QianKunLayout.vue";

const appStore = useAppStore();
const langStore = useLangStore();
langStore.init();

const size = computed(() => appStore.size as ComponentSize);
const elementLocale = computed(() => elementLocales[langStore.lang] ?? elementLocales["zh-CN"]);
</script>
