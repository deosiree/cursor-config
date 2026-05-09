import type { FormItemRule } from "element-plus";
import { MSG } from "@/constants/form-validation";
import {
  CAPTCHA_PATTERN,
  EMAIL_PATTERN,
  PHONE_PATTERN,
  TENANT_NAME_PATTERN,
} from "@/constants/validation-patterns";

// 重新导出，便于按需导入
export { MSG } from "@/constants/form-validation";
export {
  CAPTCHA_PATTERN,
  EMAIL_PATTERN,
  PHONE_PATTERN,
  TENANT_NAME_PATTERN,
} from "@/constants/validation-patterns";

// ============ 规则工厂 ============

export interface RuleOptions {
  trigger?: string | string[];
  pattern?: RegExp;
  patternMessage?: string;
  min?: number;
  max?: number;
  /** 长度校验消息：有 max 时为范围校验，否则为下限校验 */
  minMessage?: string;
}

/**
 * 通用规则工厂：支持必填、格式、长度等，按需组合
 * @param message 必填项错误提示
 * @param triggerOrOptions 可选：trigger 字符串，或 { trigger, pattern, patternMessage, min, max, minMessage }
 */
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

/**
 * 仅格式校验规则（无必填）
 */
export function patternRule(
  pattern: RegExp,
  message: string,
  trigger: string | string[] = "blur"
): FormItemRule {
  return { pattern, message, trigger };
}

// ============ 预定义规则集（按需导入，支持 tree-shaking） ============

/** 用户名必填 */
export const userNameRules = asRuleArray(requiredRule(MSG.userNameRequired));
/** 用户名（必填 + 格式：中文/字母/数字/下划线） */
export const userNameWithFormatRules = [
  ...userNameRules,
  patternRule(TENANT_NAME_PATTERN, MSG.userNameFormat, ["blur", "change"]),
];
/** 角色必选 */
export const roleIdsRules = asRuleArray(requiredRule(MSG.roleRequired));
/** 角色必选（单选，如 roleId） */
export const roleIdRules = asRuleArray(requiredRule(MSG.roleIdRequired));
/** 租户必选 */
export const tenantIdRules = asRuleArray(requiredRule(MSG.tenantIdRequired));
/** 认证方式必选 */
export const authMethodRules = asRuleArray(requiredRule(MSG.authMethodRequired));
/** 密码必填（无复杂度） */
export const passwordRules = asRuleArray(requiredRule(MSG.passwordRequired));
/** 密码（必填 + 最少 6 位）用于用户管理等 */
export const passwordWithMin6Rules = [
  ...passwordRules,
  {
    min: 6,
    message: MSG.passwordMin6,
    trigger: ["blur", "change"],
  } as FormItemRule,
];
/** 邮箱格式（无必填） */
export const emailRules = [patternRule(EMAIL_PATTERN, MSG.emailFormat)];
/** 邮箱（格式 + 必填） */
export const emailRequiredRules = [...emailRules, ...asRuleArray(requiredRule(MSG.emailRequired))];
/** 手机号格式（无必填） */
export const phoneRules = [patternRule(PHONE_PATTERN, MSG.phoneFormat)];
/** 手机号（格式 + 必填） */
export const phoneRequiredRules = [...phoneRules, ...asRuleArray(requiredRule(MSG.phoneRequired))];
/** 状态必选 */
export const enableRules = asRuleArray(requiredRule(MSG.enableRequired));
/** 验证码（必填 + 4-6 位数字） */
export const captchaRules = asRuleArray(
  requiredRule(MSG.captchaRequired, {
    pattern: CAPTCHA_PATTERN,
    patternMessage: MSG.captchaFormat,
    trigger: ["blur", "change"],
  })
);
/** 租户名（必填 + 格式） */
export const tenantNameRules = asRuleArray(
  requiredRule(MSG.tenantNameRequired, {
    pattern: TENANT_NAME_PATTERN,
    patternMessage: MSG.tenantNameFormat,
    trigger: ["blur", "change"],
  })
);

// ============ 工具函数 ============

/** 将 requiredRule 返回值规范为数组，便于展开 */
export function asRuleArray(rule: FormItemRule | FormItemRule[]): FormItemRule[] {
  return Array.isArray(rule) ? rule : [rule];
}

/**
 * 收集 Element Plus 表单校验错误（已去重）
 */
export function collectFormValidationErrors(fields: Record<string, unknown> | undefined): string[] {
  const errorSet = new Set<string>();
  if (!fields || typeof fields !== "object") return [];
  Object.values(fields).forEach((items) => {
    const arr = Array.isArray(items) ? items : items != null ? [items] : [];
    arr.forEach((item) => {
      const msg = typeof item === "string" ? item : (item as { message?: string })?.message;
      if (msg) errorSet.add(msg);
    });
  });
  return [...errorSet];
}

/**
 * 将校验错误和警告拼成一句展示文案（已去重）
 */
export function formatValidationMessages(
  errors: string[],
  warnings: string[] = [],
  separator = "；"
): string {
  return [...new Set([...errors, ...warnings].filter(Boolean))].join(separator);
}

/**
 * 创建「确认密码」校验规则（必填 + 一致性）
 */
export function createConfirmPasswordRules(getPassword: () => string) {
  return [
    requiredRule(MSG.confirmPasswordRequired),
    {
      validator: (_: unknown, value: string, callback: (error?: Error) => void) => {
        if (!value) {
          callback(new Error(MSG.confirmPasswordRequired));
        } else if (value !== getPassword()) {
          callback(new Error(MSG.confirmPasswordMismatch));
        } else {
          callback();
        }
      },
      trigger: "blur",
    },
  ];
}

/**
 * 创建「确认密码」校验规则（用户管理：最少 6 位 + 一致性）
 */
export function createConfirmPasswordRulesWithMin(
  getPassword: () => string,
  minLen: number = 6
): FormItemRule[] {
  return [
    { required: true, message: MSG.confirmPasswordRequired, trigger: "blur" },
    { min: minLen, message: MSG.passwordMin6, trigger: ["blur", "change"] },
    {
      validator: (_: unknown, value: string, callback: (error?: Error) => void) => {
        if (value !== getPassword()) {
          callback(new Error(MSG.confirmPasswordMismatch));
        } else {
          callback();
        }
      },
      trigger: ["blur", "change"],
    },
  ];
}

/** 手机号码和邮箱的上下文 */
export interface PhoneEmailFormContext {
  phone: string;
  email: string;
  authMethod?: number;
}

/**
 * 创建「手机号码和邮箱至少填写一个」的校验器
 */
export function createPhoneOrEmailValidator(
  getForm: () => PhoneEmailFormContext
): (rule: unknown, value: unknown, callback: (error?: Error) => void) => void {
  return (_, __, callback) => {
    const form = getForm();
    const hasPhone = !!(form.phone ?? "").toString().trim();
    const hasEmail = !!(form.email ?? "").toString().trim();
    const method = form.authMethod ?? 0;

    if (!hasPhone && !hasEmail) {
      callback(new Error(MSG.phoneOrEmailAtLeastOne));
      return;
    }
    if (method === 4 && !hasPhone) {
      callback(new Error(MSG.phoneRequiredForSms));
      return;
    }
    if (method === 3 && !hasEmail) {
      callback(new Error(MSG.emailRequiredForEmail));
      return;
    }
    callback();
  };
}
