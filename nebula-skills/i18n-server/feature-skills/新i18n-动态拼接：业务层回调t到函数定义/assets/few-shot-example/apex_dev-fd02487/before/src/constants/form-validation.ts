/**
 * 表单校验文案（可翻译）
 * 做国际化时迁移到 locale/zh-CN.json 等，用 t('validation.xxx') 替代
 */

export const MSG = {
  userNameRequired: "用户名不能为空",
  userNameFormat: "用户名只能包含中文、字母、数字和下划线",
  roleRequired: "用户角色不能为空",
  passwordRequired: "密码不能为空",
  passwordMin6: "密码至少需要6位",
  emailFormat: "请输入正确的邮箱地址",
  phoneFormat: "请输入正确的手机号码",
  enableRequired: "请选择状态",
  captchaRequired: "验证码不能为空",
  captchaFormat: "验证码格式不正确",
  confirmPasswordRequired: "请再次输入密码",
  confirmPasswordMismatch: "两次输入的密码不一致",
  tenantNameRequired: "租户名不能为空",
  tenantNameFormat: "租户名只能包含中文、字母、数字和下划线",
  phoneOrEmailAtLeastOne: "手机号码和邮箱需至少填写一个",
  phoneRequiredForSms: "二次认证方式为短信验证时，手机号码为必填项",
  emailRequiredForEmail: "二次认证方式为邮箱验证时，邮箱为必填项",
  emailRequired: "邮箱不能为空",
  phoneRequired: "手机号不能为空",
  roleIdRequired: "角色必选",
  tenantIdRequired: "租户必选",
  authMethodRequired: "认证方式必选",
} as const;
