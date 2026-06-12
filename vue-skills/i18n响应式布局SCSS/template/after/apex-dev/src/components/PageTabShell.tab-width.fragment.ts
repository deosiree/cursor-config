// GREEN：PageTabShell 项总宽随 tabLabelMaxWidth 推导（摘自 index.vue）
/** showTabActions 时 Tab 项额外占位：左右 padding 40px + 齿轮按钮区约 16px */
const TAB_ITEM_ACTION_CHROME = "3.5rem";

const tabsStyle = computed(() => {
  const labelMaxCss = toCssSize(props.tabLabelMaxWidth, "4em");
  const tabWidthFromLabel = `calc(${labelMaxCss} + ${TAB_ITEM_ACTION_CHROME})`;
  const defaultTabWidth = props.showTabActions ? tabWidthFromLabel : "auto";
  const normalizedTabWidth = props.tabItemWidth
    ? toCssSize(props.tabItemWidth, defaultTabWidth)
    : defaultTabWidth;
  return {
    "--page-tab-item-width": normalizedTabWidth,
    // ...
  };
});

// .el-tabs__item { width: var(--page-tab-item-width); overflow: hidden; }
