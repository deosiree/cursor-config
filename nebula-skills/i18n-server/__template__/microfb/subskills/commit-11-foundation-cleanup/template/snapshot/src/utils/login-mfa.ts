import { mfaChannel, mfaMethod } from "@/enums/login/login.enum";

/**
 * MFA 方法码。
 */
export type MfaMethodCode =
  | "MFA_METHOD_UNSPECIFIED"
  | "MFA_METHOD_NONE"
  | "MFA_METHOD_SMS"
  | "MFA_METHOD_EMAIL"
  | "MFA_METHOD_BOTH";

/**
 * 前端可选的 MFA 渠道。
 */
export type MfaChannel = "sms" | "email";
export type MfaTargetType = "MFA_TARGET_SMS" | "MFA_TARGET_EMAIL";

/**
 * 将后端返回的 MFA 方法统一为前端可识别的方法码。
 *
 * 支持场景：
 * - 枚举字符串：`MFA_METHOD_SMS`
 * - 历史数字码字符串：`"1"`
 *
 * @param value 后端下发的 MFA 方法值。
 * @returns 规范化后的方法码；无法识别时返回 `null`。
 */
export function normalizeMfaMethod(value: unknown): MfaMethodCode | null {
  if (value === mfaMethod.unspecified || value === "0") return "MFA_METHOD_UNSPECIFIED";
  if (value === mfaMethod.none || value === "1") return "MFA_METHOD_NONE";
  if (value === mfaMethod.sms || value === "2") return "MFA_METHOD_SMS";
  if (value === mfaMethod.email || value === "3") return "MFA_METHOD_EMAIL";
  if (value === mfaMethod.both || value === "4") return "MFA_METHOD_BOTH";
  return null;
}

/**
 * 根据 MFA 方法返回默认渠道。
 *
 * 约定：`MFA_METHOD_BOTH` 默认走邮箱，便于短信通道作为兜底。
 *
 * @param methodCode 规范化后的 MFA 方法码。
 * @returns 默认渠道。
 */
export function resolveDefaultMfaChannel(methodCode: MfaMethodCode | null): MfaChannel {
  if (methodCode === "MFA_METHOD_SMS") return "sms";
  return "email";
}

/**
 * 计算实际生效的 MFA 渠道。
 *
 * 单渠道配置时忽略用户选择；双渠道配置时使用用户当前选择。
 *
 * @param methodCode 规范化后的 MFA 方法码。
 * @param selectedChannel 当前界面选择渠道。
 * @returns 实际用于发送/提示的渠道。
 */
export function resolveEffectiveMfaChannel(
  methodCode: MfaMethodCode | null,
  selectedChannel: MfaChannel
): MfaChannel {
  if (methodCode === "MFA_METHOD_SMS") return "sms";
  if (methodCode === "MFA_METHOD_EMAIL") return "email";
  return selectedChannel;
}

/**
 * 将前端渠道映射为后端发送目标类型。
 *
 * @param channel MFA 渠道。
 * @returns v2 接口要求的目标类型。
 */
export function resolveMfaTargetType(channel: MfaChannel): MfaTargetType {
  return channel === mfaChannel.sms ? "MFA_TARGET_SMS" : "MFA_TARGET_EMAIL";
}
