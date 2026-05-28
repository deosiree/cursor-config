<!-- 阶段 B：pwdPair + 动态 policy + validate-on-rule-change -->
<template>
  <el-form
    ref="formRef"
    :model="model"
    :rules="rules"
    :validate-on-rule-change="false"
    label-width="120px"
  >
    <el-form-item label="新密码" prop="password">
      <el-input v-model="model.password" type="password" show-password />
    </el-form-item>
    <el-form-item label="确认密码" prop="confirmPassword">
      <el-input v-model="model.confirmPassword" type="password" show-password />
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import type { FormInstance } from "element-plus";
import { pwdPair, type PwdCtx } from "@/utils/formRules";
import ConfigGateway from "@/gateway/system/config.gateway";

const model = ref({ password: "", confirmPassword: "" });
const formRef = ref<FormInstance>();
const pwdPlcy = ref<Awaited<ReturnType<typeof ConfigGateway.getPwdPolicy>>>();

const pwdCtx: PwdCtx = {
  getPassword: () => model.value.password ?? "",
  getConfirmPassword: () => model.value.confirmPassword ?? "",
  getFormRef: () => formRef.value,
};

const rules = computed(() => ({ ...pwdPair(pwdCtx, { policy: pwdPlcy.value }) }));

onMounted(() => {
  void ConfigGateway.getPwdPolicy().then((policy) => {
    pwdPlcy.value = policy;
  });
});
</script>
