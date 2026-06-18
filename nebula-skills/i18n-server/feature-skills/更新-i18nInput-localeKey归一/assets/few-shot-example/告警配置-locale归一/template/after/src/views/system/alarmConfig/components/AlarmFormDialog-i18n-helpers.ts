/**
 * AlarmFormDialog.vue — i18n 辅助函数段（localeKey 归一后）
 * 来源：apex_dev AlarmFormDialog.vue，提交 7fd591de
 */
import { normalizeI18nDataLocaleKeys, normalizeI18nLocaleCode } from "@/utils/i18n";

interface I18nData {
  [key: string]: string;
}

const getCurrentLocaleKey = () => normalizeI18nLocaleCode(locale.value);

const cloneI18nData = (i18nData?: I18nData) => (i18nData ? { ...i18nData } : {});

const parseI18nData = (value?: unknown): I18nData => {
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
    return parseI18nData(parsed);
  } catch {
    return value.trim() ? { [getCurrentLocaleKey()]: value.trim() } : {};
  }
};

const stringifyI18nData = (i18nData: I18nData) => {
  const data = Object.entries(i18nData).reduce<Record<string, string>>((result, [key, value]) => {
    const text = value.trim();
    if (text) result[normalizeI18nLocaleCode(key)] = text;
    return result;
  }, {});
  return JSON.stringify(data);
};

// formData.name / description / template 为 I18nData 对象
// 模板：<I18nInput v-model:i18n-data="formData.name" :source-value="nameValue" />
