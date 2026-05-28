/**
 * AUTO-GENERATED from formRules.ts — do not edit.
 * Regenerate: node scripts/extract-fragments.js
 */
import type { FormInstance, FormItemRule } from "element-plus";
import i18n from "@/i18n";
const INVISIBLE_PATTERN = String.raw`[\p{Cc}\p{Cf}\u2028\u2029]`;

const INVISIBLE_REGEX = new RegExp(INVISIBLE_PATTERN, "u");

const DANGEROUS_REGEX = /[<>&"'`/\\]/;

const PATH_TRAVERSAL_REGEX = /\.\.\/|\.\.\\/;

const WHITELIST_CHAR_REGEX = /^[\p{sc=Han}\p{sc=Latin}0-9_]+$/u;

const FIRST_CHAR_REGEX = /^[\p{sc=Han}\p{sc=Latin}]/u;

export type NameFieldKind = "username" | "tenantName" | "roleName" | "menuName";

export const NAME_MAX_LENGTH: Record<NameFieldKind, number> = {
  username: 64,
  tenantName: 128,
  roleName: 128,
  menuName: 128,
};

type RuleFail = (messageKey: string, extra?: Record<string, unknown>) => never;

function createRuleFail(bind?: Record<string, unknown>): RuleFail {
  const { t } = i18n.global;
  return (messageKey, extra) => {
    const params = bind || extra ? { ...bind, ...extra } : undefined;
    throw new Error(String(params ? t(messageKey, params) : t(messageKey)));
  };
}

function formatCodePoint(char: string): string {
  // 获取字符的 Unicode 代码点，若获取失败则默认为 0
  const cp = char.codePointAt(0) ?? 0;

  // 将代码点转换为十六进制大写字符串，并确保至少4位宽度（前导零填充）
  return `U+${cp.toString(16).toUpperCase().padStart(4, "0")}`;
}

export function normName(value: string | null | undefined, maxLength: number): string {
  if (value == null || value === "") {
    return "";
  }
  let cleaned = value.trim(); // 去除空格
  cleaned = cleaned.replace(new RegExp(INVISIBLE_PATTERN, "gu"), ""); // 去除不可见字符
  cleaned = cleaned.replace(new RegExp(DANGEROUS_REGEX.source, "g"), ""); // 去除危险字符
  return cleaned.normalize("NFC").slice(0, maxLength); // 返回规范化后的名称
}

export function trimFieldOnBlur<T extends object>(
  model: T,
  field: keyof T & string,
  formRef?: FormInstance | null
): void {
  const raw = model[field];
  if (typeof raw !== "string") {
    return;
  }
  const next = raw.trim(); // 去除空格
  if (next !== raw) {
    // 如果去除空格后与原值不同
    (model as Record<string, unknown>)[field] = next;
    // validateField 失败时会 reject 携带 fields，需吞掉以免控制台未处理 Promise
    void formRef?.validateField(field).catch(() => undefined);
  }
}

export function createNameValidator(options: {
  label: string;
  maxLength: number;
}

export function createMenuNameRules(): FormItemRule[] {
  const { t } = i18n.global;
  return [
    {
      validator: createNameValidator({
        label: t("菜单名"),
        maxLength: NAME_MAX_LENGTH.menuName,
      }),
      trigger: ["blur", "change"],
    },
  ];
}
