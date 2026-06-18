/**
 * MenuFormDialog.vue — i18n 辅助函数段（localeKey 归一后）
 * 来源：apex_dev MenuFormDialog.vue + 7fd591de 模式
 */
import {
  resolveI18nJsonText,
  normalizeI18nDataLocaleKeys,
  normalizeI18nLocaleCode,
} from "@/utils/i18n";

interface I18nData {
  [key: string]: string;
}

const nameI18n = ref<I18nData>({});

const getCurrentLocaleKey = () => normalizeI18nLocaleCode(locale.value);

const cloneI18nData = (i18nData?: I18nData) => (i18nData ? { ...i18nData } : {});

const parseNameI18nData = (value?: unknown): I18nData => {
  if (!value) return {};

  if (typeof value === "object") {
    const parsed = Object.entries(value as Record<string, unknown>).reduce<I18nData>(
      (result, [key, item]) => {
        if (typeof item === "string") result[key] = item;
        return result;
      },
      {}
    );
    return normalizeI18nDataLocaleKeys(parsed);
  }

  if (typeof value !== "string") return {};

  try {
    const parsed = JSON.parse(value);
    return parseNameI18nData(parsed);
  } catch {
    return value.trim() ? { [getCurrentLocaleKey()]: value.trim() } : {};
  }
};

const updateLanguageValue = (i18nData: I18nData, value: string) => {
  const parsed = cloneI18nData(i18nData);
  parsed[getCurrentLocaleKey()] = value;
  return parsed;
};

const nameValue = computed({
  get: () => String(cloneI18nData(nameI18n.value)[getCurrentLocaleKey()] || ""),
  set: (value: string) => {
    nameI18n.value = updateLanguageValue(nameI18n.value, value);
    formData.value.name = value;
  },
});

const stringifyNameI18nData = () => {
  const data = Object.entries(nameI18n.value).reduce<Record<string, string>>(
    (result, [key, value]) => {
      const text = value.trim();
      if (text) result[normalizeI18nLocaleCode(key)] = text;
      return result;
    },
    {}
  );
  return JSON.stringify(data);
};

const syncNameI18nFromRaw = (rawName?: unknown) => {
  nameI18n.value = parseNameI18nData(rawName);
  formData.value.name = nameValue.value;
};

// 模板：<I18nInput v-model:i18n-data="nameI18n" :source-value="nameValue" />
// 提交：name: stringifyNameI18nData()
