<!-- microfb：登录/忘记密码标题下副标题（ForgotStepPanel 内嵌） -->
<template>
  <p
    v-if="policy && tip"
    class="pwd-policy-tip pwd-policy-tip--subtitle"
  >
    {{ tip }}
  </p>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { pwdPlcyTip, type PwdConfirmPolicy } from "@/utils/formRules";

const props = defineProps<{
  policy?: PwdConfirmPolicy;
  variant?: "subtitle" | "inline";
}>();

const tip = computed(() => (props.policy ? pwdPlcyTip(props.policy) : ""));
</script>
