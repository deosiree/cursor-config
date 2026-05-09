<template>
  <el-dropdown
    class="lang-select-dropdown"
    trigger="click"
    @command="handleLanguageChange"
  >
    <SvgIcon
      name="common-language-chinese"
      v-if="locale === LanguageEnum.ZH_CN"
      width="24"
      height="24"
      :color="iconColor"
    />
    <SvgIcon
      name="common-language-english"
      v-else-if="locale === LanguageEnum.EN"
      width="24"
      height="24"
      :color="iconColor"
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
import { computed } from "vue";
import { useRoute } from "vue-router";
import { useAppStore } from "@/store/modules/app.store";
import { LanguageEnum } from "@/enums/settings/locale.enum";
import { showNotification } from "@/utils";
import SvgIcon from "@/components/SvgIcon/index.vue";
import { LOGIN_PATH } from "@/constants/navigation-paths";
import { setGlobalState } from "@/plugins/qiankun/actions";
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
const route = useRoute();
const { locale, t } = useI18n();

// 根据 URL 路径设置图标颜色：包含 /login 为灰色，其他为白色
const iconColor = computed(() => {
  const isLoginPage = route.path.includes(LOGIN_PATH);
  return isLoginPage ? "#999999" : "#ffffff";
});

/**
 * 处理语言切换
 *
 * @param lang  语言（zh-cn、en）
 */
function handleLanguageChange(lang: string) {
  locale.value = lang;
  appStore.changeLanguage(lang);
  setGlobalState({ language: lang });
  showNotification(t("langSelect.message.success"), { type: "success" });
}
</script>

<style scoped>
.lang-select-dropdown {
  color: #ffffff;
  background-color: transparent;
  border: none;
}

.lang-select-dropdown:focus {
  outline: none;
}

.lang-select-dropdown :deep(.el-dropdown__trigger),
.lang-select-dropdown :deep(.el-tooltip__trigger),
.lang-select-dropdown :deep(.el-dropdown-link) {
  padding: 0;
  outline: none;
  background-color: transparent !important;
  border: none !important;
  box-shadow: none;
}

.lang-select-dropdown :deep(.el-dropdown__trigger:focus),
.lang-select-dropdown :deep(.el-tooltip__trigger:focus),
.lang-select-dropdown :deep(.el-dropdown-link:focus) {
  outline: none;
  border: none;
  box-shadow: none;
}
</style>
