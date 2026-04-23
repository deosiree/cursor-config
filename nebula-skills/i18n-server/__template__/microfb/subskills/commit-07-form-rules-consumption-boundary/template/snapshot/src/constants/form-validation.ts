/**
 * 表单校验消息定义
 *
 * 职责：
 * 只定义校验消息标识，不生成规则，不负责触发翻译。
 *
 * 规则生成流：
 * form-validation.ts -> formRules.ts -> 页面/组合式函数 -> ElForm
 *
 * i18n 流：
 * form-validation.ts 只提供消息标识；
 * 真正的翻译应在页面或规则工厂执行时触发，
 * 由运行时的 `t` / `$t` 处理，不应在本文件中提前固化。
 *
 * 约束：
 * - 这里只放消息 key / descriptor
 * - 不在这里创建 FormRule
 * - 不在这里直接产出最终翻译文案
 */

export const MSG = {
  userNameRequired: "用户名不能为空",
  roleRequired: "用户角色不能为空",
  passwordRequired: "密码不能为空",
  passwordMin6: "密码不能少于 6 位",
  emailFormat: "请输入正确的邮箱地址",
  phoneFormat: "请输入正确的手机号码",
  enableRequired: "请选择状态",
  captchaRequired: "验证码不能为空",
  confirmPasswordRequired: "请再次输入密码",
  confirmPasswordMismatch: "两次输入的密码不一致",
  accountRequired: "请输入手机号/邮箱",
  accountFormat: "请输入有效的手机号/邮箱",
  captchaAnswerRequired: "请输入图形验证码",
  verificationCodeRequired: "请输入验证码",
} as const;
