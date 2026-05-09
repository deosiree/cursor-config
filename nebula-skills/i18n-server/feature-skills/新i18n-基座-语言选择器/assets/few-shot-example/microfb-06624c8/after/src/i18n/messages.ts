import zhCN from "./locales/zh_CN.json";
import enUS from "./locales/en_US.json";
import type { LocaleMessages } from "vue-i18n-kit-sy/runtime";

export type Lang = "zh-CN" | "en-US";
export const LANG_STORAGE_KEY = "lang"; // localstorage中的语言设置

export const messages: Record<Lang, LocaleMessages> = {
  "zh-CN": zhCN,
  "en-US": enUS,
};

export const fallbackMap: Partial<Record<Lang, Lang[]>> = {
  "en-US": ["zh-CN"],
  "zh-CN": ["en-US"],
};

/**
 * 语言选项(下拉菜单),供src/components/LangSelect/index.vue消费
 */
export const langOptions: { label: string; value: Lang }[] = [
  { label: "中文", value: "zh-CN" },
  { label: "English", value: "en-US" },
];
