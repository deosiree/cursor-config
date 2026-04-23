/**
 * 表单校验规则工厂
 *
 * 职责：
 * 负责组装规则结构、封装校验逻辑，供页面生成最终 rules。
 *
 * 规则生成流：
 * form-validation.ts 提供消息标识
 * -> formRules.ts 组装规则工厂
 * -> 页面/组合式函数生成 computed rules
 * -> ElForm 执行校验
 *
 * i18n 流：
 * 规则中的 message 不应在模块加载时确定；
 * 应在页面持有的语言上下文中，通过 `t` / `$t` 生成，
 * 保证切换语言后 rules 可重新计算。
 */

import type { FormItemRule } from "element-plus";

import { MSG } from "@/constants/form-validation";

export { MSG } from "@/constants/form-validation";

// --- 常量配置 ---
const PATTERNS = {
  EMAIL: /\w[-\w.+]*@([A-Za-z0-9][-A-Za-z0-9]+\.)+[A-Za-z]{2,14}/,
  PHONE: /^1[3-9]\d{9}$/,
  LIKELY_PHONE: /^\+?\d[\d\s]*$/, // 仅用于初步判断输入倾向，非严格校验
} as const;

// --- 原子规则 ---

/**
 * 创建必填字段验证规则
 * @param t 翻译函数
 * @param message 校验消息标识
 * @param trigger 触发时机
 * @returns 表单校验规则
 */
export function requiredRule(
  t: (message: string) => string,
  message: string,
  trigger: string | string[] = "blur"
): FormItemRule {
  return {
    required: true,
    message: t(message),
    trigger,
  };
}

// --- 校验结果工具 ---

/**
 * 收集表单验证错误信息
 * @param fields 表单错误字段
 * @returns 去重后的错误消息
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

// --- 业务规则工厂 ---

/**
 * 规则约定：
 * - 原子规则：     原子构造器返回单条规则，例如 `requiredRule`
 * - 业务规则工厂： 返回规则数组，例如 `createXxxRules`
 * - views:       调用层自行使用 `[requiredRule(...)]` 组装单字段规则
 *
 * 业务规则统一收敛在这里，目的是解耦页面并复用规则逻辑。
 *
 * 当规则依赖运行时参数时，使用工厂函数返回规则数组，例如：
 * - 依赖 i18n 的 `t`
 * - 依赖触发时机 `trigger`
 * - 依赖跨字段值，例如原密码
 */

/**
 * 创建密码验证规则
 * @param t 翻译函数
 * @param minLen 最小长度
 * @returns 密码校验规则
 */
export function createPasswordRules(t: (message: string) => string, minLen = 6): FormItemRule[] {
  return [
    requiredRule(t, MSG.passwordRequired, "blur"),
    {
      min: minLen,
      message: t(MSG.passwordMin6),
      trigger: ["blur", "change"],
    },
  ];
}

/**
 * 创建手机号/邮箱账号规则
 * @param t 翻译函数
 * @param trigger 触发时机
 * @returns 账号校验规则
 */
export function createAccountRules(
  t: (message: string) => string,
  trigger: string | string[] = ["blur", "change"]
): FormItemRule[] {
  return [
    requiredRule(t, MSG.accountRequired, trigger), // 账号必填
    {
      validator: (_: any, value: string, callback: any) => {
        const val = String(value ?? "").trim();
        // 为空，丢给 requiredRule
        if (!val) return callback();

        const isEmailLike = val.includes("@"); // 判断是否为邮箱格式
        const isPhoneLike = PATTERNS.LIKELY_PHONE.test(val); // 判断是否为手机号格式

        if (isPhoneLike) {
          if (!PATTERNS.PHONE.test(val)) {
            // 手机号格式不正确
            return callback(new Error(t(MSG.phoneFormat)));
          }
          return callback();
        }

        if (isEmailLike) {
          if (!PATTERNS.EMAIL.test(val)) {
            // 邮箱格式不正确
            return callback(new Error(t(MSG.emailFormat)));
          }
          return callback();
        }

        return callback(new Error(t(MSG.accountFormat))); // 账号格式不正确
      },
      trigger,
    },
  ];
}

/**
 * 创建确认密码验证规则
 * @param t 翻译函数
 * @param getPassword 获取密码的函数
 * @param options 可选配置
 * @returns 确认密码验证规则数组
 */
export function createConfirmPasswordRules(
  t: (message: string) => string,
  getOriginalPassword: () => string,
  minLen = 6,
  trigger: string | string[] = "blur"
): FormItemRule[] {
  return [
    requiredRule(t, MSG.confirmPasswordRequired, trigger),
    {
      validator: (_: any, value: string, callback: any) => {
        const val = String(value ?? ""); // 密码通常不建议 trim，保留空格字符

        // A. 为空：丢给上面的 requiredRule 处理，这里直接退出
        if (!val) return callback();

        // B. 长度检查：不满足最小长度
        if (val.length < minLen) {
          return callback(new Error(t(MSG.passwordMin6)));
        }

        // C. 一致性检查：与原密码不符
        if (val !== getOriginalPassword()) {
          return callback(new Error(t(MSG.confirmPasswordMismatch)));
        }

        // D. 校验通过
        callback();
      },
      trigger: ["blur", "change"],
    },
  ];
}
