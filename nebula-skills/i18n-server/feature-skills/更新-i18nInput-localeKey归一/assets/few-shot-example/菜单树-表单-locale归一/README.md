# 菜单树-表单-locale归一

MenuFormDialog 菜单名 `nameI18n` 对齐 I18nInput 重构后的 locale key 体系（参照 AlarmFormDialog `7fd591de` 模式）。

关键文件：`template/after/src/views/system/menu/components/MenuFormDialog.vue`（import + parseNameI18nData + stringifyNameI18nData 段）

历史 wire 含 `zh_CN` 时，`normalizeI18nDataLocaleKeys` 会合并为 `zh-CN`，主输入与弹窗同步。
