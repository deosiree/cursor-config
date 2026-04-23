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
 * 规范化 MFA 文案。
 *
 * @param value MFA 方法值（支持原始值与规范化方法码）。
 * @returns 面向用户展示的 MFA 方式文本。
 */
export function normalizeMfaText(value: unknown): string {
  const code = normalizeMfaMethod(value);
  if (code === "MFA_METHOD_NONE") return "关闭（无需验证码）";
  if (code === "MFA_METHOD_SMS") return "短信验证码";
  if (code === "MFA_METHOD_EMAIL") return "邮箱验证码";
  if (code === "MFA_METHOD_BOTH") return "短信/邮箱验证码（二选一）";
  return "未配置";
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
 * 获取渠道简短标签。
 *
 * @param channel MFA 渠道。
 * @returns 渠道标签（短信/邮箱）。
 */
export function getMfaChannelLabel(channel: MfaChannel): string {
  return channel === mfaChannel.sms ? "短信" : "邮箱";
}

/**
 * 获取验证码输入框占位文案。
 *
 * @param channel MFA 渠道。
 * @returns 验证码输入提示。
 */
export function normalizeMfaPlaceholder(channel: MfaChannel): string {
  return channel === mfaChannel.sms ? "请输入短信验证码" : "请输入邮箱验证码";
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

/**
 * 生成 MFA 发送成功提示文案。
 *
 * @param channel MFA 渠道。
 * @returns 成功消息文本。
 */
export function resolveMfaSendSuccessText(channel: MfaChannel): string {
  return channel === mfaChannel.sms ? "短信验证码已发送" : "邮箱验证码已发送";
}

/**
 * 生成 MFA 面板提示文案。
 *
 * @param params MFA 提示所需上下文。
 * @returns 提示文本。
 */
export function resolveMfaHintText(params: {
  t: (message: string) => string;
  requiresMfa: boolean;
  isMfaChallengeActive: boolean;
  channel: MfaChannel;
  maskedPhone?: string;
  maskedEmail?: string;
}): string {
  const {
    t,
    requiresMfa,
    isMfaChallengeActive,
    channel,
    maskedPhone = "",
    maskedEmail = "",
  } = params;
  if (!requiresMfa) return t("当前登录配置无需 MFA。");
  if (!isMfaChallengeActive) return t("请先点击“登录”完成账号密码校验，再发送 MFA 验证码。");

  const channelText = getMfaChannelLabel(channel);
  const masked = channel === mfaChannel.sms ? maskedPhone : maskedEmail;
  const prefix = t("验证码将发送到");
  return masked ? prefix + t(channelText) + t("：") + masked : prefix + t(channelText) + t("。");
}

/**
 * @deprecated 与 `normalizeMfaPlaceholder` 语义重复，保留兼容旧调用。
 */
export function normalizeMfaChannel(channel: MfaChannel): string {
  return normalizeMfaPlaceholder(channel);
}
