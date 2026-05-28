/**
 * AUTO-GENERATED from formRules.ts — do not edit.
 * Regenerate: node scripts/extract-fragments.js
 */
import type { FormInstance, FormItemRule } from "element-plus";
import { nextTick } from "vue";
import i18n from "@/i18n";
export interface PwdCtx {
  getPassword: () => string;
  getConfirmPassword: () => string;
  getFormRef: () => FormInstance | null | undefined;
  /** 联动 validateField 的 prop，默认 confirmPassword */
  confirmProp?: string;
}

export interface PwdPolicy {
  minLength: number;
  requireUppercase?: boolean;
  requireLowercase?: boolean;
  requireDigit?: boolean;
  requireSpecial?: boolean;
}

export interface PwdPairOpt {
  policy?: PwdPolicy;
  trigger?: FormItemRule["trigger"];
}

export function pwdPlcyTip(plcy?: PwdPolicy): string {
  const { t } = i18n.global;
  const p = plcy ?? { minLength: 6 };
  const parts: string[] = [];
  if (p.requireDigit) parts.push(t("数字"));
  if (p.requireUppercase && p.requireLowercase) {
    parts.push(t("大小写字母"));
  } else {
    if (p.requireUppercase) parts.push(t("大写字母"));
    if (p.requireLowercase) parts.push(t("小写字母"));
  }
  if (p.requireSpecial) parts.push(t("特殊字符"));
  const extra = parts.length ? t("，包括{items}", { items: parts.join("、") }) : "";
  return t("密码为必填项，至少{minLength}位{extra}", {
    minLength: p.minLength,
    extra,
  });
}

export function asRuleArray(rule: FormItemRule | FormItemRule[]): FormItemRule[] {
  return Array.isArray(rule) ? rule : [rule];
}

export function requiredRule(
  message: string,
  triggerOrOptions?: string | RuleOptions
): FormItemRule | FormItemRule[] {
  const options: RuleOptions =
    typeof triggerOrOptions === "string" ? { trigger: triggerOrOptions } : (triggerOrOptions ?? {});
  const trigger = options.trigger ?? "blur";
  const rules: FormItemRule[] = [{ required: true, message, trigger }];

  if (options?.pattern != null && options?.patternMessage != null) {
    rules.push({
      pattern: options.pattern,
      message: options.patternMessage,
      trigger,
    });
  }
  if (options?.min != null && options?.minMessage != null) {
    const lenRule: FormItemRule = {
      min: options.min,
      message: options.minMessage,
      trigger,
    };
    if (options?.max != null) {
      lenRule.max = options.max;
    }
    rules.push(lenRule);
  }

  return rules.length === 1 ? rules[0] : rules;
}

export function createConfirmPasswordRules(getPassword: () => string) {
  const { t } = i18n.global;
  return [
    ...asRuleArray(requiredRule(t("请再次输入密码"), { trigger: ["blur", "change"] })),
    {
      validator: (_: unknown, value: string, callback: (error?: Error) => void) => {
        if (!value) {
          callback(new Error(t("请再次输入密码")));
        } else if (value !== getPassword()) {
          callback(new Error(t("两次输入的密码不一致")));
        } else {
          callback();
        }
      },
      trigger: ["blur", "change"],
    },
  ];
}

export function cfmPwdRules(
  getPassword: () => string,
  minLen: number = 6,
  trigger: FormItemRule["trigger"] = ["blur", "change"]
): FormItemRule[] {
  const { t } = i18n.global;
  return [
    { required: true, message: t("请再次输入密码"), trigger },
    { min: minLen, message: t(`密码不能少于 ${minLen} 位`), trigger },
    {
      validator: (_: unknown, value: string, callback: (error?: Error) => void) => {
        const val = String(value ?? "");
        if (!val) return callback();
        if (val.length < minLen) {
          return callback(new Error(t(`密码不能少于 ${minLen} 位`)));
        }
        if (val !== getPassword()) {
          callback(new Error(t("两次输入的密码不一致")));
        } else {
          callback();
        }
      },
      trigger,
    },
  ];
}

export function pwdMinRules(
  minLen: number,
  trigger: FormItemRule["trigger"] = ["blur", "change"]
): FormItemRule[] {
  const { t } = i18n.global;
  return [
    { required: true, message: t("密码不能为空"), trigger },
    { min: minLen, message: t(`密码不能少于 ${minLen} 位`), trigger },
  ];
}

export function pwdPair(
  ctx: PwdCtx,
  options?: PwdPairOpt
): { password: FormItemRule[]; confirmPassword: FormItemRule[] }
