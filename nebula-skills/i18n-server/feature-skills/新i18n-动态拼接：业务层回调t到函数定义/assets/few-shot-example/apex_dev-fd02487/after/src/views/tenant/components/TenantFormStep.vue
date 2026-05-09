<template>
  <SplitFormFields :left-title="resolvedTenantTitle" :right-title="resolvedOwnerTitle">
    <template v-if="showTenant && props.tenantModel" #left>
      <TenantFormFields
        ref="tenantFormRef"
        :model-value="props.tenantModel"
        :readonly-mode="tenantReadonly"
        :title="''"
        @update:model-value="emit('update:tenantModel', $event)"
      />
    </template>
    <template v-if="showOwner && props.ownerModel" #right>
      <UserFormFields
        ref="ownerFormRef"
        v-model:activation-method="ownerActivationMethod"
        :model="props.ownerModel"
        :rules="resolvedOwnerRules"
        :show-role="false"
        :show-tenant="false"
        :show-password-fields="showOwnerPasswordFieldsInWriteMode"
        :readonly-mode="ownerReadonly"
      />
    </template>
  </SplitFormFields>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import SplitFormFields from "@/components/Dialog/SinglePaneChildren/SplitFormFields.vue";
import type { OwnerViewModel, TenantInfoFormModel, TenantOwnerFormModel } from "@/types/tenant";
import type { ActivationMethodStable } from "@/types/security-config";
import UserFormFields from "@/views/system/user/components/UserFormFields.vue";
import TenantFormFields from "@/views/tenant/components/TenantFormFields.vue";

type FormAccess = "write" | "read" | "none";
type OwnerModel = TenantOwnerFormModel | OwnerViewModel;
type ValidationResult = { valid: boolean; errors: string[] };
type RulesShape = Record<string, unknown>;

interface Props {
  tenantModel?: TenantInfoFormModel;
  ownerModel?: OwnerModel;
  tenantAccess?: FormAccess;
  ownerAccess?: FormAccess;
  ownerRules?: RulesShape;
  activationMethod?: ActivationMethodStable;
  showOwnerPasswordFields?: boolean;
  tenantTitle?: string;
  ownerTitle?: string;
}

const props = withDefaults(defineProps<Props>(), {
  tenantAccess: "read",
  ownerAccess: "read",
  ownerRules: () => ({}),
  activationMethod: "email",
  showOwnerPasswordFields: false,
  tenantTitle: "",
  ownerTitle: "",
});

const emit = defineEmits<{
  "update:tenantModel": [value: TenantInfoFormModel];
  "update:ownerModel": [value: OwnerModel];
  "update:activationMethod": [value: ActivationMethodStable];
}>();

const tenantFormRef = ref<InstanceType<typeof TenantFormFields> | null>(null);
const ownerFormRef = ref<InstanceType<typeof UserFormFields> | null>(null);
const { t } = useI18n();

const showTenant = computed(() => Boolean(props.tenantModel) && props.tenantAccess !== "none");
const showOwner = computed(() => Boolean(props.ownerModel) && props.ownerAccess !== "none");
const tenantReadonly = computed(() => props.tenantAccess !== "write");
const ownerReadonly = computed(() => props.ownerAccess !== "write");
const resolvedTenantTitle = computed(() =>
  showTenant.value ? props.tenantTitle || t("基础信息") : ""
);
const resolvedOwnerTitle = computed(() =>
  showOwner.value ? props.ownerTitle || t("所有者账号") : ""
);
const resolvedOwnerRules = computed(() => (props.ownerAccess === "write" ? props.ownerRules : {}));
const showOwnerPasswordFieldsInWriteMode = computed(
  () => props.ownerAccess === "write" && props.showOwnerPasswordFields
);

const ownerActivationMethod = computed({
  get: () => props.activationMethod,
  set: (value) => emit("update:activationMethod", value),
});

/**
 * 验证租户表单
 */
async function validateTenant(): Promise<ValidationResult> {
  if (!showTenant.value || props.tenantAccess !== "write") {
    return { valid: true, errors: [] };
  }
  return (await tenantFormRef.value?.validate?.()) ?? { valid: true, errors: [] };
}

/**
 * 验证所有者表单
 */
async function validateOwner(): Promise<ValidationResult> {
  if (!showOwner.value || props.ownerAccess !== "write") {
    return { valid: true, errors: [] };
  }
  return (await ownerFormRef.value?.validateWithResult?.()) ?? { valid: true, errors: [] };
}

/**
 * 清空表单验证状态
 */
function clearValidate(): void {
  tenantFormRef.value?.clearValidate?.();
  ownerFormRef.value?.clearValidate?.();
}

defineExpose({
  validateTenant,
  validateOwner,
  clearValidate,
});
</script>
