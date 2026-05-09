<template>
  <div class="tenant-form-fields">
    <el-form
      ref="formRef"
      :model="innerModel"
      :rules="rules"
      label-width="120px"
      class="tenant-form-fields__form"
      :disabled="readonlyMode"
    >
      <el-form-item prop="tenantName">
        <template #label>
          <div class="inline-flex items-center gap-1">
            <span>{{ $t("租户名") }}</span>
            <el-tooltip
              placement="top"
              :content="$t('必填，1-64 个字符，仅支持中文、字母、数字和下划线')"
            >
              <el-icon class="form-label-warning-icon align-middle">
                <Warning />
              </el-icon>
            </el-tooltip>
          </div>
        </template>
        <el-input
          v-model="innerModel.tenantName"
          :placeholder="$t('请输入租户名')"
          maxlength="64"
          clearable
          :disabled="readonlyMode"
          @input="handleTenantNameInput"
        />
      </el-form-item>
      <!-- 租户不存图标，注释掉 -->
      <!-- <el-form-item label="图标" prop="icon">
        <icon-select
          v-model="innerModel.icon"
          style="width: 100%"
          placeholder="请输入图标名称或上传图标"
          :disabled="readonlyMode"
        />
      </el-form-item> -->

      <el-form-item :label="$t('时区')" prop="timezone">
        <el-select
          v-model="innerModel.timezone"
          :placeholder="$t('请选择时区')"
          filterable
          style="width: 100%"
          :disabled="readonlyMode"
        >
          <el-option
            v-for="item in TIMEZONE_OPTIONS"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>

      <el-form-item :label="$t('语言')" prop="locale">
        <el-select
          v-model="innerModel.locale"
          :placeholder="$t('请选择语言')"
          style="width: 100%"
          :disabled="readonlyMode"
        >
          <el-option
            v-for="item in LOCALE_OPTIONS"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>

      <el-form-item :label="$t('到期时间')" prop="expireTime">
        <el-date-picker
          v-model="innerModel.expireTime"
          type="date"
          value-format="YYYY-MM-DD"
          :placeholder="$t('请选择到期时间，留空表示永不过期')"
          style="width: 100%"
          :disabled="readonlyMode"
          :disabled-date="isTenantExpireDateDisabled"
        />
      </el-form-item>

      <el-form-item :label="$t('钉钉群')" prop="dingtalk">
        <el-input
          v-model="innerModel.dingtalk"
          :placeholder="$t('输入钉钉群链接，如https://dingdingxxxxxx')"
          maxlength="1024"
          clearable
          :disabled="readonlyMode"
        />
      </el-form-item>

      <el-form-item :label="$t('钉钉群密钥')" prop="dingtalkSecret">
        <el-input
          v-model="innerModel.dingtalkSecret"
          :placeholder="$t('请输入钉钉群密钥')"
          type="password"
          show-password
          maxlength="1024"
          clearable
          autocomplete="new-password"
          :disabled="readonlyMode"
        />
      </el-form-item>

      <el-form-item :label="$t('备注')" prop="remark">
        <el-input
          v-model="innerModel.remark"
          type="textarea"
          :rows="3"
          :placeholder="$t('请输入备注信息')"
          maxlength="255"
          show-word-limit
          :disabled="readonlyMode"
        />
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { Warning } from "@element-plus/icons-vue";
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { LOCALE_OPTIONS, TIMEZONE_OPTIONS } from "@/enums/settings/locale.enum";
import { isTenantExpireDateDisabled } from "@/gateway/system/tenant/tenant-expire-at";
import { collectFormValidationErrors, createTenantNameRules } from "@/utils/formRules";
import type { TenantInfoFormModel } from "@/types/tenant";

interface Props {
  modelValue: TenantInfoFormModel;
  readonlyMode?: boolean;
  title?: string;
}

const props = withDefaults(defineProps<Props>(), {
  readonlyMode: false,
  title: "",
});

const emit = defineEmits<{
  "update:modelValue": [value: TenantInfoFormModel];
}>();
const { t } = useI18n();

const formRef = ref();

const innerModel = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value),
});

const rules = computed(() => ({
  tenantName: createTenantNameRules(t),
}));

function handleTenantNameInput(value: string) {
  const filteredValue = value.replace(/[^\u4e00-\u9fa5a-zA-Z0-9_]/g, "");
  if (filteredValue !== value) {
    innerModel.value = {
      ...innerModel.value,
      tenantName: filteredValue,
    };
  }
}

async function validate() {
  return await new Promise<{ valid: boolean; errors: string[] }>((resolve) => {
    formRef.value?.validate((valid: boolean, fields?: Record<string, unknown>) => {
      const errors = valid ? [] : collectFormValidationErrors(fields);
      resolve({ valid, errors });
    });
  });
}

defineExpose({
  validate,
  reset: () => formRef.value?.resetFields?.(),
  clearValidate: () => formRef.value?.clearValidate?.(),
});
</script>

<style scoped lang="scss">
.tenant-form-fields__header {
  padding-bottom: 12px;
  margin-bottom: 16px;
  font-size: 16px;
  font-weight: 500;
  color: #303133;
  border-bottom: 1px solid #ebeef5;
}

.tenant-form-fields__form .el-form-item__content {
  min-width: 260px;
  max-width: 420px;
}

.form-label-warning-icon {
  margin-left: 4px;
  font-size: 14px;
  cursor: pointer;
}
</style>
