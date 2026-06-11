<!-- 安全配置 -->
<template>
  <div class="app-container security-config">
    <el-card shadow="hover" class="bg-white bottom-container data-table h-full">
      <PageTabShell v-model="activeTab" :tabs="visibleSecurityTabItems" tab-label-max-width="200px">
        <template #toolbarTitle>
          {{ $t("安全配置") }}
        </template>
        <template #tabContent="{ tab }">
          <!-- 登录策略 -->
          <LoginPolicyCard
            v-if="tab.key === 'login'"
            :security-config="securityForm"
            @update:security-config="Object.assign(securityForm, $event)"
          />
          <!-- 密码策略 -->
          <PasswordPolicyCard
            v-else-if="tab.key === 'password'"
            :security-config="securityForm"
            @update:security-config="Object.assign(securityForm, $event)"
          />
          <!-- 会话策略 -->
          <SessionPolicyCard
            v-else-if="tab.key === 'session'"
            :session-config="sessionForm"
            @update:session-config="Object.assign(sessionForm, $event)"
          />
        </template>
      </PageTabShell>

      <div v-if="canSave" class="actions">
        <!-- 保存配置 -->
        <FormActionButtons
          :loading="saving"
          :show-cancel="isDirty"
          :decorated="false"
          :save-text="$t('保存')"
          :cancel-text="$t('取消')"
          @cancel="discardChanges"
          @reset="reload"
          @save="save"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import type { PageTabShellTabItem } from "@/components/PageTabShell/index.vue";
import FormActionButtons from "@/components/FormActionButtons/index.vue";
import PageTabShell from "@/components/PageTabShell/index.vue";
import LoginPolicyCard from "./components/LoginPolicyCard.vue";
import PasswordPolicyCard from "./components/PasswordPolicyCard.vue";
import SessionPolicyCard from "./components/SessionPolicyCard.vue";
import { useSecurityConfigPage } from "./useSecurityConfigPage";

defineOptions({
  name: "安全配置",
  inheritAttrs: false,
});

const { t } = useI18n();

const securityTabItems = computed<PageTabShellTabItem[]>(() => [
  { key: "login", label: t("登录策略") },
  { key: "password", label: t("密码策略") },
  { key: "session", label: t("会话策略") },
]);

const {
  activeTab,
  canEditSecurity,
  canEditSession,
  canSave,
  discardChanges,
  isDirty,
  reload,
  save,
  saving,
  securityForm,
  sessionForm,
} = useSecurityConfigPage();

const visibleSecurityTabItems = computed(() =>
  securityTabItems.value.filter((tab) => {
    if (tab.key === "session") return canEditSession.value;
    return canEditSecurity.value;
  })
);

onMounted(() => {
  reload(); // 重新加载配置
});
</script>

<style scoped>
.app-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.security-config :deep(.el-card__body) {
  display: flex;
  flex-direction: column;
  height: 100% !important;
  overflow: hidden;
}

.bottom-container {
  display: flex;
  flex: 1;
  flex-direction: column;
  height: 100%;
}

.actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  padding-bottom: 16px;
  margin-top: 8px;
}
</style>
