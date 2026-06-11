<template>
  <el-dialog
    v-model="inputDialogVisible"
    title="多语言输入"
    width="500px"
    :close-on-click-modal="false"
    append-to-body
  >
    <el-form :model="formData" label-width="80px">
      <el-form-item
        v-for="(value, key) in formData"
        :key="key"
        :label="getLanguageLabel(String(key)) + ':'"
      >
        <el-input v-model="formData[key]" :placeholder="`请输入${getLanguageLabel(String(key))}`" />
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button size="small" @click="inputDialogVisible = false">取消</el-button>
        <el-button size="small" type="primary" @click="handleConfirm">确认</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
interface I18nData {
  [key: string]: string;
}

const props = defineProps({
  value: {
    type: Object as () => I18nData,
    default: () => ({ zh_CN: "", en_US: "" }),
  },
});

const emit = defineEmits<{
  confirm: [value: I18nData];
}>();

const inputDialogVisible = ref(false);

const formData = ref<Record<string, string>>({
  zh_CN: "",
  en_US: "",
});

const languageLabelMap: Record<string, string> = {
  zh_CN: "中文",
  en_US: "英文",
  es_ES: "西班牙语",
  ru_RU: "俄语",
  ja_JP: "日语",
  ko_KR: "韩语",
  fr_FR: "法语",
  de_DE: "德语",
};

const parseValue = (value: I18nData | undefined) => {
  return value ? { ...value } : { zh_CN: "", en_US: "" };
};

const getLanguageLabel = (key: string) => {
  return languageLabelMap[key] || key;
};

const handleConfirm = () => {
  emit("confirm", { ...formData.value });
  inputDialogVisible.value = false;
};

defineExpose({
  open: () => {
    formData.value = parseValue(props.value);
    inputDialogVisible.value = true;
  },
});
</script>
