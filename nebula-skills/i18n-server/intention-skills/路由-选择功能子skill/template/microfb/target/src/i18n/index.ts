import { createAppI18n } from "vue-i18n-kit-sy/runtime";
import { fallbackMap, LANG_STORAGE_KEY, messages } from "./messages";

export default createAppI18n({
  defaultLocale: "zh-CN",
  localeStorageKey: LANG_STORAGE_KEY,
  fallbackMap,
  messages,
  missingWarn: false,
  fallbackWarn: false,
  globalInjection: true,
});
