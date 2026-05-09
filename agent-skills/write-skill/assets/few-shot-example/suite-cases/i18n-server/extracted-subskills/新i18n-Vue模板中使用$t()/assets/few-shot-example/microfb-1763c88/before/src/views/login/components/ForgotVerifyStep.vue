<template>
  <ForgotStepPanel
    title="忘记密码"
    @back="emit('back')"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      :validate-on-rule-change="false"
      size="large"
      class="forgot-form forgot-form--verify"
    >
      <AcctField
        v-model="form.account"
        field-prop="account"
        placeholder="请输入绑定的手机号/邮箱"
        @enter="emit('sendCode')"
      />

      <CaptchaFld
        v-model="form.captchaAnswer"
        field-prop="captchaAnswer"
        :placeholder="captchaPlaceholder"
        :loading="captchaLoading"
        :captcha-src="captchaSrc"
        :success="captchaSuccess"
        class="forgot-form__captcha"
        @enter="emit('sendCode')"
        @refresh="emit('refreshCaptcha')"
      >
        <template #prefix>
          <slot name="captcha-prefix" />
        </template>
      </CaptchaFld>

      <CodeField
        v-model="form.code"
        field-prop="code"
        placeholder="请输入验证码"
        :send-disabled="sendDisabled"
        :send-loading="false"
        :countdown="countdown"
        class="forgot-form__item"
        @enter="emit('next')"
        @send="emit('sendCode')"
      />

      <div class="forgot-form__item forgot-form__item--submit">
        <MainBtn
          :disabled="!form.code.trim()"
          @click="emit('next')"
        >
          下一步
        </MainBtn>
      </div>
    </el-form>
  </ForgotStepPanel>
</template>

<script setup lang="ts">
import { ref } from "vue";
import type { FormInstance, FormRules } from "element-plus";

import MainBtn from "@/components/auth/layout/MainBtn.vue";
import AcctField from "@/components/auth/field/AcctField.vue";
import CaptchaFld from "@/components/auth/field/CaptchaFld.vue";
import CodeField from "@/components/auth/field/CodeField.vue";
import ForgotStepPanel from "@/views/login/components/ForgotStepPanel.vue";

export interface ForgotVerifyFormModel {
  account: string;
  captchaAnswer: string;
  code: string;
}

defineProps<{
  form: ForgotVerifyFormModel;
  rules: FormRules;
  captchaPlaceholder: string;
  captchaLoading: boolean;
  captchaSrc: string;
  captchaSuccess: boolean;
  countdown: number;
  sendDisabled: boolean;
}>();

const emit = defineEmits<{
  sendCode: [];
  next: [];
  refreshCaptcha: [];
  back: [];
}>();

const formRef = ref<FormInstance>();

async function validateFields(fields: string[]) {
  if (!formRef.value) return;
  await Promise.all(fields.map((field) => formRef.value!.validateField(field)));
}

function clearValidate() {
  formRef.value?.clearValidate();
}

defineExpose({
  validateFields,
  clearValidate,
});
</script>

<style lang="scss" scoped>
.forgot-form {
  width: 340px;
  display: flex;
  flex-direction: column;
  gap: 32px;

  :deep(.el-form-item) {
    margin-bottom: 0 !important;
  }
}

.forgot-form--verify {
  min-height: 256px;
}

.forgot-form__item {
  width: 340px;
  min-height: 40px;
}

.forgot-form__captcha {
  width: 100%;
}

.forgot-form__item--submit {
  display: flex;
}
</style>
