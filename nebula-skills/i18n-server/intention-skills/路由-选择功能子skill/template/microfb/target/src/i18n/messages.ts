import zhCN from "./locales/zh_CN.json";
import enUS from "./locales/en_US.json";

export type Lang = "zh-CN" | "en-US";
export const LANG_STORAGE_KEY = "lang";

export const messages = {
  "zh-CN": zhCN,
  "en-US": enUS,
};

export const fallbackMap: Partial<Record<Lang, Lang[]>> = {
  "zh-CN": ["en-US"],
  "en-US": ["zh-CN"],
};
