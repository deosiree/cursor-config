// template/after — normalize 归一（目标态）
import { normalizeI18nDataLocaleKeys, normalizeI18nLocaleCode } from "@/utils/i18n";

const getCurrentLocaleKey = () => normalizeI18nLocaleCode(locale.value);

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
  // ... JSON 字符串 / 纯文本 fallback 不变
};

const stringifyI18nData = (i18nData: I18nData) => {
  const data = Object.entries(i18nData).reduce<Record<string, string>>((result, [key, value]) => {
    const text = value.trim();
    if (text) result[normalizeI18nLocaleCode(key)] = text;
    return result;
  }, {});
  return JSON.stringify(data);
};
