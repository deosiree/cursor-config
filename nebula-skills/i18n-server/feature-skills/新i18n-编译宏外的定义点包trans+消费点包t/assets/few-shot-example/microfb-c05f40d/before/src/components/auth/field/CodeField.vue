<template>
  <MixShell
    :field-prop="fieldProp"
    :disabled="inputDisabled"
  >
    <template #input>
      <el-input
        :model-value="modelValue"
        :placeholder="placeholder"
        :maxlength="maxlength"
        :disabled="inputDisabled"
        clearable
        @update:model-value="onModelValueChange"
        @keyup.enter="emit('enter')"
      />
    </template>

    <template #action>
      <button
        type="button"
        class="code-field__action"
        :disabled="sendDisabled || sendLoading"
        @click="emit('send')"
      >
        {{ countdown > 0 ? `${countdown}s后重发` : buttonText }}
      </button>
    </template>
  </MixShell>
</template>

<script setup lang="ts">
import MixShell from "@/components/auth/layout/MixShell.vue";

/**
 * 验证码字段。
 * 使用场景：
 * - 登录验证码输入
 * - 忘记密码验证码输入
 * - MFA 验证码输入
 *
 * 通过 MixShell 统一“输入区 + 发送按钮”的组合布局。
 */
withDefaults(
  defineProps<{
    modelValue: string;
    placeholder: string;
    sendDisabled: boolean;
    sendLoading: boolean;
    countdown: number;
    inputDisabled?: boolean;
    maxlength?: number;
    buttonText?: string;
    fieldProp?: string;
  }>(),
  {
    inputDisabled: false,
    maxlength: 6,
    buttonText: "发送验证码",
    fieldProp: "",
  }
);

const emit = defineEmits<{
  "update:modelValue": [value: string];
  enter: [];
  send: [];
}>();

/**
 * 统一将输入值收敛为去首尾空格的字符串。
 */
function onModelValueChange(value: string | number) {
  emit("update:modelValue", String(value ?? "").trim());
}
</script>

<style lang="scss" scoped>
.code-field__action {
  width: 100%;
  min-width: 0;
  min-height: 40px;
  padding: 0 16px;
  border: none;
  background: transparent;
  color: #369fff;
  font-size: 14px;
  line-height: 22px;
  font-weight: 400;
  cursor: pointer;

  &:disabled {
    color: #a8abb2;
    cursor: not-allowed;
  }
}
</style>
