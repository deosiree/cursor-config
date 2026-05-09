<template>
  <button
    type="button"
    class="lang-select-dropdown"
    @click="handleLanguageChange"
  >
    <SvgIcon
      name="common-language-chinese"
      width="24"
      height="24"
      :color="iconColor"
    />
  </button>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import { showNotification } from "@/utils";
import SvgIcon from "@/components/SvgIcon/index.vue";
import { LOGIN_PATH } from "@/constants/navigation-paths";
defineProps({
  size: {
    type: String,
    required: false,
  },
});

const route = useRoute();

// 根据 URL 路径设置图标颜色：包含 /login 为灰色，其他为白色
const iconColor = computed(() => {
  const isLoginPage = route.path.includes(LOGIN_PATH);
  return isLoginPage ? "#999999" : "#ffffff";
});

/**
 * 处理语言切换
 */
function handleLanguageChange() {
  showNotification("多语言切换将在迁移阶段恢复", { type: "info" });
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
