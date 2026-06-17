# 告警配置-locale归一

来源提交 `7fd591de`：AlarmFormDialog 将 `toInputLocaleKey` / `toWireLocaleKey` 替换为 `normalizeI18nLocaleCode` / `normalizeI18nDataLocaleKeys`。

关键文件：`template/after/src/views/system/alarmConfig/components/AlarmFormDialog.vue`（i18n 辅助函数段）
