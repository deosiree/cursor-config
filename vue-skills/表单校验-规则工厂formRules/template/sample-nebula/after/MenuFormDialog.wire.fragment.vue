<!-- sample-nebula — 阶段 B 接入参考：name + routePath -->
<template>
  <el-form-item label="名称" prop="name">
    <el-input
      v-model="formData.name"
      maxlength="8"
      @blur="() => trimNameOnBlur(formData as Record<string, unknown>, 'name', menuFormRef)"
    />
  </el-form-item>

  <el-form-item prop="routePath">
    <el-input
      v-model="formData.routePath"
      maxlength="64"
      @blur="
        () => trimRoutePathOnBlur(formData as Record<string, unknown>, 'routePath', menuFormRef)
      "
    />
  </el-form-item>
</template>

<script setup lang="ts">
import {
  createMenuNameRules,
  createRoutePathRules,
  normName,
  trimNameOnBlur,
  trimRoutePathOnBlur,
  NAME_MAX_LENGTH,
} from "@/utils/formRules";

const formRules = reactive({
  name: createMenuNameRules(),
  routePath: [
    ...createRoutePathRules(),
    // 业务唯一性：async validator，文案由页面/业务层提供
  ],
});

function buildPayload() {
  return {
    name: normName(formData.name, NAME_MAX_LENGTH.menuName),
    routePath: String(formData.routePath ?? "").trim(),
  };
}
</script>
