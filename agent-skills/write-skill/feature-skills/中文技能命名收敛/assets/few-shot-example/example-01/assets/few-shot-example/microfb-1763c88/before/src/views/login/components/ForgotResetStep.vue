<template>
  <ForgotStepPanel
    title="重置密码"
    @back="emit('back')"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      :validate-on-rule-change="false"
      size="large"
      class="forgot-form forgot-form--reset"
    >
      <PwdField
        v-model="form.password"
        field-prop="password"
        :placeholder="'请输入新密码'"
        :caps-lock-visible="capsLockVisible"
        :caps-lock-content="capsLockContent"
        class="forgot-form__password"
        @keyup="emit('passwordKeyup', $event)"
        @enter="emit('confirm')"
      />

      <PwdField
        v-model="form.confirmPassword"
        field-prop="confirmPassword"
        :placeholder="'请再次输入密码'"
        :caps-lock-visible="capsLockVisible"
        :caps-lock-content="capsLockContent"
        class="forgot-form__password"
        @keyup="emit('passwordKeyup', $event)"
        @enter="emit('confirm')"
      />

      <div class="forgot-form__item forgot-form__item--submit">
        <MainBtn
          :disabled="!form.password.trim() || !form.confirmPassword.trim()"
          @click="emit('confirm')"
        >
          确认
        </MainBtn>
      </div>
    </el-form>
  </ForgotStepPanel>
</template>

<script setup lang="ts">
import { ref } from "vue";
import type { FormInstance, FormRules } from "element-plus";

import MainBtn from "@/components/auth/layout/MainBtn.vue";
import PwdField from "@/components/auth/field/PwdField.vue";
import ForgotStepPanel from "@/views/login/components/ForgotStepPanel.vue";

export interface ForgotResetFormModel {
  password: string;
  confirmPassword: string;
}

defineProps<{
  form: ForgotResetFormModel;
  rules: FormRules;
  capsLockVisible: boolean;
  capsLockContent: string;
}>();

const emit = defineEmits<{
  confirm: [];
  back: [];
  passwordKeyup: [event: KeyboardEvent];
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

  :deep(.el-form-item) {
    margin-bottom: 0 !important;
  }

  :deep(.el-tooltip__trigger) {
    width: 100%;
  }
}

.forgot-form--reset {
  min-height: 184px;
  gap: 32px;
}

.forgot-form__password,
.forgot-form__item {
  width: 340px;
  min-height: 40px;
}

.forgot-form__item--submit {
  display: flex;
}
</style>
