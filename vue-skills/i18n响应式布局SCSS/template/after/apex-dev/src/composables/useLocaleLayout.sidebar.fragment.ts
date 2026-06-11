import { computed, inject, type ComputedRef } from "vue";
import { useI18n } from "vue-i18n";
import {
  getLocaleLayoutPreset,
  LOCALE_LAYOUT_KEY,
  type LayoutSize,
  type LocaleLayoutState,
} from "@/plugins/locale-layout";

function pickLayoutValue<T>(
  injected: LocaleLayoutState | null,
  locale: ComputedRef<string>,
  getter: (preset: ReturnType<typeof getLocaleLayoutPreset>) => T,
  injectedGetter: (state: LocaleLayoutState) => T
) {
  return computed(() =>
    injected ? injectedGetter(injected) : getter(getLocaleLayoutPreset(locale.value))
  );
}

/**
 * 随语言切换的布局尺寸（与全局 $localeLayout 同源）
 *
 * @example 模板（无需 import，需已安装 localeLayout 插件）
 * <el-form :label-width="$localeLayout.formLabel.lg" />
 * <el-select :style="{ width: $localeLayout.queryField.md }" />
 * <el-descriptions :label-width="$localeLayout.descriptionsLabel" />
 * <el-descriptions-item :width="$localeLayout.descriptionsItem.md" />
 * <div :style="{ width: $localeLayout.sidebarWidth.md }" />
 *
 * @example 脚本
 * const { formLabelWidth } = useLocaleLayout();
 * :label-width="formLabelWidth('lg')"
 */
export function useLocaleLayout() {
  const injected = inject<LocaleLayoutState | null>(LOCALE_LAYOUT_KEY, null);
  const { locale } = useI18n();

  const formLabelWidth = (size: LayoutSize = "lg") =>
    pickLayoutValue(
      injected,
      locale,
      (p) => p.formLabel[size],
      (s) => s.formLabel[size]
    );

  const queryFieldWidth = (size: LayoutSize = "md") =>
    pickLayoutValue(
      injected,
      locale,
      (p) => p.queryField[size],
      (s) => s.queryField[size]
    );

  const descriptionsLabelWidth = pickLayoutValue(
    injected,
    locale,
    (p) => p.descriptionsLabel,
    (s) => s.descriptionsLabel
  );

  const descriptionsItemWidth = (size: LayoutSize = "md") =>
    pickLayoutValue(
      injected,
      locale,
      (p) => p.descriptionsItem[size],
      (s) => s.descriptionsItem[size]
    );

  const sidebarWidth = (size: LayoutSize = "md") =>
    pickLayoutValue(
      injected,
      locale,
      (p) => p.sidebarWidth[size],
      (s) => s.sidebarWidth[size]
    );

  return {
    /** 与 $localeLayout 相同；未安装插件时为 null，请用上方 computed 方法 */
    layout: injected,
    formLabelWidth,
    queryFieldWidth,
    descriptionsLabelWidth,
    descriptionsItemWidth,
    sidebarWidth,
  };
}

/** @deprecated 请使用 useLocaleLayout 或 $localeLayout */
export function useFormLabelWidth(size: LayoutSize = "lg") {
  const { formLabelWidth } = useLocaleLayout();
  return { formLabelWidth: formLabelWidth(size) };
}
