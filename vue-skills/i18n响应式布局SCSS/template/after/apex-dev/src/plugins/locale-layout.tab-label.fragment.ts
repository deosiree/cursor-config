// GREEN 片段：tabLabelMaxWidth 四档 preset（摘自 apex_dev locale-layout.ts）
export interface LocaleLayoutPreset {
  // ...
  sidebarWidth: Record<LayoutSize, string>;
  /** PageTabShell / SpanByTips Tab 标签最大宽度，em 或 px */
  tabLabelMaxWidth: Record<LayoutSize, string>;
}

export const LOCALE_LAYOUT_PRESETS = {
  "zh-CN": {
    // ...
    tabLabelMaxWidth: { sm: "3em", md: "4em", lg: "5em", xl: "6em" },
  },
  "en-US": {
    // ...
    tabLabelMaxWidth: { sm: "6em", md: "10em", lg: "14em", xl: "18em" },
  },
  "ru-RU": {
    // ...
    tabLabelMaxWidth: { sm: "10em", md: "14em", lg: "18em", xl: "22em" },
  },
};

// createEmptyLayoutState / applyLocaleLayout：
// tabLabelMaxWidth: { ...preset.tabLabelMaxWidth },
// Object.assign(state.tabLabelMaxWidth, preset.tabLabelMaxWidth);
