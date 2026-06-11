import type { LocaleLayoutState } from "@/plugins/locale-layout";

declare module "vue" {
  interface ComponentCustomProperties {
    /** 随语言切换的侧栏展开宽度，见 src/plugins/locale-layout.ts */
    $localeLayout: LocaleLayoutState;
  }
}

export {};
