/**
 * 校验用正则表达式（技术常量）
 * 与语言无关，做国际化时不需要翻译，与可翻译的校验文案分开存放
 */
export const EMAIL_PATTERN = /\w[-\w.+]*@([A-Za-z0-9][-A-Za-z0-9]+\.)+[A-Za-z]{2,14}/; //邮箱格式:符合邮箱格式
export const PHONE_PATTERN = /^1[3|4|5|6|7|8|9][0-9]\d{8}$/; //手机号码格式:11位数字，以1开头，第二位为3-9之间的数字
export const CAPTCHA_PATTERN = /^\d{4,6}$/; //验证码格式:4-6位数字
export const TENANT_NAME_PATTERN = /^[\u4e00-\u9fa5a-zA-Z0-9_]+$/; //租户名格式:只能包含中文、字母、数字和下划线
export const USER_NAME_PATTERN = /^[a-zA-Z][a-zA-Z0-9_]*$/; // 用户名必须字符起头，后续可包含字母、数字、下划线
