<template>
  <!-- 二次认证页面 login/verify 目的和激活页面类似 -->
  <div class="vertify-wrapper">
    <div class="verify-header">
      <el-button
        text
        class="back-button"
        @click="handleBack"
      >
        <el-icon><Back /></el-icon>
      </el-button>
      <h3 class="verify-title">
        {{ verifyType === "mobile" ? $t("手机号验证") : $t("邮箱验证") }}
      </h3>
    </div>

    <el-form
      ref="verifyFormRef"
      :model="verifyFormData"
      :rules="verifyRules"
      size="large"
      :validate-on-rule-change="false"
    >
      <el-form-item>
        <el-input
          :model-value="maskedContact"
          :placeholder="verifyType === 'mobile' ? $t('手机号') : $t('邮箱')"
          disabled
        >
          <template #prefix>
            <el-icon v-if="verifyType === 'mobile'"><PhoneFilled /></el-icon>
            <el-icon v-else><Message /></el-icon>
          </template>
        </el-input>
      </el-form-item>

      <el-form-item prop="authCode">
        <div class="form-inline">
          <el-input
            v-model.trim="verifyFormData.authCode"
            :placeholder="$t('请输入验证码')"
            @keyup.enter="handleVerifySubmit"
          >
            <template #prefix>
              <el-icon><Message /></el-icon>
            </template>
          </el-input>
          <div class="send-code">
            <el-button
              :disabled="countdown > 0"
              :loading="sendCodeLoading"
              type="primary"
              class="send-code__button"
              @click="sendVerificationCode"
            >
              {{ countdown > 0 ? $t("{countdown}s后重发", { countdown }) : $t("发送验证码") }}
            </el-button>
            <div
              v-if="expiresVisible"
              class="send-code__expires"
            >
              {{
                expiresCountdown > 0
                  ? $t("有效期还剩 {countdown}s", { countdown: expiresCountdown })
                  : $t("验证码已过期，请重发")
              }}
            </div>
          </div>
        </div>
      </el-form-item>

      <el-form-item>
        <el-button
          :loading="loading"
          :disabled="!verifyFormData.authCode?.trim()"
          type="primary"
          class="full-width-button"
          @click="handleVerifySubmit"
        >
          {{ $t("提交") }}
        </el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import type { FormInstance } from "element-plus";
import { useI18n } from "vue-i18n";
import { useRoute, useRouter } from "vue-router";
import AuthGateway from "@/api/gateway/auth.gateway";
import { useUserStore } from "@/store";
import { showNotification } from "@/utils";
import { PhoneFilled, Message, Back } from "@element-plus/icons-vue";
import { LOGIN_PATH } from "@/constants/navigation-paths";
import { startCountdown, clearCountdown } from "@/utils/countdown";
import { resolveOtpTimers } from "@/utils/otp-timers";

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const { t } = useI18n();

const verifyFormRef = ref<FormInstance>();
const loading = ref(false);
const sendCodeLoading = ref(false);
const countdown = ref(0);
const countdownTimer = ref<NodeJS.Timeout | null>(null);
const expiresCountdown = ref(0);
const expiresTimer = ref<NodeJS.Timeout | null>(null);
const expiresVisible = ref(false);

const verifyType = computed(() => {
  const type = route.query.type as string;
  if (type === "MFA_METHOD_SMS" || type === "mobile") return "mobile";
  if (type === "MFA_METHOD_EMAIL" || type === "email") return "email";
  return "mobile";
});
const maskedContact = computed(() => (route.query.contact as string) || "");
const mfaToken = computed(() => (route.query.mfaToken as string) || "");
const verifyFormData = ref({
  authCode: "",
});

const verifyRules = computed(() => ({
  authCode: [
    {
      required: true,
      trigger: "blur",
      message: verifyType.value === "mobile" ? t("请输入手机验证码") : t("请输入邮箱验证码"),
    },
  ],
}));

/**
 * 发送 MFA 验证码（v2），并启动两类倒计时：
 * - resendAfter：重发按钮 cooldown
 * - expiresIn：验证码有效期提示
 *
 * @returns void
 */
async function sendVerificationCode() {
  if (!maskedContact.value) {
    showNotification(verifyType.value === "mobile" ? t("手机号不能为空") : t("邮箱不能为空"), {
      type: "warning",
    });
    return;
  }

  try {
    sendCodeLoading.value = true;
    const res = await AuthGateway.sendMfaCode({
      mfaToken: mfaToken.value,
      targetType: verifyType.value === "mobile" ? "MFA_TARGET_SMS" : "MFA_TARGET_EMAIL",
    });
    showNotification(
      verifyType.value === "mobile" ? t("手机验证码已发送") : t("邮箱验证码已发送"),
      {
        type: "success",
      }
    );
    const timers = resolveOtpTimers(res);
    startCountdown(countdown, countdownTimer, timers.resendAfterSeconds);
    startCountdown(expiresCountdown, expiresTimer, timers.expiresInSeconds);
    expiresVisible.value = true;
  } catch (error) {
    console.error("发送验证码失败:", error);
  } finally {
    sendCodeLoading.value = false;
  }
}

/**
 * 清理验证码有效期倒计时展示状态。
 *
 * @returns void
 */
function clearExpiresState() {
  expiresVisible.value = false;
  clearCountdown(expiresCountdown, expiresTimer);
}

const disableBrowserNavigation = () => {
  window.history.pushState(null, "", window.location.href);

  const handlePopState = () => {
    window.history.pushState(null, "", window.location.href);
  };

  window.addEventListener("popstate", handlePopState);
  return () => {
    window.removeEventListener("popstate", handlePopState);
  };
};

let cleanupNavigation: (() => void) | null = null;

onMounted(() => {
  sendVerificationCode();
  cleanupNavigation = disableBrowserNavigation();
});

onUnmounted(() => {
  clearCountdown(countdown, countdownTimer);
  clearExpiresState();
  if (cleanupNavigation) {
    cleanupNavigation();
  }
});

function handleBack() {
  router.replace(LOGIN_PATH);
}

async function handleVerifySubmit() {
  try {
    const valid = await verifyFormRef.value?.validate();
    if (!valid) return;

    loading.value = true;

    const loginRes = await AuthGateway.verifyMfa({
      mfaToken: mfaToken.value,
      mfaCode: verifyFormData.value.authCode.trim(),
    });
    await userStore.finalizeV2Login(loginRes, {
      redirectToMenu: true,
    });
    showNotification(t("验证成功"), { type: "success" });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : t("验证失败，请重试");
    console.error("验证失败:", errorMessage);
  } finally {
    loading.value = false;
  }
}
</script>

<style lang="scss" scoped>
.verify-header {
  position: relative;
  margin-bottom: 40px;
}

.back-button {
  position: fixed;
  top: 0;
  left: 0;
  display: flex;
  font-size: 14px;
}

.verify-title {
  margin: 0;
  font-size: 24px;
  font-weight: 500;
  text-align: center;
}

.form-inline {
  display: flex;
  gap: 10px;
  align-items: stretch;
}

.send-code {
  position: relative;
  display: flex;
  flex-shrink: 0;
  align-items: stretch;
  width: 120px;
}
.send-code__expires {
  position: absolute;
  top: calc(40px + 4px);
  left: 50%;
  font-size: 12px;
  line-height: 16px;
  color: var(--el-text-color-secondary);
  text-align: center;
  white-space: nowrap;
  transform: translateX(-50%);
}

.send-code__button {
  width: 100%;
  height: 40px;
  padding: 0;
  font-size: 14px;
  border-radius: 4px;
}

.send-code__expires {
  margin-top: 4px;
  font-size: 12px;
  line-height: 16px;
  color: var(--el-text-color-secondary);
  text-align: center;
}

.full-width-button {
  width: 100%;
}
</style>
