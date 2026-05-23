/**
 * sample-nebula — 通用规则工厂片段（email 等）
 * pathLike / nameIdentifier 可合并片段见 template/sample-nebula/after/
 */
export function requiredRule(message: string, triggerOrOptions?: string | object) {
  // required + 可选 pattern / min
}

export function patternRule(pattern: RegExp, message: string, trigger = "blur") {
  return { pattern, message, trigger };
}

export const EMAIL_PATTERN = /\w[-\w.+]*@([A-Za-z0-9][-A-Za-z0-9]+\.)+[A-Za-z]{2,14}/;

export function createEmailRules() {
  return [patternRule(EMAIL_PATTERN, "请输入正确的邮箱地址")];
}
