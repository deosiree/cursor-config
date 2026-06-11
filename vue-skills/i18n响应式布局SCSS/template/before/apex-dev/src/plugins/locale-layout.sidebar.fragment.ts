import type { App } from "vue";
import { reactive, watch } from "vue";
import i18n from "@/i18n";
import type { Lang } from "@/i18n/messages";

/** 甯冨眬灏哄妗ｄ綅锛堣〃鍗?label銆佹煡璇㈡帶浠躲€佹弿杩板垪琛ㄧ瓑鍏辩敤锛?*/
export type LayoutSize = "sm" | "md" | "lg" | "xl";

/** 宸查厤缃瑷€锛涙帴鍏ヤ縿鏂囨椂鍦?messages 澧炲姞 ru-RU 鍚庤ˉ preset 鍗冲彲 */
export type LocaleLayoutLocale = Lang | "ru-RU";

const DEFAULT_LOCALE: LocaleLayoutLocale = "zh-CN";

export interface LocaleLayoutPreset {
  /** el-form :label-width锛屼竴鑸负 px */
  formLabel: Record<LayoutSize, string>;
  /** 鏌ヨ鍖?el-input / el-select 绛夋帶浠跺搴︼紝px 鎴?% */
  queryField: Record<LayoutSize, string>;
  /** el-descriptions :label-width锛屾敮鎸?px 鎴?% */
  descriptionsLabel: string;
  /** el-descriptions-item width锛屽缓璁敤 % */
  descriptionsItem: Record<LayoutSize, string>;
}

export const LOCALE_LAYOUT_PRESETS: Record<LocaleLayoutLocale, LocaleLayoutPreset> = {
  "zh-CN": {
    formLabel: { sm: "80px", md: "100px", lg: "120px", xl: "160px" },
    queryField: { sm: "160px", md: "200px", lg: "240px", xl: "280px" },
    descriptionsLabel: "15%",
    descriptionsItem: { sm: "30%", md: "35%", lg: "40%", xl: "45%" },
  },
  "en-US": {
    formLabel: { sm: "100px", md: "120px", lg: "150px", xl: "200px" },
    queryField: { sm: "180px", md: "220px", lg: "260px", xl: "300px" },
    descriptionsLabel: "22%",
    descriptionsItem: { sm: "38%", md: "42%", lg: "45%", xl: "48%" },
  },
  "ru-RU": {
    formLabel: { sm: "120px", md: "150px", lg: "200px", xl: "260px" },
    queryField: { sm: "200px", md: "240px", lg: "280px", xl: "320px" },
    descriptionsLabel: "28%",
    descriptionsItem: { sm: "40%", md: "45%", lg: "48%", xl: "50%" },
  },
};

export interface LocaleLayoutState {
  formLabel: Record<LayoutSize, string>;
  queryField: Record<LayoutSize, string>;
  descriptionsLabel: string;
  descriptionsItem: Record<LayoutSize, string>;
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
  };
}

/** 灏?preset 鍐欏叆鍝嶅簲寮?state锛堜緵鎻掍欢鍦ㄨ瑷€鍒囨崲鏃跺悓姝ワ級 */
export function applyLocaleLayout(state: LocaleLayoutState, locale: string) {
  const preset = getLocaleLayoutPreset(locale);
  Object.assign(state.formLabel, preset.formLabel);
  Object.assign(state.queryField, preset.queryField);
  state.descriptionsLabel = preset.descriptionsLabel;
  Object.assign(state.descriptionsItem, preset.descriptionsItem);
}

export const LOCALE_LAYOUT_KEY = Symbol("localeLayout");

/**
 * 娉ㄥ唽鍏ㄥ眬甯冨眬灏哄锛氭ā鏉垮彲鐢?$localeLayout锛岃剼鏈彲鐢?useLocaleLayout()
 * 闇€鍦?app.use(i18n) 涔嬪悗瀹夎銆? */
export function setupLocaleLayout(app: App) {
  const state = reactive<LocaleLayoutState>(createEmptyLayoutState());

  const sync = () => applyLocaleLayout(state, i18n.global.locale.value);
  sync();
  watch(() => i18n.global.locale.value, sync);

  app.provide(LOCALE_LAYOUT_KEY, state);
  app.config.globalProperties.$localeLayout = state;
}
