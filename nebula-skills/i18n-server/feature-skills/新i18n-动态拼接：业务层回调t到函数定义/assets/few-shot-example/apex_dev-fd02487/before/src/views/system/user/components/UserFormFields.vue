<template>
  <el-form
    ref="innerFormRef"
    :model="model"
    :rules="rules"
    label-width="120px"
    :validate-on-rule-change="false"
    :disabled="readonlyMode"
  >
    <!-- 用户名 -->
    <el-form-item label="用户名" prop="userName">
      <el-input
        v-model="model.userName"
        placeholder="请输入用户名"
        maxlength="64"
        clearable
        :disabled="disableUserName || readonlyMode"
        autocomplete="new-password"
        @input="handleUserNameInput"
      />
    </el-form-item>
    <el-form-item v-if="!readonlyMode && !model.id" label="激活方式">
      <el-select v-model="activationMethod" placeholder="请选择激活方式">
        <el-option
          v-for="item in ACTIVATION_METHOD_OPTIONS"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
    </el-form-item>
    <!-- 密码 -->
    <el-form-item v-if="showPasswordFields && !readonlyMode && !model.id" prop="password">
      <template #label>
        <div class="inline-flex items-center gap-1">
          <span>密码</span>
          <el-tooltip placement="top" content="密码为必填项">
            <el-icon class="form-label-warning-icon align-middle">
              <Warning />
            </el-icon>
          </el-tooltip>
        </div>
      </template>
      <el-input
        v-model="model.password"
        :placeholder="model.id ? '编辑时不可修改密码' : '请输入用户密码'"
        type="password"
        show-password
        maxlength="255"
        clearable
        autocomplete="new-password"
      />
    </el-form-item>
    <!-- 确认密码 -->
    <el-form-item
      v-if="showPasswordFields && !readonlyMode && !model.id"
      label="确认密码"
      prop="confirmPassword"
    >
      <el-input
        v-model="model.confirmPassword"
        placeholder="请再次输入密码"
        type="password"
        show-password
        maxlength="255"
        clearable
        autocomplete="new-password"
      />
    </el-form-item>

    <!-- 角色 -->
    <el-form-item v-if="showRole" label="角色" prop="roleId">
      <el-select
        v-model="model.roleId"
        placeholder="请选择"
        clearable
        :disabled="disableRole || readonlyMode"
        @change="$emit('role-change')"
      >
        <el-option
          v-for="item in roleOptions"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
    </el-form-item>

    <!-- 所属租户 -->
    <el-form-item v-if="showTenant" label="所属租户" prop="tenantId">
      <el-select
        v-model="model.tenantId"
        placeholder="请选择所属租户"
        clearable
        :disabled="readonlyMode"
      >
        <el-option
          v-for="item in tenantOptions"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
    </el-form-item>

    <!-- 手机 / 邮箱 -->
    <el-form-item label="手机号码" prop="phone">
      <el-input
        v-model="model.phone"
        placeholder="请输入手机号码"
        maxlength="11"
        clearable
        :disabled="readonlyMode"
      />
    </el-form-item>

    <el-form-item label="邮箱" prop="email">
      <el-input
        v-model="model.email"
        placeholder="请输入邮箱"
        maxlength="50"
        clearable
        :disabled="readonlyMode"
      />
    </el-form-item>

    <!-- 预留插槽：用于补充说明等额外内容 -->
    <slot />
  </el-form>
</template>

<script setup lang="ts">
import { collectFormValidationErrors } from "@/utils/formRules";
import { ref } from "vue";
import { Warning } from "@element-plus/icons-vue";
import { ACTIVATION_METHOD_OPTIONS } from "@/enums/auth.enum";
import type { ActivationMethodStable } from "@/types/security-config";

interface Props {
  model: any;
  rules: any;
  roleOptions?: SimpleOptionType[];
  tenantOptions?: SimpleOptionType[];
  showRole?: boolean;
  showTenant?: boolean;
  showPasswordFields?: boolean;
  disableUserName?: boolean;
  disableRole?: boolean;
  readonlyMode?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  roleOptions: () => [],
  tenantOptions: () => [],
  showRole: true,
  showTenant: true,
  showPasswordFields: true,
  disableUserName: false,
  disableRole: false,
  readonlyMode: false,
});

// 仅用于在模板中通过 $emit 触发事件
const emit = defineEmits<{
  "role-change": [];
  "update:activationMethod": [value: ActivationMethodStable];
}>();

// 避免 eslint 报未使用变量（模板中的 $emit 不会计入）
void emit;

const innerFormRef = ref();
const activationMethod = defineModel<ActivationMethodStable>("activationMethod", {
  default: "email",
});

/**
 * 处理用户名输入，在输入过程中实时过滤非法字符
 * @param value 用户名输入值
 */
function handleUserNameInput(value: string) {
  const filteredValue = value.replace(/[^\u4e00-\u9fa5a-zA-Z0-9_]/g, "");
  if (filteredValue !== value) {
    props.model.userName = filteredValue;
  }
}

/**
 * 处理密码输入，在输入过程中实时过滤非法字符
 */
async function validateWithResult() {
  return await new Promise<{ valid: boolean; errors: string[] }>((resolve) => {
    innerFormRef.value?.validate((valid: boolean, fields?: Record<string, unknown>) => {
      const errors = valid ? [] : collectFormValidationErrors(fields);
      resolve({ valid, errors });
    });
  });
}

defineExpose({
  // 默认整体验证（Element Plus 原始 Promise 形式）
  validate: () => innerFormRef.value?.validate(),
  // 带详细错误信息的验证结果，显式暴露给父组件
  validateWithResult,
  resetFields: () => innerFormRef.value?.resetFields?.(),
  clearValidate: (props?: any) => innerFormRef.value?.clearValidate?.(props),
});
</script>

<style scoped lang="scss">
.form-label-warning-icon {
  margin-left: 4px;
  font-size: 14px;
  cursor: pointer;
}
</style>
