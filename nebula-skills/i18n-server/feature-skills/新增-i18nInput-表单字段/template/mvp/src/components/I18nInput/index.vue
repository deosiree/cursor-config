<template>
  <div class="svgIcon i-svg:i18n w-[1em] h-[1em]" @click="openDialog"></div>
  <I18nDialog ref="i18nDialogRef" :value="props.i18nData" @confirm="handleConfirm" />
</template>

<script setup lang="ts">
import I18nDialog from "./I18nDialog.vue";
import { computed, ref, watch } from "vue";
import { useLangStore } from "@/store";

interface I18nData {
  [key: string]: string;
}

const i18nDialogRef = ref();
const langStore = useLangStore();
const currentLangKey = computed(() => langStore.lang.replace("-", "_"));
const defaultLocaleKeys = ["zh_CN", "en_US", "es_ES", "ru_RU"];

const props = defineProps({
  i18nData: {
    type: Object as () => I18nData,
    default: () => ({ zh_CN: "", en_US: "" }),
  },
  sourceValue: {
    type: String,
    default: "",
  },
});

const emit = defineEmits<{
  "update:i18nData": [value: I18nData];
}>();

const lastSourceValue = ref(props.sourceValue);

const cloneI18nData = (value: I18nData) => {
  return typeof value === "object" && value !== null ? { ...value } : {};
};

const buildNormalizedI18nData = (
  value: I18nData,
  sourceValue: string,
  previousSourceValue: string
) => {
  const parsed = cloneI18nData(value);
  const localeKeys = new Set([...defaultLocaleKeys, ...Object.keys(parsed), currentLangKey.value]);
  const normalized: Record<string, string> = {};

  localeKeys.forEach((key) => {
    const currentValue = typeof parsed[key] === "string" ? parsed[key] : "";

    if (!currentValue) {
      normalized[key] = sourceValue || "";
      return;
    }

    if (
      previousSourceValue &&
      currentValue === previousSourceValue &&
      sourceValue !== previousSourceValue
    ) {
      normalized[key] = sourceValue;
      return;
    }

    normalized[key] = currentValue;
  });

  if (sourceValue) {
    normalized[currentLangKey.value] = sourceValue;
  }

  return normalized;
};

const syncI18nData = () => {
  const normalized = buildNormalizedI18nData(
    props.i18nData,
    props.sourceValue,
    lastSourceValue.value
  );
  const currentValue = cloneI18nData(props.i18nData);

  if (JSON.stringify(normalized) !== JSON.stringify(currentValue)) {
    emit("update:i18nData", normalized);
  }

  lastSourceValue.value = props.sourceValue;
};

watch(() => props.i18nData, syncI18nData, { deep: true, immediate: true });
watch(() => [props.sourceValue, currentLangKey.value], syncI18nData);

const openDialog = () => {
  i18nDialogRef.value.open();
};

const handleConfirm = (value: I18nData) => {
  emit("update:i18nData", value);
};
</script>
<style lang="scss" scoped>
.svgIcon {
  cursor: pointer;

  &:hover {
    color: var();
  }
}
</style>
