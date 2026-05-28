<!-- microfb：忘记密码重置步 — ForgotStepPanel 传 policy 展示 tips -->
<template>
  <ForgotStepPanel
    :title="$t('重置密码')"
    :password-policy="pwdPolicy"
    @back="onBack"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      :validate-on-rule-change="false"
      size="large"
    >
      <!-- PwdField × 2 + CodeField 等见 LoginForgotPassword / ForgotResetStep -->
    </el-form>
  </ForgotStepPanel>
</template>

<script setup lang="ts">
/**
 * 完整链路见 microfb LoginForgotPassword.vue @ da51cb3c：
 * - onMounted: void getPwdPolicy() 预拉
 * - goToResetStep: await getPwdPolicy() 再 step='reset'
 * - ForgotResetStep :password-policy → ForgotStepPanel → PwdPolicyTip
 */
import { computed, ref } from "vue";
import type { FormInstance } from "element-plus";
import ForgotStepPanel from "@/views/login/components/ForgotStepPanel.vue";
import { pwdConfirmPair, type PwdConfirmCtx, type PwdConfirmPolicy } from "@/utils/formRules";
import SecurityConfigGateway from "@/gateway/security-config.gateway";

const form = ref({ password: "", confirmPassword: "", code: "" });
const formRef = ref<FormInstance>();
const pwdPolicy = ref<PwdConfirmPolicy>();

const pwdCtx: PwdConfirmCtx = {
  getPassword: () => form.value.password ?? "",
  getConfirmPassword: () => form.value.confirmPassword ?? "",
  getFormRef: () => formRef.value,
};

const rules = computed(() => ({
  ...pwdConfirmPair(pwdCtx, { policy: pwdPolicy.value }),
}));

async function getPwdPolicy() {
  if (pwdPolicy.value) return pwdPolicy.value;
  pwdPolicy.value = await SecurityConfigGateway.getPasswordPolicy();
  return pwdPolicy.value;
}

function onBack() {
  /* emit back */
}
</script>
