// RED 片段：扩展 tabLabelMaxWidth 前（无该字段）
export interface LocaleLayoutPreset {
  formLabel: Record<LayoutSize, string>;
  queryField: Record<LayoutSize, string>;
  descriptionsLabel: string;
  descriptionsItem: Record<LayoutSize, string>;
  sidebarWidth: Record<LayoutSize, string>;
  // tabLabelMaxWidth 尚未定义
}

// 页面写死 Tab 宽
// menu: tab-label-max-width="4em"
// securityConfig: tab-label-max-width="200px"
