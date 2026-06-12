import type { App } from "vue";
import { reactive, watch } from "vue";
import i18n from "@/i18n";
import type { Lang } from "@/i18n/messages";

/** 布局尺寸档位（与 apex locale-layout 一致，便于后续响应式扩展） */
export type LayoutSize = "sm" | "md" | "lg" | "xl";

type SidebarLayoutLocale = Lang | "ru-RU";

const SIDEBAR_WIDTH_BY_LOCALE: Record<SidebarLayoutLocale, Record<LayoutSize, string>> = {
  "zh-CN": { sm: "180px", md: "210px", lg: "230px", xl: "250px" },
  "en-US": { sm: "220px", md: "260px", lg: "280px", xl: "300px" },
  "ru-RU": { sm: "240px", md: "280px", lg: "300px", xl: "320px" },
};

export interface LocaleLayoutState {
  sidebarWidth: Record<LayoutSize, string>;
}

function resolveSidebarLocale(locale: string): SidebarLayoutLocale {
  if (locale in SIDEBAR_WIDTH_BY_LOCALE) return locale as SidebarLayoutLocale;
  const lower = locale.toLowerCase();
  if (lower.startsWith("ru")) return "ru-RU";
  if (lower.startsWith("en")) return "en-US";
  if (lower.startsWith("zh")) return "zh-CN";
  return "zh-CN";
}

/** 注册侧栏展开宽度；模板用 $localeLayout.sidebarWidth.md。需在 app.use(i18n) 之后安装。 */
export function setupLocaleLayout(app: App) {
  const state = reactive<LocaleLayoutState>({
    sidebarWidth: { ...SIDEBAR_WIDTH_BY_LOCALE["zh-CN"] },
  });

  const sync = () => {
    Object.assign(
      state.sidebarWidth,
      SIDEBAR_WIDTH_BY_LOCALE[resolveSidebarLocale(i18n.global.locale.value)]
    );
  };
  sync();
  watch(() => i18n.global.locale.value, sync);

  app.config.globalProperties.$localeLayout = state;
}
