import type { FormItemRule } from "element-plus";

import { MSG } from "@/constants/form-validation";
import { resolveAccountType } from "@/utils/account";

export { MSG } from "@/constants/form-validation";

export const formRules = {
  userName: [{ required: true, message: MSG.userNameRequired, trigger: "blur" }],
  roleIds: [{ required: true, message: MSG.roleRequired, trigger: "blur" }],
  password: [{ required: true, message: MSG.passwordRequired, trigger: "blur" }],
  email: [
    {
      pattern: /\w[-\w.+]*@([A-Za-z0-9][-A-Za-z0-9]+\.)+[A-Za-z]{2,14}/,
      message: MSG.emailFormat,
      trigger: "blur",
    },
  ],
  phone: [
    {
      pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/,
      message: MSG.phoneFormat,
      trigger: "blur",
    },
  ],
  account: [
    {
      validator: (_: unknown, value: string, callback: (error?: Error) => void) => {
        const normalizedValue = String(value ?? "").trim();
        if (!normalizedValue) {
          callback();
          return;
        }

        const accountType = resolveAccountType(normalizedValue);
        const isEmailCandidate = normalizedValue.includes("@");
        const isPhoneCandidate = /^\+?\d[\d\s]*$/.test(normalizedValue);

        if (accountType === "invalid" && !isEmailCandidate && !isPhoneCandidate) {
          callback(new Error(MSG.accountFormat));
          return;
        }

        const targetRule =
          accountType === "phone" || (accountType === "invalid" && isPhoneCandidate)
            ? formRules.phone[0]
            : formRules.email[0];
        const pattern = targetRule.pattern;
        if (pattern instanceof RegExp && !pattern.test(normalizedValue)) {
          callback(new Error(targetRule.message));
          return;
        }

        callback();
      },
      trigger: ["blur", "change"],
    },
  ],
  enable: [{ required: true, message: MSG.enableRequired, trigger: "blur" }],
};

/**
 * 创建必填字段验证规则
 * @param message
 * @param trigger
 * @returns
 */
export function requiredRule(message: string, trigger: string | string[] = "blur"): FormItemRule {
  return {
    required: true,
    message,
    trigger,
  };
}

/**
 * 创建手机号/邮箱账号规则
 * @param trigger
 * @returns
 */
export function createAccountRules(
  trigger: string | string[] = ["blur", "change"]
): FormItemRule[] {
  return [
    requiredRule(MSG.accountRequired, trigger),
    {
      ...formRules.account[0],
      trigger,
    },
  ];
}

/**
 * 将规则转换为数组
 * @param rule
 * @returns
 */
export function asRuleArray(rule: FormItemRule | FormItemRule[]): FormItemRule[] {
  return Array.isArray(rule) ? rule : [rule];
}

/**
 * 收集表单验证错误信息
 * @param fields
 * @returns
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
 * 格式化验证消息
 * @param errors 错误消息数组
 * @param warnings 警告消息数组
 * @param separator 分隔符
 * @returns 格式化后的消息字符串
 */
export function formatValidationMessages(
  errors: string[],
  warnings: string[] = [],
  separator = "；"
): string {
  return [...new Set([...errors, ...warnings].filter(Boolean))].join(separator);
}

/**
 * 创建确认密码验证规则
 * @param getPassword 获取密码的函数
 * @param minLen 最小长度
 * @returns 确认密码验证规则数组
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
        if (!value) {
          callback(new Error(MSG.confirmPasswordRequired));
          return;
        }
        if (value !== getPassword()) {
          callback(new Error(MSG.confirmPasswordMismatch));
          return;
        }
        callback();
      },
      trigger: ["blur", "change"],
    },
  ];
}
