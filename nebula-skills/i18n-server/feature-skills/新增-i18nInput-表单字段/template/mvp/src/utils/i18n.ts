import i18n from "@/i18n";
import { DEFAULT_LOCALE, LocaleEnum } from "@/enums/settings/locale.enum";

export function translateRouteTitle(title: any) {
  if (typeof title !== "string") {
    return "";
  }

  const hasKey = i18n.global.te(title);
  if (hasKey) {
    const translatedTitle = i18n.global.t(title);
    return translatedTitle;
  }
  return title;
}

export const I18N_JSON_LOCALE_MAP = {
  [LocaleEnum.ZH_CN]: [LocaleEnum.ZH_CN, "zh_CN", "zh"],
  [LocaleEnum.EN_US]: [LocaleEnum.EN_US, "en_US", "en"],
  "es-ES": ["es-ES", "es_ES", "es"],
  "ru-RU": ["ru-RU", "ru_RU", "ru"],
} as const;

export type I18nJsonLocale = keyof typeof I18N_JSON_LOCALE_MAP;

const DEFAULT_I18N_JSON_LOCALE: I18nJsonLocale = DEFAULT_LOCALE;

const isPlainRecord = (value: unknown): value is Record<string, unknown> =>
  Object.prototype.toString.call(value) === "[object Object]";

const normalizeI18nJsonLocale = (locale?: string): I18nJsonLocale => {
  const currentLocale = locale?.trim();
  if (!currentLocale) return DEFAULT_I18N_JSON_LOCALE;

  const exactLocale = Object.keys(I18N_JSON_LOCALE_MAP).find((key) => key === currentLocale);
  if (exactLocale) return exactLocale as I18nJsonLocale;

  const matchedLocale = Object.entries(I18N_JSON_LOCALE_MAP).find(([, aliases]) =>
    (aliases as readonly string[]).includes(currentLocale)
  )?.[0];

  return (matchedLocale as I18nJsonLocale | undefined) || DEFAULT_I18N_JSON_LOCALE;
};

const parseI18nJsonText = (value: unknown): Record<string, string> | undefined => {
  if (isPlainRecord(value)) {
    return Object.entries(value).reduce<Record<string, string>>((result, [key, item]) => {
      if (typeof item === "string") {
        result[key] = item.trim();
      }
      return result;
    }, {});
  }

  if (typeof value !== "string") return undefined;

  try {
    const parsed = JSON.parse(value);
    return isPlainRecord(parsed) ? parseI18nJsonText(parsed) : undefined;
  } catch {
    return undefined;
  }
};

export const resolveI18nJsonText = (
  value: unknown,
  locale: string | undefined,
  fallbackText?: unknown
) => {
  const textMap = parseI18nJsonText(value);
  const normalizedLocale = normalizeI18nJsonLocale(locale);
  const fallback = typeof fallbackText === "string" ? fallbackText.trim() : "";

  if (!textMap) {
    return typeof value === "string" && value.trim() ? value.trim() : fallback;
  }

  const pickKeys = [
    ...I18N_JSON_LOCALE_MAP[normalizedLocale],
    ...(fallback ? ["__fallback__"] : []),
    ...I18N_JSON_LOCALE_MAP[DEFAULT_I18N_JSON_LOCALE],
    ...Object.keys(textMap),
  ];

  for (const key of pickKeys) {
    const text = key === "__fallback__" ? fallback : textMap[key];
    if (text?.trim()) return text.trim();
  }

  return "";
};
