import { computed, ref } from "vue";
import enLocale from "element-plus/es/locale/lang/en";
import zhCnLocale from "element-plus/es/locale/lang/zh-cn";
import { LanguageEnum } from "@/enums/settings/locale.enum";
import enMessages from "./messages/en";
import zhCnMessages from "./messages/zh-cn";

export type AppLanguage = LanguageEnum.ZH_CN | LanguageEnum.EN;

type MessageTree = Record<string, unknown>;

const LANGUAGE_STORAGE_KEY = "language";
const FALLBACK_LANGUAGE: AppLanguage = LanguageEnum.ZH_CN;

const messages: Record<AppLanguage, MessageTree> = {
  [LanguageEnum.ZH_CN]: zhCnMessages,
  [LanguageEnum.EN]: enMessages,
};

function normalizeLanguage(language?: string | null): AppLanguage {
  return language === LanguageEnum.EN ? LanguageEnum.EN : LanguageEnum.ZH_CN;
}

function readStoredLanguage(): AppLanguage {
  if (typeof window === "undefined") {
    return FALLBACK_LANGUAGE;
  }
  return normalizeLanguage(window.localStorage.getItem(LANGUAGE_STORAGE_KEY));
}

function getMessageValue(source: MessageTree, key: string): unknown {
  return key.split(".").reduce<unknown>((current, segment) => {
    if (current && typeof current === "object" && segment in (current as Record<string, unknown>)) {
      return (current as Record<string, unknown>)[segment];
    }
    return undefined;
  }, source);
}

export const currentLanguage = ref<AppLanguage>(readStoredLanguage());

export function getCurrentLanguage(): AppLanguage {
  return currentLanguage.value;
}

export function setCurrentLanguage(language?: string | null): AppLanguage {
  const normalized = normalizeLanguage(language);
  currentLanguage.value = normalized;

  if (typeof window !== "undefined") {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, normalized);
  }

  return normalized;
}

export function t(key: string, fallback?: string): string {
  const currentValue = getMessageValue(messages[currentLanguage.value], key);
  if (typeof currentValue === "string") {
    return currentValue;
  }

  const fallbackValue = getMessageValue(messages[FALLBACK_LANGUAGE], key);
  if (typeof fallbackValue === "string") {
    return fallbackValue;
  }

  return fallback ?? key;
}

export function resolveElementLocale(language?: string | null) {
  return normalizeLanguage(language) === LanguageEnum.EN ? enLocale : zhCnLocale;
}

export const elementLocale = computed(() => resolveElementLocale(currentLanguage.value));
