/**
 * sample-nebula — nameIdentifier 风格完整参考（合并到项目 formRules.ts）
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

function formatCodePoint(char: string): string {
  const cp = char.codePointAt(0) ?? 0;
  return `U+${cp.toString(16).toUpperCase().padStart(4, "0")}`;
}

export function normName(value: string | null | undefined, maxLength: number): string {
  if (value == null || value === "") return "";
  let cleaned = value.trim();
  cleaned = cleaned.replace(new RegExp(INVISIBLE_PATTERN, "gu"), "");
  cleaned = cleaned.replace(new RegExp(DANGEROUS_REGEX.source, "g"), "");
  return cleaned.normalize("NFC").slice(0, maxLength);
}

export function trimNameOnBlur(
  model: Record<string, unknown>,
  field: string,
  formRef?: FormInstance | null
): void {
  const raw = model[field];
  if (typeof raw !== "string") return;
  const next = raw.trim();
  if (next !== raw) {
    model[field] = next;
    void formRef?.validateField(field);
  }
}

export function createNameValidator(options: {
  label: string;
  maxLength: number;
}): NonNullable<FormItemRule["validator"]> {
  const { label, maxLength } = options;
  const { t } = i18n.global;
  const fail = (messageKey: string, extra?: Record<string, unknown>): never => {
    throw new Error(String(t(messageKey, { label, maxLength, ...extra })));
  };

  function validateNameValue(raw: string): void {
    const trimmed = raw.trim();
    if (trimmed.length === 0) fail("{label}不能为空");
    if (trimmed.length > maxLength) fail("{label}不能超过 {maxLength} 个字符");

    const invisible = trimmed.match(INVISIBLE_REGEX);
    if (invisible) {
      fail("{label}包含不可见控制字符 ({detail})", { detail: formatCodePoint(invisible[0]) });
    }
    const dangerous = trimmed.match(DANGEROUS_REGEX);
    if (dangerous) fail("{label}不能包含字符: {detail}", { detail: dangerous[0] });
    if (PATH_TRAVERSAL_REGEX.test(trimmed)) fail("{label}不能包含目录遍历字符");
    if (!WHITELIST_CHAR_REGEX.test(trimmed)) fail("仅允许中文、西文、数字、下划线");

    const firstChar = [...trimmed][0] ?? "";
    if (!FIRST_CHAR_REGEX.test(firstChar)) fail("{label}首字符不能为数字或下划线");
  }

  return (_rule, value, callback) => {
    try {
      validateNameValue(typeof value === "string" ? value : String(value ?? ""));
      callback();
    } catch (error) {
      callback(error as Error);
    }
  };
}

export function createMenuNameRules(): FormItemRule[] {
  const { t } = i18n.global;
  return [
    {
      validator: createNameValidator({ label: t("菜单名"), maxLength: NAME_MAX_LENGTH.menuName }),
      trigger: ["blur", "change"],
    },
  ];
}
