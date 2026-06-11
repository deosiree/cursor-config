/**
 * @fileoverview i18n 纯函数聚合模块。
 *
 * - {@link resolveI18nJsonText}：I18nInput 存库的 JSON wire / 纯文本解析（gateway、表单、列表 wire 字段）
 * - {@link resolveI18nText}：UI 展示解析（侧栏、面包屑、路由 meta/别名）；在 JSON 之外还支持 vue-i18n message key
 *
 * 选用：菜单 name 字段展示/搜索用 resolveI18nJsonText；壳层 meta.title 用 resolveI18nText。
 */
import i18n from "@/i18n";

/**
 * I18nInput JSON wire 的 locale 别名映射。
 * 解析时按当前 locale 依次尝试列表中的 key。
 */
export const I18N_JSON_LOCALE_MAP = {
  "zh-CN": ["zh-CN", "zh_CN", "zh"],
  "en-US": ["en-US", "en_US", "en"],
  "es-ES": ["es-ES", "es_ES", "es"],
  "ru-RU": ["ru-RU", "ru_RU", "ru"],
} as const;

/** {@link I18N_JSON_LOCALE_MAP} 支持的 locale 键。 */
export type I18nJsonLocale = keyof typeof I18N_JSON_LOCALE_MAP;

const DEFAULT_I18N_JSON_LOCALE: I18nJsonLocale = "zh-CN";

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

/**
 * 解析 I18nInput JSON wire 或纯文本，按 locale 取展示文案。
 * 不做 vue-i18n message key 查找；适用于 gateway 映射、表单 wire 字段、列表/搜索。
 *
 * @param value - JSON 字符串、JSON 对象或纯文本
 * @param locale - 目标语言（如 `zh-CN`）
 * @param fallbackText - JSON 未命中时的兜底文案（如已解析的 menuName）
 * @returns 当前 locale 下的展示文案
 * @example
 * resolveI18nJsonText('{"zh-CN":"用户","en-US":"User"}', 'en-US') // "User"
 */
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

/**
 * UI 展示层文案解析：I18nInput JSON → vue-i18n key → 原样文本。
 * 适用于侧栏、面包屑、路由 meta.title / 别名等壳层场景。
 *
 * @param title - 路由 meta 或菜单展示字段
 * @returns 当前 global locale 下的展示文案
 * @example
 * resolveI18nText('{"zh-CN":"系统","en-US":"System"}') // 按当前语言
 * resolveI18nText('用户管理') // 若存在 i18n key 则翻译，否则原样返回
 */
export function resolveI18nText(title: unknown) {
  if (typeof title !== "string" || !title) {
    return "";
  }

  if (parseI18nJsonText(title)) {
    const localized = resolveI18nJsonText(title, i18n.global.locale.value);
    if (localized) return localized;
  }

  const hasKey = i18n.global.te(title);
  if (hasKey) {
    return i18n.global.t(title);
  }
  return title;
}
