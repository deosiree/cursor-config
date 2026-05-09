<template>
  <el-dialog
    v-model="visible"
    :title="isEdit ? '修改设备' : '新建设备'"
    width="30%"
    draggable
    :close-on-click-modal="false"
    @closed="handleClosed"
  >
    <ElForm ref="formRef" :model="localForm" :rules="rules" label-width="120px">
      <el-form-item label="设备名称" prop="deviceName">
        <el-input
          v-model="localForm.deviceName"
          maxlength="64"
          placeholder="请输入设备名称"
          :disabled="isEdit"
          clearable
        />
      </el-form-item>
      <el-form-item label="机器码" prop="machineCode">
        <el-input
          v-model="localForm.machineCode"
          maxlength="64"
          placeholder="请输入设备机器码"
          :disabled="isEdit"
          clearable
        />
      </el-form-item>
      <el-form-item label="设备密钥" prop="deviceSecret">
        <el-input
          v-model="localForm.deviceSecret"
          maxlength="2048"
          placeholder="请输入设备密钥"
          :disabled="isEdit"
          clearable
        />
      </el-form-item>
      <el-form-item v-if="!isEdit" label="设备型号" prop="deviceTypeId">
        <el-select
          v-model="localForm.deviceTypeId"
          placeholder="请选择设备型号"
          filterable
          clearable
          style="width: 100%"
        >
          <el-option
            v-for="item in deviceTypeList"
            :key="item.id"
            :label="item.deviceTypeName"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="设备描述" prop="deviceDesc">
        <el-input
          v-model="localForm.deviceDesc"
          type="textarea"
          placeholder="请输入设备描述"
          maxlength="256"
          :rows="3"
          resize="vertical"
        />
      </el-form-item>
    </ElForm>

    <template #footer>
      <div class="dialog-footer">
        <el-button size="small" @click="visible = false">取 消</el-button>
        <el-button type="primary" size="small" :loading="submitting" @click="handleSubmit">
          确 定
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import deviceApi, { DeviceForm } from "@/gateway/device/device.gateway";
import { requiredRule } from "@/utils/formRules";
import { ElForm } from "element-plus";
import { showNotification } from "@/utils/notification";
import { computed } from "vue";
import { useI18n } from "vue-i18n";

const props = defineProps<{
  visible: boolean;
  isEdit: boolean;
  formData: DeviceForm;
  deviceTypeList: Array<any>;
}>();

const emits = defineEmits(["update:visible", "submit-success"]);

const visible = useVModel(props, "visible", emits);
const formRef = ref<InstanceType<typeof ElForm>>();
const submitting = ref(false);
const { t } = useI18n();

// 本地副本，避免直接修改父组件数据
const localForm = reactive<DeviceForm>({ ...props.formData });

// 监听父组件传入数据变化
watch(
  () => props.formData,
  (val) => {
    Object.assign(localForm, val);
  },
  { deep: true, immediate: true }
);

const rules = computed(() => ({
  deviceTypeId: requiredRule(t("请选择设备型号")),
  deviceSecret: [
    { required: true, message: t("请输入设备密钥"), trigger: "blur" },
    {
      pattern: /^[\w.-]+$/,
      message: t("设备密钥格式错误，仅支持字母、数字、下划线、点号和中划线"),
      trigger: "blur",
    },
  ],
  machineCode: [
    { required: true, message: t("请输入机器码"), trigger: "blur" },
    {
      pattern: /^[a-zA-Z0-9]+$/,
      message: t("机器码格式错误，仅支持字母和数字"),
      trigger: "blur",
    },
  ],
  deviceName: requiredRule(t("请输入设备名称")),
}));

const handleSubmit = async () => {
  if (!formRef.value) return;
  submitting.value = true;
  try {
    await formRef.value.validate();
    if (props.isEdit) {
      await deviceApi.update(localForm);
      showNotification("修改成功", { type: "success" });
    } else {
      await deviceApi.create(localForm);
      showNotification("新增成功", { type: "success" });
    }
    emits("submit-success");
  } catch {
    return;
  } finally {
    submitting.value = false;
  }
};

const handleClosed = () => {
  formRef.value?.resetFields();
};
</script>
