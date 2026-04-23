// Legacy backup only.
// Do not register this runtime after the new i18n scheme is enabled.

export { default as legacyZhCnLocale } from "./package/zh-cn";
export { default as legacyEnLocale } from "./package/en";

export const LEGACY_I18N_BACKUP_NOTE =
  "Old i18n dictionaries are retained for migration and audit only.";
