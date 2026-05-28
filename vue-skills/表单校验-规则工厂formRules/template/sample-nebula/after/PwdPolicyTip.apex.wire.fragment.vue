<!-- apex_dev：表单项 label 旁策略提示（el-tooltip + Warning） -->
<template>
  <el-tooltip v-if="policy && tip" placement="top" :content="tip">
    <el-icon class="pwd-policy-tip__icon align-middle">
      <Warning />
    </el-icon>
  </el-tooltip>
</template>

<script setup lang="ts">
import { Warning } from "@element-plus/icons-vue";
import { computed } from "vue";
import { pwdPlcyTip, type PwdPolicy } from "@/utils/formRules";

const props = defineProps<{
  policy?: PwdPolicy;
}>();

const tip = computed(() => (props.policy ? pwdPlcyTip(props.policy) : ""));
</script>
