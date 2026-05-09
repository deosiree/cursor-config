/**
 * 租户相关常量配置
 */
import {
  TIMEZONE_OPTIONS,
  DEFAULT_TIMEZONE,
  LocaleEnum,
  DEFAULT_LOCALE,
} from "@/enums/settings/locale.enum";
import { trans } from "vue-i18n-kit-sy/runtime";

/**
 * 租户默认预设角色配置
 * - 用于新建租户时自动创建的角色
 * - 同时用于向导步骤 3 的角色展示
 */
export const DEFAULT_TENANT_ROLES = [
  {
    roleName: trans("管理员"),
    code: "admin",
    tag: trans("默认最高权限角色"),
    icon: "👑",
    description: trans("拥有该租户下所有菜单和所有设备的管理权限"),
    menuSummary: trans("所有页面"),
    deviceSummary: trans("所有设备"),
    sort: 1,
    status: 1,
  },
  {
    roleName: trans("审计员"),
    code: "auditor",
    tag: trans("审计只读角色"),
    icon: "📋",
    description: trans("仅用于查看审计日志、操作记录等信息，不具备设备控制权限"),
    menuSummary: trans("审计页面"),
    deviceSummary: trans("无"),
    sort: 2,
    status: 1,
  },
] as const;

export type DefaultTenantRole = (typeof DEFAULT_TENANT_ROLES)[number];

/**
 * 提取用于 API 创建角色的字段
 */
export function getRoleCreatePayloads(tenantId: string) {
  return DEFAULT_TENANT_ROLES.map(({ roleName, code, description, sort, status }) => ({
    roleName,
    code,
    description,
    sort,
    status,
    tenantId,
  }));
}

/**
 * 解析租户默认时区。
 * 优先使用浏览器时区，未命中受控选项时回退到默认值。
 */
export function resolveTenantDefaultTimezone(): string {
  const browserTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return normalizeTenantTimezone(browserTimeZone);
}

/**
 * 解析租户默认语言区域。
 * 优先使用浏览器语言，当前仅开放中文和英文。
 */
export function resolveTenantDefaultLocale(): LocaleEnum {
  const browserLocale = navigator.languages?.[0] || navigator.language || "";
  return normalizeTenantLocale(browserLocale);
}

/**
 * 将原始 timezone 归一化为租户受控时区。
 * 非法时区或空值时回退到默认值。
 */
export function normalizeTenantTimezone(rawTimezone?: string): string {
  // 1. 快速处理空值
  if (!rawTimezone?.trim()) return DEFAULT_TIMEZONE;

  const target = rawTimezone.trim().toLowerCase();

  // 2. 这里的优化点：如果在高频场景下，建议在外部提前构造一个 Map 或用更直接的查找
  // 如果选项不多，直接 find 即可，但要精简代码
  return (
    TIMEZONE_OPTIONS.find((opt) => opt.value.toLowerCase() === target)?.value ?? DEFAULT_TIMEZONE
  );
}

/**
 * 将原始 locale 归一化为租户受控语言区域。
 * 非中文/英文或空值时回退到默认值。
 */
export function normalizeTenantLocale(rawLocale?: string): LocaleEnum {
  const normalizedLocale = String(rawLocale ?? "").toLowerCase();

  if (normalizedLocale.startsWith("en")) {
    return LocaleEnum.EN_US;
  }

  if (normalizedLocale.startsWith("zh")) {
    return LocaleEnum.ZH_CN;
  }

  return DEFAULT_LOCALE;
}
