import type { LoginV2Request, SendLoginCodeV2Request } from "@/api/gateway/auth.gateway";
import { trans } from "vue-i18n-kit-sy/runtime";

/**
 * 登录页 OTP 渠道类型。
 */
export type OtpChannel = "phone" | "email";

/**
 * OTP 登录类型。
 */
export type OtpLoginType = "LOGIN_TYPE_SMS" | "LOGIN_TYPE_EMAIL";

/**
 * OTP 渠道到登录类型映射。
 *
 * @param channel OTP 渠道。
 * @returns 后端登录类型。
 */
export function resolveOtpLoginType(channel: OtpChannel): OtpLoginType {
  return channel === "phone" ? "LOGIN_TYPE_SMS" : "LOGIN_TYPE_EMAIL";
}

/**
 * OTP 发送成功提示文案。
 *
 * @param channel OTP 渠道。
 * @returns 成功提示文案。
 */
export function resolveOtpSendSuccessText(channel: OtpChannel): string {
  return channel === "phone" ? trans("短信验证码已发送") : trans("邮箱验证码已发送");
}

/**
 * OTP 输入校验失败提示文案。
 *
 * @param channel OTP 渠道。
 * @param identifier 用户输入账号。
 * @param isPhoneValid 手机号格式是否有效。
 * @param isEmailValid 邮箱格式是否有效。
 * @returns 失败提示文案；通过时返回 `null`。
 */
export function resolveOtpInputError(params: {
  channel: OtpChannel;
  identifier: string;
  isPhoneValid: boolean;
  isEmailValid: boolean;
}): string | null {
  const { channel, identifier, isPhoneValid, isEmailValid } = params;
  const normalized = identifier.trim();

  if (!normalized) {
    return channel === "phone" ? trans("请输入手机号") : trans("请输入邮箱");
  }
  if (channel === "phone" && !isPhoneValid) {
    return trans("手机号格式不正确");
  }
  if (channel === "email" && !isEmailValid) {
    return trans("邮箱格式不正确");
  }
  return null;
}

/**
 * 构建“登录前 OTP 发送”请求体。
 *
 * @param channel OTP 渠道。
 * @param identifier 用户输入账号（手机号/邮箱）。
 * @param captchaKey 图形验证码 key。
 * @param captchaCode 图形验证码值。
 * @returns 发送 OTP 的请求参数。
 */
export function buildOtpSendPayload(params: {
  channel: OtpChannel;
  identifier: string;
  captchaKey: string;
  captchaCode: string;
}) {
  const { channel, identifier, captchaKey, captchaCode } = params;
  return {
    identifier: identifier.trim(),
    loginType: resolveOtpLoginType(channel),
    captchaKey: captchaKey.trim(),
    captchaCode: captchaCode.trim(),
  };
}

/**
 * 构建“发送登录验证码”请求体。
 *
 * 对应 Swagger v2SendLoginCodeRequest：仅包含 identifier 和 loginType，
 * 不携带图形验证码字段。
 *
 * @param channel OTP 渠道。
 * @param identifier 用户输入账号（手机号/邮箱）。
 * @returns 发送登录验证码的请求参数。
 */
export function buildLoginCodeSendPayload(params: {
  channel: OtpChannel;
  identifier: string;
}): SendLoginCodeV2Request {
  const { channel, identifier } = params;
  return {
    identifier: identifier.trim(),
    loginType: resolveOtpLoginType(channel),
  };
}

/**
 * 构建密码登录请求体。
 *
 * @param identifier 用户账号。
 * @param password 密码明文或密文。
 * @param captchaKey 图形验证码 key。
 * @param captchaCode 图形验证码值。
 * @returns 登录请求。
 */
export function buildPasswordLoginPayload(params: {
  identifier: string;
  password: string;
  captchaKey: string;
  captchaCode: string;
}): LoginV2Request {
  const { identifier, password, captchaKey, captchaCode } = params;
  return {
    identifier: identifier.trim(),
    password,
    loginType: "LOGIN_TYPE_PASSWORD",
    captchaKey: captchaKey.trim(),
    captchaCode: captchaCode.trim(),
  };
}

/**
 * 构建短信/邮箱验证码登录请求体。
 *
 * @param channel OTP 渠道。
 * @param identifier 用户账号。
 * @param authCode OTP 验证码。
 * @param captchaKey 图形验证码 key。
 * @param captchaCode 图形验证码值。
 * @returns 登录请求。
 */
export function buildOtpLoginPayload(params: {
  channel: OtpChannel;
  identifier: string;
  authCode: string;
  captchaKey: string;
  captchaCode: string;
}): LoginV2Request {
  const { channel, identifier, authCode, captchaKey, captchaCode } = params;
  return {
    identifier: identifier.trim(),
    loginType: resolveOtpLoginType(channel),
    authCode: authCode.trim(),
    captchaKey: captchaKey.trim(),
    captchaCode: captchaCode.trim(),
  };
}
