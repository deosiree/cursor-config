<template>
  <ForgotVerifyStep
    v-if="step === 'verify'"
    ref="verifyStepRef"
    :form="form"
    :rules="verifyRules"
    :captcha-placeholder="$t('请输入图形验证码')"
    :captcha-loading="captchaLoading"
    :captcha-src="captchaBase64"
    :captcha-success="captchaSendSuccess"
    :countdown="countdown"
    :send-disabled="countdown > 0 || !form.account.trim() || !form.captchaAnswer.trim()"
    @send-code="handleSendCode"
    @refresh-captcha="refreshCaptcha"
    @next="goToResetStep"
    @back="emit('back')"
  />

  <ForgotResetStep
    v-else
    ref="resetStepRef"
    :form="form"
    :rules="resetRules"
    :caps-lock-visible="isCapsLock"
    :caps-lock-content="$t('大写锁定已开启')"
    @password-keyup="checkCapsLock"
    @confirm="handleConfirmReset"
    @back="emit('back')"
  />
</template>

<script setup lang="ts">
import { computed, onUnmounted, reactive, ref } from "vue";
import type { FormRules } from "element-plus";
import { useI18n } from "vue-i18n";

import AuthGateway, { type LoginSettingV2Response } from "@/api/gateway/auth.gateway";
import { resolvePasswordForTransit } from "@/api/gateway/password-transit.gateway";
import PasswordResetAPI from "@/api/seccenter/password-reset.api";
import { clearCountdown, startCountdown } from "@/utils/countdown";
import {
  collectFormValidationErrors,
  createAccountRules,
  createConfirmPasswordRules,
  createPasswordRules,
  formatValidationMessages,
  MSG,
  requiredRule,
} from "@/utils/formRules";
import { useCaptcha } from "@/views/login/composables/use-captcha";
import { useCaptchaSendSuccess } from "@/views/login/composables/use-captcha-send-success";
import { useCapsLockHint } from "@/views/login/composables/use-caps-lock-hint";
import ForgotResetStep from "@/views/login/components/ForgotResetStep.vue";
import ForgotVerifyStep from "@/views/login/components/ForgotVerifyStep.vue";
import { showNotification } from "@/utils";

type ForgotStep = "verify" | "reset";

const props = defineProps<{
  initialAccount?: string;
}>();

const emit = defineEmits<{
  back: [];
  success: [account: string];
}>();
const { t } = useI18n();

const { isCapsLock, checkCapsLock } = useCapsLockHint();

const step = ref<ForgotStep>("verify");
const verifyStepRef = ref<{
  validateFields: (fields: string[]) => Promise<void>;
  clearValidate: () => void;
} | null>(null);
const resetStepRef = ref<{
  validateFields: (fields: string[]) => Promise<void>;
  clearValidate: () => void;
} | null>(null);
const loginSetting = ref<LoginSettingV2Response | null>(null);
const form = reactive({
  account: props.initialAccount?.trim() ?? "",
  code: "",
  captchaId: "",
  captchaAnswer: "",
  password: "",
  confirmPassword: "",
});
const countdown = ref(0);
const countdownTimer = ref<NodeJS.Timeout | null>(null);
const {
  sendSuccess: captchaSendSuccess,
  markSuccess: markCaptchaSendSuccess,
  resetSuccess: resetCaptchaSendSuccess,
  bindResetOnChange,
} = useCaptchaSendSuccess();
const {
  codeLoading: captchaLoading,
  captchaBase64,
  getCaptcha,
} = useCaptcha((key) => {
  form.captchaId = key;
});

onUnmounted(() => {
  clearCountdown(countdown, countdownTimer);
});

bindResetOnChange(() => form.account.trim());
bindResetOnChange(() => form.captchaAnswer.trim());

/**
 * 刷新验证码
 */
function refreshCaptcha() {
  resetCaptchaSendSuccess();
  form.captchaAnswer = "";
  getCaptcha();
}

refreshCaptcha();

/**
 * 设置当前步骤
 * @param nextStep
 */
function setStep(nextStep: ForgotStep) {
  step.value = nextStep;
  if (nextStep === "verify") {
    verifyStepRef.value?.clearValidate();
    return;
  }
  resetStepRef.value?.clearValidate();
}

/**
 * 创建表单验证规则
 */
const verifyRules = computed<FormRules>(() => ({
  account: createAccountRules(t),
  captchaAnswer: [requiredRule(t, MSG.captchaAnswerRequired, ["blur", "change"])],
  code: [requiredRule(t, MSG.verificationCodeRequired, ["blur", "change"])],
}));

const resetRules = computed<FormRules>(() => ({
  password: createPasswordRules(t),
  confirmPassword: createConfirmPasswordRules(t, () => form.password),
}));

async function validateWithErrors(validateAction: () => Promise<void>): Promise<boolean> {
  try {
    await validateAction();
    return true;
  } catch (fieldsError) {
    const messages = collectFormValidationErrors(fieldsError as Record<string, unknown>);
    if (messages.length > 0) {
      showNotification(formatValidationMessages(messages), { type: "error" });
    }
    return false;
  }
}

/**
 * 解析重置密码所需的密码
 * @param plainPassword 明文密码
 */
async function resolvePasswordForReset(plainPassword: string): Promise<string> {
  let latestSetting = loginSetting.value;
  if (!latestSetting) {
    latestSetting = await AuthGateway.loginSetting({});
    loginSetting.value = latestSetting;
  }
  const result = resolvePasswordForTransit(plainPassword, latestSetting);
  if (!result.ok) {
    throw new Error(result.code);
  }
  return result.password;
}

/**
 * 请求验证码
 */
async function requestCode() {
  const result = await PasswordResetAPI.request({
    identifier: form.account.trim(),
    captchaId: form.captchaId.trim(),
    captchaAnswer: form.captchaAnswer.trim(),
  });
  startCountdown(countdown, countdownTimer, result.resendAfter || 60);
  return result;
}

/**
 * 处理发送验证码
 */
async function handleSendCode() {
  resetCaptchaSendSuccess();
  const valid = await validateWithErrors(async () => {
    await verifyStepRef.value?.validateFields(["account", "captchaAnswer"]);
  });
  if (!valid) return;
  try {
    const result = await requestCode();
    markCaptchaSendSuccess();
    showNotification(result.message || t("验证码已发送，请注意查收"), { type: "success" });
  } catch {}
}

/**
 * 进入重置密码步骤
 */
async function goToResetStep() {
  const valid = await validateWithErrors(async () => {
    await verifyStepRef.value?.validateFields(["code"]);
  });
  if (!valid) return;
  setStep("reset");
}

/**
 * 处理确认重置密码
 */
async function handleConfirmReset() {
  if (!form.code.trim()) {
    showNotification(t("验证码缺失，请重新获取"), { type: "error" });
    setStep("verify");
    return;
  }
  const valid = await validateWithErrors(async () => {
    await resetStepRef.value?.validateFields(["password", "confirmPassword"]);
  });
  if (!valid) return;

  try {
    const newPassword = await resolvePasswordForReset(form.password);
    const result = await PasswordResetAPI.reset({
      identifier: form.account.trim(),
      code: form.code.trim(),
      newPassword,
    });
    showNotification(result.message || t("密码重置成功，请使用新密码登录"), { type: "success" });
    emit("success", form.account.trim());
  } catch {}
}
</script>

<style lang="scss" scoped></style>
