import type { FormItemRule } from "element-plus";

// ============ 规则工厂 ============

export const EMAIL_PATTERN = /\w[-\w.+]*@([A-Za-z0-9][-A-Za-z0-9]+\.)+[A-Za-z]{2,14}/; //邮箱格式:符合邮箱格式
export const PHONE_PATTERN = /^1[3|4|5|6|7|8|9][0-9]\d{8}$/; //手机号码格式:11位数字，以1开头，第二位为3-9之间的数字
export const CAPTCHA_PATTERN = /^\d{4,6}$/; //验证码格式:4-6位数字
export const TENANT_NAME_PATTERN = /^[\u4e00-\u9fa5a-zA-Z0-9_]+$/; //租户名格式:只能包含中文、字母、数字和下划线
export const USER_NAME_PATTERN = /^[a-zA-Z][a-zA-Z0-9_]*$/; // 用户名必须字符起头，后续可包含字母、数字、下划线
type TranslateFn = (message: string) => string;

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
export function createUserNameRules(t: TranslateFn) {
  return asRuleArray(requiredRule(t("用户名不能为空")));
}

/** 用户名（必填 + 格式：中文/字母/数字/下划线） */
export function createUserNameWithFormatRules(t: TranslateFn) {
  return [
    ...createUserNameRules(t),
    patternRule(TENANT_NAME_PATTERN, t("用户名只能包含中文、字母、数字和下划线"), [
      "blur",
      "change",
    ]),
  ];
}

/** 角色必选 */
export function createRoleIdsRules(t: TranslateFn) {
  return asRuleArray(requiredRule(t("用户角色不能为空")));
}

/** 角色必选（单选，如 roleId） */
export function createRoleIdRules(t: TranslateFn) {
  return asRuleArray(requiredRule(t("角色必选")));
}

/** 租户必选 */
export function createTenantIdRules(t: TranslateFn) {
  return asRuleArray(requiredRule(t("租户必选")));
}

/** 认证方式必选 */
export function createAuthMethodRules(t: TranslateFn) {
  return asRuleArray(requiredRule(t("认证方式必选")));
}

/** 密码必填（无复杂度） */
export function createPasswordRules(t: TranslateFn) {
  return asRuleArray(requiredRule(t("密码不能为空")));
}

/** 密码（必填 + 最少 6 位）用于用户管理等 */
export function createPasswordWithMin6Rules(t: TranslateFn) {
  return [
    ...createPasswordRules(t),
    {
      min: 6,
      message: t("密码至少需要6位"),
      trigger: ["blur", "change"],
    } as FormItemRule,
  ];
}

/** 邮箱格式（无必填） */
export function createEmailRules(t: TranslateFn) {
  return [patternRule(EMAIL_PATTERN, t("请输入正确的邮箱地址"))];
}

/** 邮箱（格式 + 必填） */
export function createEmailRequiredRules(t: TranslateFn) {
  return [...createEmailRules(t), ...asRuleArray(requiredRule(t("邮箱不能为空")))];
}

/** 手机号格式（无必填） */
export function createPhoneRules(t: TranslateFn) {
  return [patternRule(PHONE_PATTERN, t("请输入正确的手机号码"))];
}

/** 手机号（格式 + 必填） */
export function createPhoneRequiredRules(t: TranslateFn) {
  return [...createPhoneRules(t), ...asRuleArray(requiredRule(t("手机号不能为空")))];
}

/** 状态必选 */
export function createEnableRules(t: TranslateFn) {
  return asRuleArray(requiredRule(t("请选择状态")));
}

/** 验证码（必填 + 4-6 位数字） */
export function createCaptchaRules(t: TranslateFn) {
  return asRuleArray(
    requiredRule(t("验证码不能为空"), {
      pattern: CAPTCHA_PATTERN,
      patternMessage: t("验证码格式不正确"),
      trigger: ["blur", "change"],
    })
  );
}

/** 租户名（必填 + 格式） */
export function createTenantNameRules(t: TranslateFn) {
  return asRuleArray(
    requiredRule(t("租户名不能为空"), {
      pattern: TENANT_NAME_PATTERN,
      patternMessage: t("租户名只能包含中文、字母、数字和下划线"),
      trigger: ["blur", "change"],
    })
  );
}

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
export function createConfirmPasswordRules(t: TranslateFn, getPassword: () => string) {
  return [
    requiredRule(t("请再次输入密码")),
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
      trigger: "blur",
    },
  ];
}

/**
 * 创建「确认密码」校验规则（用户管理：最少 6 位 + 一致性）
 */
export function createConfirmPasswordRulesWithMin(
  t: TranslateFn,
  getPassword: () => string,
  minLen: number = 6
): FormItemRule[] {
  return [
    { required: true, message: t("请再次输入密码"), trigger: "blur" },
    { min: minLen, message: t("密码至少需要6位"), trigger: ["blur", "change"] },
    {
      validator: (_: unknown, value: string, callback: (error?: Error) => void) => {
        if (value !== getPassword()) {
          callback(new Error(t("两次输入的密码不一致")));
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
  t: TranslateFn,
  getForm: () => PhoneEmailFormContext
): (rule: unknown, value: unknown, callback: (error?: Error) => void) => void {
  return (_, __, callback) => {
    const form = getForm();
    const hasPhone = !!(form.phone ?? "").toString().trim();
    const hasEmail = !!(form.email ?? "").toString().trim();
    const method = form.authMethod ?? 0;

    if (!hasPhone && !hasEmail) {
      callback(new Error(t("手机号码和邮箱需至少填写一个")));
      return;
    }
    if (method === 4 && !hasPhone) {
      callback(new Error(t("二次认证方式为短信验证时，手机号码为必填项")));
      return;
    }
    if (method === 3 && !hasEmail) {
      callback(new Error(t("二次认证方式为邮箱验证时，邮箱为必填项")));
      return;
    }
    callback();
  };
}
