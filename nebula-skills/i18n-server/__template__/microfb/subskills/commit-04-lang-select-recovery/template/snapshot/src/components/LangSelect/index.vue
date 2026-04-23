<template>
  <el-dropdown
    trigger="click"
    @command="handleLanguageChange"
  >
    <button
      type="button"
      class="lang-select-dropdown"
    >
      <SvgIcon
        name="common-language-chinese"
        width="24"
        height="24"
        :color="iconColor"
      />
    </button>
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item
          v-for="item in _langOptions"
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
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute } from "vue-router";
import { showNotification } from "@/utils";
import SvgIcon from "@/components/SvgIcon/index.vue";
import { LOGIN_PATH } from "@/constants/navigation-paths";
import { useLangStore } from "@/store/lang";
import { langOptions, type Lang } from "@/i18n/messages";
defineProps({
  size: {
    type: String,
    required: false,
  },
});

const route = useRoute();
const langStore = useLangStore();
const { t } = useI18n();

// 根据 URL 路径设置图标颜色：包含 /login 为灰色，其他为白色
const iconColor = computed(() => {
  const isLoginPage = route.path.includes(LOGIN_PATH);
  return isLoginPage ? "#999999" : "#ffffff";
});
const _langOptions = computed(() => langOptions);

/**
 * 处理语言切换
 */
function handleLanguageChange(lang: Lang) {
  if (langStore.lang === lang) return;
  langStore.setLang(lang);
  showNotification(t("切换语言成功"), { type: "success" });
}
</script>

<style scoped>
.lang-select-dropdown {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  color: #ffffff;
  background-color: transparent;
  border: none;
  cursor: pointer;
}

.lang-select-dropdown:focus {
  outline: none;
}
</style>
