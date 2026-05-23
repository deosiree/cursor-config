/**
 * AUTO-GENERATED from formRules.ts — do not edit.
 * Regenerate: node scripts/extract-fragments.js
 */
import type { FormInstance, FormItemRule } from "element-plus";
import i18n from "@/i18n";
const INVISIBLE_PATTERN = String.raw`[\p{Cc}\p{Cf}\u2028\u2029]`;

const INVISIBLE_REGEX = new RegExp(INVISIBLE_PATTERN, "u");

const PATH_SCHEME_RE = /^[a-zA-Z][a-zA-Z\d+\-.]*:/;

const RULE_TRIGGER: FormItemRule["trigger"] = ["blur", "change"];

export const ROUTE_PATH_MAX_LENGTH = 64;

export const API_PATH_MAX_LENGTH = 512;

const ROUTE_PATH_STATIC_SEGMENT_REGEX = /^[a-zA-Z][a-zA-Z0-9_-]*$/;

const ROUTE_PATH_VUE_DYNAMIC_SEGMENT_REGEX = /^:[a-zA-Z_][a-zA-Z0-9_]*(\([^)]+\))?[*+]?\??$/;

const ROUTE_PATH_PARAM_SUFFIX_SEGMENT_REGEX =
  /^[a-zA-Z][a-zA-Z0-9_-]*[?#][a-zA-Z0-9\-._~/?#&=*+()]*$/;

const API_PATH_STATIC_SEGMENT_REGEX = /^[a-zA-Z0-9_-]+$/;

const API_PATH_PARAM_SUFFIX_SEGMENT_REGEX = /^[a-zA-Z0-9_-]+[?#][a-zA-Z0-9\-._~/?#&=*+()]*$/;

const ROUTE_PATH_SEGMENT_ILLEGAL_CHAR_RE = /[^a-zA-Z0-9\-._~:/?#&=*+()\\]/;

const API_PATH_SEGMENT_ILLEGAL_CHAR_RE = /[^a-zA-Z0-9\-._~/?#&=*+()\\]/;

type RuleFail = (messageKey: string, extra?: Record<string, unknown>) => never;

function createRuleFail(bind?: Record<string, unknown>): RuleFail {
  const { t } = i18n.global;
  return (messageKey, extra) => {
    const params = bind || extra ? { ...bind, ...extra } : undefined;
    throw new Error(String(params ? t(messageKey, params) : t(messageKey)));
  };
}

type ChkPathCoreOpts = {
  maxLength: number;

function chkPathCore(raw: string, opts: ChkPathCoreOpts, fail: RuleFail): string {
  const trimmed = String(raw ?? "").trim();
  if (trimmed.length < 1) {
    fail("路径不可为空");
  }
  if (trimmed.length > opts.maxLength) {
    fail("{label}超过{maxLength}字");
  }
  if (PATH_SCHEME_RE.test(trimmed)) {
    fail("不要使用协议头");
  }
  if (!trimmed.startsWith("/")) {
    fail("必须以/开头");
  }
  if (trimmed.startsWith("//")) {
    fail("不要以//开头");
  }
  if (/\s/.test(trimmed)) {
    fail("不要包含空格");
  }
  if (INVISIBLE_REGEX.test(trimmed)) {
    fail("包含非法字符");
  }
  return trimmed;
}

function chkPathFrag(path: string, fail: RuleFail): void {
  if (/\?{2,}|#{2,}|\?#|#\?/.test(path)) {
    fail("片段符不要连用");
  }
  const questionCount = (path.match(/\?/g) ?? []).length;
  const hashCount = (path.match(/#/g) ?? []).length;
  if (questionCount > 1) {
    fail("不要用多个?");
  }
  if (hashCount > 1) {
    fail("不要用多个#");
  }
  const questionIndex = path.indexOf("?");
  const hashIndex = path.indexOf("#");
  if (questionIndex >= 0 && hashIndex >= 0 && questionIndex > hashIndex) {
    fail("问号要在#前");
  }
}

function chkSegFrag(segment: string, paramSuffixRe: RegExp, fail: RuleFail): boolean {
  if (!/[?#]/.test(segment)) {
    return false;
  }
  if (!paramSuffixRe.test(segment)) {
    fail("拼参格式不对");
  }
  return true;
}

function chkSegVoid(
  segment: string,
  index: number,
  segments: string[],
  trimmed: string,
  fail: RuleFail
): void {
  if (!segment) {
    if (index === segments.length - 1 && trimmed.endsWith("/")) {
      fail("不要以/结尾");
    }
    fail("不要连续斜杠");
  }
}

type ChkSegLeadOpts = {
  onlyDigitUnderscoreLead?: boolean;

function chkSegLead(segment: string, fail: RuleFail, opts?: ChkSegLeadOpts): void {
  const segmentLead = [...segment][0] ?? "";
  if (!opts?.onlyDigitUnderscoreLead) {
    if (/[?#&=]/.test(segmentLead)) {
      fail("段首不要片段符");
    }
  }
  if (opts?.onlyDigitUnderscoreLead) {
    if (/[0-9]/.test(segmentLead)) {
      fail("段首不要为数字");
    }
    if (segmentLead === "_") {
      fail("段首不要下划线");
    }
  }
}

function chkSegIllegalChars(segment: string, illegalCharRe: RegExp, fail: RuleFail): void {
  if (illegalCharRe.test(segment)) {
    fail("包含非法字符");
  }
}

function chkSegRouteColon(segment: string, fail: RuleFail): boolean {
  if (!segment.includes(":")) {
    return false;
  }
  if (!ROUTE_PATH_VUE_DYNAMIC_SEGMENT_REGEX.test(segment)) {
    if (!segment.startsWith(":")) {
      fail("段中不要用冒号");
    }
    if (/[#?]/.test(segment.slice(1))) {
      fail("动态段不要接#?");
    }
    if (!/^:[a-zA-Z_][a-zA-Z0-9_]*/.test(segment)) {
      fail("动态参数名无效");
    }
    fail("动态段格式不对");
  }
  return true;
}

function chkSegApiColon(segment: string, fail: RuleFail): void {
  if (!segment.includes(":")) {
    return;
  }
  if (segment.startsWith(":")) {
    fail("不要用动态段");
  }
  fail("段中不要用冒号");
}

function validateRoutePathSyntax(raw: string): void {
  const fail = createRuleFail({ label: "路径", maxLength: ROUTE_PATH_MAX_LENGTH });

  const trimmed = chkPathCore(raw, { maxLength: ROUTE_PATH_MAX_LENGTH }, fail); // trim 后检查非空、长度上限、禁协议头、必须以 / 开头、禁 //、禁空白与不可见字符
  chkPathFrag(trimmed, fail); // 检查 ?/# 连用、?/# 数量、?/# 位置

  if (trimmed === "/") {
    return;
  }

  const segments = trimmed.split("/").slice(1);
  for (let index = 0; index < segments.length; index++) {
    const segment = segments[index];
    chkSegVoid(segment, index, segments, trimmed, fail); // 拒绝 // 连续空段；拒绝除根路径 / 外的尾部 /
    chkSegLead(segment, fail); // 拒绝段首为 ?/#&= 的字符
    if (chkSegRouteColon(segment, fail)) {
      continue;
    }
    if (ROUTE_PATH_STATIC_SEGMENT_REGEX.test(segment)) {
      continue;
    }
    if (chkSegFrag(segment, ROUTE_PATH_PARAM_SUFFIX_SEGMENT_REGEX, fail)) {
      continue;
    }
    chkSegIllegalChars(segment, ROUTE_PATH_SEGMENT_ILLEGAL_CHAR_RE, fail);
    chkSegLead(segment, fail, { onlyDigitUnderscoreLead: true });
    fail("路径段格式不对");
  }
}

function validateApiPathSyntax(raw: string): void {
  const fail = createRuleFail({ label: "路径", maxLength: API_PATH_MAX_LENGTH });

  const trimmed = chkPathCore(raw, { maxLength: API_PATH_MAX_LENGTH }, fail); // trim 后检查非空、长度上限、禁协议头、必须以 / 开头、禁 //、禁空白与不可见字符
  chkPathFrag(trimmed, fail); // 检查 ?/# 连用、?/# 数量、?/# 位置

  if (trimmed === "/") {
    return;
  }

  const segments = trimmed.split("/").slice(1);
  for (let index = 0; index < segments.length; index++) {
    const segment = segments[index];
    chkSegVoid(segment, index, segments, trimmed, fail); // 拒绝 // 连续空段；拒绝除根路径 / 外的尾部 /
    chkSegLead(segment, fail); // 拒绝段首为 ?/#&= 的字符
    chkSegApiColon(segment, fail);
    if (API_PATH_STATIC_SEGMENT_REGEX.test(segment)) {
      continue;
    }
    if (chkSegFrag(segment, API_PATH_PARAM_SUFFIX_SEGMENT_REGEX, fail)) {
      continue;
    }
    chkSegIllegalChars(segment, API_PATH_SEGMENT_ILLEGAL_CHAR_RE, fail);
    fail("路径段格式不对");
  }
}

function wrapPathSyntaxValidator(
  run: (raw: string) => void
): NonNullable<FormItemRule["validator"]> {
  return (_rule, value, callback) => {
    try {
      run(typeof value === "string" ? value : String(value ?? ""));
      callback();
    } catch (error) {
      callback(error as Error);
    }
  };
}

function createRoutePathValidator(): NonNullable<FormItemRule["validator"]> {
  return wrapPathSyntaxValidator(validateRoutePathSyntax);
}

function createApiPathValidator(): NonNullable<FormItemRule["validator"]> {
  return wrapPathSyntaxValidator(validateApiPathSyntax);
}

export function createRoutePathRules(): FormItemRule[] {
  return [
    {
      validator: createRoutePathValidator(),
      trigger: RULE_TRIGGER,
    },
  ];
}

export function createApiPathRules(): FormItemRule[] {
  return [
    {
      validator: createApiPathValidator(),
      trigger: RULE_TRIGGER,
    },
  ];
}

export function trimFieldOnBlur(
  model: Record<string, unknown>,
  field: string,
  formRef?: FormInstance | null
): void {
  const raw = model[field];
  if (typeof raw !== "string") {
    return;
  }
  const next = raw.trim(); // 去除空格
  if (next !== raw) {
    // 如果去除空格后与原值不同
    model[field] = next; // 更新模型值
    void formRef?.validateField(field); // 重新触发校验
  }
}
