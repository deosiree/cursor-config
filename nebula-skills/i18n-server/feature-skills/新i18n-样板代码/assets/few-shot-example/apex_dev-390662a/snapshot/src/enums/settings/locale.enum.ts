/**
 * 语言区域枚举
 *
 * 使用 BCP 47 标签，与租户 API 契约保持一致。
 */
export enum LocaleEnum {
  /**
   * 简体中文（中国）
   */
  ZH_CN = "zh-CN",

  /**
   * 英文（美国）
   */
  EN_US = "en-US",
}

/**
 * 租户默认时区
 */
export const DEFAULT_TIMEZONE = "Asia/Shanghai";

/**
 * 租户默认语言区域
 */
export const DEFAULT_LOCALE = LocaleEnum.ZH_CN;

/**
 * 租户可选语言区域
 */
export const LOCALE_OPTIONS = [
  { label: "中文", value: LocaleEnum.ZH_CN },
  { label: "English", value: LocaleEnum.EN_US },
] as const;

/**
 * 租户可选时区
 */
export const TIMEZONE_OPTIONS = [
  { label: "Asia/Shanghai", value: "Asia/Shanghai" },
  { label: "UTC", value: "UTC" },
  { label: "Asia/Singapore", value: "Asia/Singapore" },
  { label: "Asia/Tokyo", value: "Asia/Tokyo" },
  { label: "Europe/London", value: "Europe/London" },
  { label: "America/New_York", value: "America/New_York" },
  { label: "America/Los_Angeles", value: "America/Los_Angeles" },
] as const;
