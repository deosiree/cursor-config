import type { App } from "vue";
import { reactive, watch } from "vue";
import i18n from "@/i18n";
import type { Lang } from "@/i18n/messages";

/** 布局尺寸档位（表单 label、查询控件、描述列表等共用） */
export type LayoutSize = "sm" | "md" | "lg" | "xl";

/** 已配置语言；接入俄文时在 messages 增加 ru-RU 后补 preset 即可 */
export type LocaleLayoutLocale = Lang | "ru-RU";

const DEFAULT_LOCALE: LocaleLayoutLocale = "zh-CN";

export interface LocaleLayoutPreset {
  /** el-form :label-width，一般为 px */
  formLabel: Record<LayoutSize, string>;
  /** 查询区 el-input / el-select 等控件宽度，px 或 % */
  queryField: Record<LayoutSize, string>;
  /** el-descriptions :label-width，支持 px 或 % */
  descriptionsLabel: string;
  /** el-descriptions-item width，建议用 % */
  descriptionsItem: Record<LayoutSize, string>;
  /** 侧栏展开宽度，px；折叠宽度见 SCSS $sidebar-width-collapsed，与语言无关 */
  sidebarWidth: Record<LayoutSize, string>;
}

export const LOCALE_LAYOUT_PRESETS: Record<LocaleLayoutLocale, LocaleLayoutPreset> = {
  "zh-CN": {
    formLabel: { sm: "80px", md: "100px", lg: "120px", xl: "160px" },
    queryField: { sm: "160px", md: "200px", lg: "240px", xl: "280px" },
    descriptionsLabel: "15%",
    descriptionsItem: { sm: "30%", md: "35%", lg: "40%", xl: "45%" },
    sidebarWidth: { sm: "180px", md: "210px", lg: "230px", xl: "250px" },
  },
  "en-US": {
    formLabel: { sm: "100px", md: "120px", lg: "150px", xl: "200px" },
    queryField: { sm: "180px", md: "220px", lg: "260px", xl: "300px" },
    descriptionsLabel: "22%",
    descriptionsItem: { sm: "38%", md: "42%", lg: "45%", xl: "48%" },
    sidebarWidth: { sm: "220px", md: "260px", lg: "280px", xl: "300px" },
  },
  "ru-RU": {
    formLabel: { sm: "120px", md: "150px", lg: "200px", xl: "260px" },
    queryField: { sm: "200px", md: "240px", lg: "280px", xl: "320px" },
    descriptionsLabel: "28%",
    descriptionsItem: { sm: "40%", md: "45%", lg: "48%", xl: "50%" },
    sidebarWidth: { sm: "240px", md: "280px", lg: "300px", xl: "320px" },
  },
};

export interface LocaleLayoutState {
  formLabel: Record<LayoutSize, string>;
  queryField: Record<LayoutSize, string>;
  descriptionsLabel: string;
  descriptionsItem: Record<LayoutSize, string>;
  sidebarWidth: Record<LayoutSize, string>;
}

export function resolveLocaleLayoutLocale(locale: string): LocaleLayoutLocale {
  if (locale in LOCALE_LAYOUT_PRESETS) return locale as LocaleLayoutLocale;
  const lower = locale.toLowerCase();
  if (lower.startsWith("ru")) return "ru-RU";
  if (lower.startsWith("en")) return "en-US";
  if (lower.startsWith("zh")) return "zh-CN";
  return DEFAULT_LOCALE;
}

export function getLocaleLayoutPreset(locale: string): LocaleLayoutPreset {
  return LOCALE_LAYOUT_PRESETS[resolveLocaleLayoutLocale(locale)];
}

export function createEmptyLayoutState(): LocaleLayoutState {
  const preset = LOCALE_LAYOUT_PRESETS[DEFAULT_LOCALE];
  return {
    formLabel: { ...preset.formLabel },
    queryField: { ...preset.queryField },
    descriptionsLabel: preset.descriptionsLabel,
    descriptionsItem: { ...preset.descriptionsItem },
    sidebarWidth: { ...preset.sidebarWidth },
  };
}

/** 将 preset 写入响应式 state（供插件在语言切换时同步） */
export function applyLocaleLayout(state: LocaleLayoutState, locale: string) {
  const preset = getLocaleLayoutPreset(locale);
  Object.assign(state.formLabel, preset.formLabel);
  Object.assign(state.queryField, preset.queryField);
  state.descriptionsLabel = preset.descriptionsLabel;
  Object.assign(state.descriptionsItem, preset.descriptionsItem);
  Object.assign(state.sidebarWidth, preset.sidebarWidth);
}

export const LOCALE_LAYOUT_KEY = Symbol("localeLayout");

/**
 * 注册全局布局尺寸：模板可用 $localeLayout，脚本可用 useLocaleLayout()
 * 需在 app.use(i18n) 之后安装。
 */
export function setupLocaleLayout(app: App) {
  const state = reactive<LocaleLayoutState>(createEmptyLayoutState());

  const sync = () => applyLocaleLayout(state, i18n.global.locale.value);
  sync();
  watch(() => i18n.global.locale.value, sync);

  app.provide(LOCALE_LAYOUT_KEY, state);
  app.config.globalProperties.$localeLayout = state;
}
