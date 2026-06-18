// template/before — 旧 locale key 转换（待删除）
const getCurrentLocaleKey = () => locale.value.replace("-", "_");

const toInputLocaleKey = (key: string) => key.replace("-", "_");
const toWireLocaleKey = (key: string) => key.replace("_", "-");

const parseI18nData = (value?: unknown): I18nData => {
  if (!value) return {};
  if (typeof value === "object") {
    return Object.entries(value as Record<string, unknown>).reduce<I18nData>(
      (result, [key, item]) => {
        if (typeof item === "string") result[toInputLocaleKey(key)] = item;
        return result;
      },
      {}
    );
  }
  // ... JSON 字符串 / 纯文本 fallback 不变
};

const stringifyI18nData = (i18nData: I18nData) => {
  const data = Object.entries(i18nData).reduce<Record<string, string>>((result, [key, value]) => {
    const text = value.trim();
    if (text) result[toWireLocaleKey(key)] = text;
    return result;
  }, {});
  return JSON.stringify(data);
};
