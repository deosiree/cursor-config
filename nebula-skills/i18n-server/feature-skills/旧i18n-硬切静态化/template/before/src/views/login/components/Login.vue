<template>
  <div
    class="login-form-wrap"
    :class="`login-form-wrap--${viewMode}`"
  >
    <template v-if="viewMode === 'login'">
      <TabsShell v-model="activeTab">
        <el-tab-pane
          label="密码登录"
          name="password"
        />
        <el-tab-pane
          label="验证码登录"
          name="otp"
        />
      </TabsShell>

      <el-form
        ref="loginFormRef"
        :model="form"
        :rules="loginRules"
        :validate-on-rule-change="false"
        size="large"
        class="login-form"
      >
        <template v-if="activeTab === 'password'">
          <AcctField
            v-model="form.account"
            field-prop="account"
            placeholder="请输入手机号/邮箱地址"
            @enter="handleLoginSubmit"
          />

          <PwdField
            v-model="form.password"
            field-prop="password"
            placeholder="请输入密码"
            :caps-lock-visible="isCapsLock"
            :caps-lock-content="t('login.capsLock')"
            @keyup="checkCapsLock"
            @enter="handleLoginSubmit"
          />
        </template>

        <template v-else>
          <AcctField
            v-model="form.account"
            field-prop="account"
            placeholder="请输入手机号/邮箱地址"
            @enter="handleLoginSubmit"
          />

          <CodeField
            v-model="form.otpCode"
            field-prop="otpCode"
            placeholder="请输入验证码"
            :send-disabled="countdown > 0 || accountType === 'invalid'"
            :send-loading="sendCodeLoading"
            :countdown="countdown"
            @enter="handleLoginSubmit"
            @send="sendVerificationCode"
          />
        </template>

        <CaptchaFld
          v-if="isCaptchaVisible"
          v-model="form.captchaCode"
          :placeholder="t('login.captchaCode')"
          :loading="codeLoading"
          :captcha-src="captchaBase64"
          @enter="handleLoginSubmit"
          @refresh="refreshCaptcha"
        >
          <template #prefix>
            <SvgIcon
              name="captcha"
              width="14"
              height="14"
            />
          </template>
        </CaptchaFld>

        <el-form-item v-if="isMfaPanelVisible">
          <div class="mfa-panel">
            <div
              v-if="isMfaChannelSelectable"
              class="mfa-panel__row"
            >
              <span class="mfa-panel__label">验证方式：</span>
              <el-select
                v-model="mfaChannel"
                class="mfa-channel-select"
              >
                <el-option
                  label="邮箱验证码"
                  value="email"
                />
                <el-option
                  label="短信验证码"
                  value="sms"
                />
              </el-select>
            </div>
            <div
              v-else
              class="mfa-panel__row"
            >
              <span class="mfa-panel__label">MFA 验证：</span>
              <span>{{ mfaMethodText }}</span>
            </div>
            <CodeField
              v-model="mfaCode"
              field-prop="mfaCode"
              :placeholder="mfaCodePlaceholder"
              :input-disabled="!isMfaChallengeActive"
              :send-disabled="isMfaSendDisabled"
              :send-loading="mfaSendCodeLoading"
              :countdown="mfaCountdown"
              class="mfa-panel__field"
              @enter="handleLoginSubmit"
              @send="sendMfaChallengeCode"
            />
            <div class="mfa-panel__hint">{{ mfaHintText }}</div>
          </div>
        </el-form-item>

        <el-form-item>
          <MainBtn
            :loading="loading"
            :disabled="isLoginDisabled"
            class="login-submit-btn"
            @click="handleLoginSubmit"
          >
            {{ t("login.login") }}
          </MainBtn>
        </el-form-item>
      </el-form>

      <div
        v-if="activeTab === 'password'"
        class="login-options"
      >
        <TextLink
          class="forgot-btn"
          @click="enterForgotPassword"
        >
          忘记密码？
        </TextLink>
      </div>
    </template>

    <template v-else>
      <LoginForgotPassword
        :initial-account="form.account"
        @back="backToLogin"
        @success="handleForgotSuccess"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref, watch } from "vue";
import type { FormInstance } from "element-plus";
import { useI18n } from "vue-i18n";

import AuthGateway, {
  type LoginSettingV2Response,
  type LoginV2Request,
  type LoginV2Response,
} from "@/api/gateway/auth.gateway";
import AcctField from "@/components/auth/field/AcctField.vue";
import CaptchaFld from "@/components/auth/field/CaptchaFld.vue";
import CodeField from "@/components/auth/field/CodeField.vue";
import PwdField from "@/components/auth/field/PwdField.vue";
import MainBtn from "@/components/auth/layout/MainBtn.vue";
import TabsShell from "@/components/auth/layout/TabsShell.vue";
import TextLink from "@/components/auth/layout/TextLink.vue";
import SvgIcon from "@/components/SvgIcon/index.vue";
import { resolvePasswordForTransit } from "@/api/gateway/password-transit.gateway";
import { useUserStore } from "@/store";
import { resolveAccountType, type AccountType } from "@/utils/account";
import { clearCountdown, startCountdown } from "@/utils/countdown";
import {
  buildLoginCodeSendPayload,
  buildOtpLoginPayload,
  buildPasswordLoginPayload,
  resolveOtpSendSuccessText,
  type OtpChannel,
} from "@/utils/login-auth";
import {
  normalizeMfaMethod,
  normalizeMfaPlaceholder,
  normalizeMfaText,
  resolveDefaultMfaChannel,
  resolveEffectiveMfaChannel,
  resolveMfaHintText,
  resolveMfaSendSuccessText,
  resolveMfaTargetType,
  type MfaChannel,
} from "@/utils/login-mfa";
import { showNotification } from "@/utils";
import { useCaptcha } from "@/views/login/composables/use-captcha";
import { createLoginRules } from "@/views/login/composables/use-auth-form-rules";
import { useCapsLockHint } from "@/views/login/composables/use-caps-lock-hint";
import LoginForgotPassword from "@/views/login/components/LoginForgotPassword.vue";

type ActiveTab = "password" | "otp";
type ViewMode = "login" | "forgot";

const { t } = useI18n();
const userStore = useUserStore();
const emit = defineEmits<{
  "layout-change": [mode: "login" | "forgot"];
}>();

onMounted(async () => {
  await initLoginSetting();
});

onUnmounted(() => {
  clearCountdown(countdown, countdownTimer);
  clearCountdown(mfaCountdown, mfaCountdownTimer);
});

const activeTab = ref<ActiveTab>("password");
const viewMode = ref<ViewMode>("login");
const loginFormRef = ref<FormInstance>();
const loading = ref(false);
const loginSetting = ref<LoginSettingV2Response | null>(null);
const loginSettingLoading = ref(false);
const loginSettingReady = ref(false);
const isCaptchaVisible = ref(false);
const mfaToken = ref("");
const mfaCode = ref("");
const mfaChannel = ref<MfaChannel>("email");
const mfaMaskedPhone = ref("");
const mfaMaskedEmail = ref("");

watch(
  viewMode,
  (mode) => {
    emit("layout-change", mode);
  },
  { immediate: true }
);

watch(activeTab, () => {
  isCaptchaVisible.value = resolveInitialCaptchaVisible(loginSetting.value);
  if (isCaptchaVisible.value && !form.captchaKey) {
    refreshCaptcha();
  }
});

const form = reactive({
  account: "",
  password: "",
  otpCode: "",
  captchaKey: "",
  captchaCode: "",
});

const { isCapsLock, checkCapsLock } = useCapsLockHint();
const {
  codeLoading,
  captchaBase64,
  getCaptcha: fetchCaptcha,
} = useCaptcha((key) => {
  form.captchaKey = key;
});

const sendCodeLoading = ref(false);
const countdown = ref(0);
const countdownTimer = ref<NodeJS.Timeout | null>(null);
const mfaSendCodeLoading = ref(false);
const mfaCountdown = ref(0);
const mfaCountdownTimer = ref<NodeJS.Timeout | null>(null);

const accountType = computed<AccountType>(() => resolveAccountType(form.account));
const isMfaEnabled = computed(() => Boolean(loginSetting.value?.mfaEnabled));
const mfaMethodCode = computed(() => normalizeMfaMethod(loginSetting.value?.mfaMethod));
const requiresMfa = computed(
  () =>
    isMfaEnabled.value && mfaMethodCode.value !== null && mfaMethodCode.value !== "MFA_METHOD_NONE"
);
const isMfaChannelSelectable = computed(() => mfaMethodCode.value === "MFA_METHOD_BOTH");
const isMfaChallengeActive = computed(() => Boolean(mfaToken.value));
const isMfaPanelVisible = computed(() => requiresMfa.value || isMfaChallengeActive.value);
const effectiveMfaChannel = computed<MfaChannel>(() =>
  resolveEffectiveMfaChannel(mfaMethodCode.value, mfaChannel.value)
);
const mfaMethodText = computed(() => normalizeMfaText(mfaMethodCode.value));
const mfaCodePlaceholder = computed(() => normalizeMfaPlaceholder(effectiveMfaChannel.value));
const mfaHintText = computed(() =>
  resolveMfaHintText({
    requiresMfa: requiresMfa.value,
    isMfaChallengeActive: isMfaChallengeActive.value,
    channel: effectiveMfaChannel.value,
    maskedPhone: mfaMaskedPhone.value,
    maskedEmail: mfaMaskedEmail.value,
  })
);

const loginRules = computed(() =>
  createLoginRules({
    t,
    activeTab: activeTab.value,
    isCaptchaVisible: isCaptchaVisible.value,
  })
);

const isLoginDisabled = computed(() => {
  if (!loginSettingReady.value || loginSettingLoading.value) return true;
  if (isCaptchaVisible.value && !form.captchaCode.trim()) return true;

  if (activeTab.value === "password") {
    if (isMfaChallengeActive.value) {
      return !mfaCode.value.trim();
    }
    return !form.account.trim() || !form.password.trim();
  }

  if (accountType.value === "invalid") return true;
  return !form.otpCode.trim();
});

const canTriggerMfaChallenge = computed(() => {
  if (!loginSettingReady.value || loginSettingLoading.value || loading.value) return false;
  if (!requiresMfa.value) return false;
  if (!form.account.trim() || !form.password.trim()) return false;
  if (isCaptchaVisible.value && !form.captchaCode.trim()) return false;
  return true;
});

const isMfaSendDisabled = computed(
  () =>
    mfaSendCodeLoading.value ||
    mfaCountdown.value > 0 ||
    (!isMfaChallengeActive.value && !canTriggerMfaChallenge.value)
);

function resolveInitialCaptchaVisible(setting?: LoginSettingV2Response | null) {
  const enabled = Boolean(setting?.captchaEnabled);
  const triggerMode = String(setting?.captchaTriggerMode || "").toLowerCase();
  if (!enabled) return false;
  return triggerMode === "always";
}

async function initLoginSetting() {
  if (loginSettingLoading.value) return;
  loginSettingLoading.value = true;
  try {
    const data = await AuthGateway.loginSetting({});
    loginSettingReady.value = true;
    loginSetting.value = data;
    activeTab.value = "password";
    const method = normalizeMfaMethod(data?.mfaMethod);
    mfaChannel.value = resolveDefaultMfaChannel(method);
    isCaptchaVisible.value = resolveInitialCaptchaVisible(data);
    if (isCaptchaVisible.value) {
      refreshCaptcha();
    }
  } catch {
    loginSettingReady.value = false;
  } finally {
    loginSettingLoading.value = false;
  }
}

function refreshCaptcha() {
  form.captchaCode = "";
  fetchCaptcha();
}

function enterForgotPassword() {
  viewMode.value = "forgot";
}

function backToLogin() {
  activeTab.value = "password";
  viewMode.value = "login";
}

function handleForgotSuccess(account: string) {
  form.account = account;
  backToLogin();
}

function resetMfaChallenge() {
  mfaToken.value = "";
  mfaCode.value = "";
  mfaMaskedPhone.value = "";
  mfaMaskedEmail.value = "";
  clearCountdown(mfaCountdown, mfaCountdownTimer);
}

watch(
  mfaChannel,
  () => {
    mfaCode.value = "";
  },
  { flush: "sync" }
);

watch(
  () => form.account.trim(),
  (nextIdentifier, prevIdentifier) => {
    if (nextIdentifier === prevIdentifier) return;
    if (activeTab.value === "password") {
      resetMfaChallenge();
      return;
    }
    clearCountdown(countdown, countdownTimer);
  },
  { flush: "sync" }
);

function applyMfaChallengeFromLoginResponse(res: LoginV2Response): boolean {
  const responseMethod = normalizeMfaMethod(res.mfaMethod);
  const method = responseMethod ?? mfaMethodCode.value;
  if (!method || method === "MFA_METHOD_NONE" || method === "MFA_METHOD_UNSPECIFIED") {
    showNotification("登录配置要求 MFA，但未返回有效 MFA 方式", { type: "error" });
    return false;
  }
  mfaToken.value = String(res.mfaToken || "").trim();
  mfaMaskedPhone.value = String(res.mfaMaskedPhone || "");
  mfaMaskedEmail.value = String(res.mfaMaskedEmail || "");
  mfaCode.value = "";
  mfaChannel.value = resolveDefaultMfaChannel(method);
  if (!mfaToken.value) {
    showNotification("MFA 临时凭证缺失，请重试", { type: "error" });
    return false;
  }
  return true;
}

async function resolvePasswordForPasswordAction(): Promise<string | null> {
  let latestSetting: LoginSettingV2Response;
  try {
    latestSetting = await AuthGateway.loginSetting({});
    loginSetting.value = latestSetting;
    loginSettingReady.value = true;
  } catch {
    return null;
  }
  const result = resolvePasswordForTransit(form.password, latestSetting);
  if (!result.ok) {
    showNotification(result.code, { type: "error" });
    return null;
  }
  return result.password;
}

async function ensureMfaChallengeContextByPasswordLogin(): Promise<boolean> {
  if (mfaToken.value) return true;
  const valid = await loginFormRef.value?.validate();
  if (!valid) return false;
  const password = await resolvePasswordForPasswordAction();
  if (!password) return false;
  const payload = buildPasswordLoginPayload({
    identifier: form.account.trim(),
    password,
    captchaKey: form.captchaKey,
    captchaCode: form.captchaCode,
  });
  loading.value = true;
  try {
    const res = (await userStore.loginV2(payload)) as LoginV2Response;
    if (!res?.mfaRequired) {
      showNotification("当前会话未返回 MFA 挑战，请直接登录", { type: "warning" });
      return false;
    }
    return applyMfaChallengeFromLoginResponse(res);
  } finally {
    loading.value = false;
  }
}

async function sendMfaChallengeCode() {
  if (mfaSendCodeLoading.value || mfaCountdown.value > 0) return;
  if (!mfaToken.value) {
    const prepared = await ensureMfaChallengeContextByPasswordLogin();
    if (!prepared) return;
  }
  if (!mfaToken.value) {
    showNotification("MFA 挑战未就绪，请重试", { type: "warning" });
    return;
  }
  try {
    mfaSendCodeLoading.value = true;
    await AuthGateway.sendMfaCode({
      mfaToken: mfaToken.value,
      targetType: resolveMfaTargetType(effectiveMfaChannel.value),
    });
    showNotification(resolveMfaSendSuccessText(effectiveMfaChannel.value), { type: "success" });
    startCountdown(mfaCountdown, mfaCountdownTimer, 60);
  } catch (error) {
    console.error("发送 MFA 验证码失败:", error);
  } finally {
    mfaSendCodeLoading.value = false;
  }
}

async function submitMfaVerification() {
  if (!mfaToken.value) {
    showNotification("MFA 验证上下文丢失，请重新登录", { type: "error" });
    resetMfaChallenge();
    return;
  }
  if (!mfaCode.value.trim()) {
    showNotification("请输入 MFA 验证码", { type: "warning" });
    return;
  }
  const loginRes = await AuthGateway.verifyMfa({
    mfaToken: mfaToken.value,
    mfaCode: mfaCode.value.trim(),
  });
  await userStore.finalizeV2Login(loginRes, { redirectToMenu: true });
  resetMfaChallenge();
}

async function sendVerificationCode() {
  if (sendCodeLoading.value) return;
  const type = accountType.value;
  if (type === "invalid") {
    showNotification("请输入手机号或邮箱", { type: "warning" });
    return;
  }
  const otpChannel: OtpChannel = type === "phone" ? "phone" : "email";
  const identifier = form.account;
  try {
    sendCodeLoading.value = true;
    if (isCaptchaVisible.value && !form.captchaCode.trim()) {
      showNotification("请先输入图形验证码", { type: "warning" });
      return;
    }
    const res = await AuthGateway.sendLoginCode(
      buildLoginCodeSendPayload({ channel: otpChannel, identifier })
    );
    showNotification(resolveOtpSendSuccessText(otpChannel));

    startCountdown(countdown, countdownTimer, res.resendAfter || 60);
  } catch (error) {
    console.error("发送验证码失败:", error);
  } finally {
    sendCodeLoading.value = false;
  }
}

async function handleLoginSubmit() {
  if (loading.value) return;
  if (!loginSettingReady.value) {
    showNotification("登录安全配置未就绪，请稍后重试", { type: "error" });
    return;
  }
  if (activeTab.value === "password" && isMfaChallengeActive.value) {
    try {
      loading.value = true;
      await submitMfaVerification();
    } catch (error) {
      console.error("MFA 验证失败:", error);
    } finally {
      loading.value = false;
    }
    return;
  }
  try {
    const valid = await loginFormRef.value?.validate();
    if (!valid) return;
    let payload: LoginV2Request;
    if (activeTab.value === "password") {
      const password = await resolvePasswordForPasswordAction();
      if (!password) return;
      payload = buildPasswordLoginPayload({
        identifier: form.account.trim(),
        password,
        captchaKey: form.captchaKey,
        captchaCode: form.captchaCode,
      });
    } else {
      const type = accountType.value;
      if (type === "invalid") {
        showNotification("请输入手机号或邮箱", { type: "warning" });
        return;
      }
      const channel: OtpChannel = type === "phone" ? "phone" : "email";
      payload = buildOtpLoginPayload({
        channel,
        identifier: form.account.trim(),
        authCode: form.otpCode.trim(),
        captchaKey: form.captchaKey,
        captchaCode: form.captchaCode,
      });
    }
    loading.value = true;
    const res = (await userStore.loginV2(payload)) as LoginV2Response;
    if (res?.mfaRequired) {
      if (!applyMfaChallengeFromLoginResponse(res)) return;
      await sendMfaChallengeCode();
      return;
    }
  } catch (error) {
    console.error("登录失败:", error);
    if (!isCaptchaVisible.value) {
      isCaptchaVisible.value = true;
    }
    refreshCaptcha();
  } finally {
    loading.value = false;
  }
}
</script>

<style lang="scss" scoped>
.login-form-wrap {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 0;
}

:deep(.login-form) {
  width: 100%;
}

.login-options {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 24px;
}

.forgot-btn {
  width: auto;
}

.login-third-party {
  margin-top: 8px;
  width: 100%;
}

.login-divider {
  display: flex;
  align-items: center;
  width: 100%;
  gap: 16px;

  &__line {
    flex: 1;
    height: 1px;
    background: var(--el-border-color-lighter);
  }
}

.login-third-party__icons {
  display: flex;
  gap: 16px;
  flex-shrink: 0;
}

.third-party-btn {
  width: 40px;
  height: 40px;
  border: 1px solid var(--el-border-color-lighter);
  background: var(--el-bg-color);
  color: var(--el-text-color-regular);

  &:hover {
    background: var(--el-button-hover-bg-color);
  }
}

.mfa-panel {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
}

.mfa-panel :deep(.mfa-panel__field) {
  margin-bottom: 0;
}

.mfa-panel__row {
  display: flex;
  align-items: center;
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

.mfa-panel__label {
  flex-shrink: 0;
  margin-right: 8px;
  color: var(--el-text-color-primary);
}

.mfa-channel-select {
  width: 220px;
}

.mfa-panel__hint {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
</style>
