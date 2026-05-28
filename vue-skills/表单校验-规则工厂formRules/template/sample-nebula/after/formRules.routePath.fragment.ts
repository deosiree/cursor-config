/**
 * AUTO-GENERATED from formRules.ts — do not edit.
 * Regenerate: node scripts/extract-fragments.js
 */
import type { FormInstance, FormItemRule } from "element-plus";
import i18n from "@/i18n";
const INVISIBLE_PATTERN = String.raw`[\p{Cc}\p{Cf}\u2028\u2029]`;

const INVISIBLE_REGEX = new RegExp(INVISIBLE_PATTERN, "u");

const PATH_SCHEME_RE = /^[a-zA-Z][a-zA-Z\d+\-.]*:/;

export type PathFieldKind = "routePath" | "apiPath";

export const PATH_MAX_LENGTH: Record<PathFieldKind, number> = {
  routePath: 64,
  apiPath: 512,
};

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
  const fail = createRuleFail({ label: "路由路径", maxLength: PATH_MAX_LENGTH.routePath });

  const trimmed = chkPathCore(raw, { maxLength: PATH_MAX_LENGTH.routePath }, fail); // trim 后检查非空、长度上限、禁协议头、必须以 / 开头、禁 //、禁空白与不可见字符
  chkPathFrag(trimmed, fail); // 检查 ?/# 连用、?/# 数量、?/# 位置

  if (trimmed === "/") {
    return;
  }

  const segments = trimmed.split("/").slice(1);
  for (let index = 0; index < segments.length; index++) {
    const segment = segments[index];
    // 黑名单拦截
    chkSegVoid(segment, index, segments, trimmed, fail); // 拒绝 // 连续空段；拒绝除根路径 / 外的尾部 /
    chkSegLead(segment, fail); // 拒绝段首为 ?/#&= 的字符
    chkSegIllegalChars(segment, ROUTE_PATH_SEGMENT_ILLEGAL_CHAR_RE, fail);
    chkSegLead(segment, fail, { onlyDigitUnderscoreLead: true });
    // 白名单放行
    if (chkSegRouteColon(segment, fail)) {
      continue;
    }
    if (ROUTE_PATH_STATIC_SEGMENT_REGEX.test(segment)) {
      continue;
    }
    if (chkSegFrag(segment, ROUTE_PATH_PARAM_SUFFIX_SEGMENT_REGEX, fail)) {
      continue;
    }
    // 报错兜底
    fail("路径段格式不对");
  }
}

function validateApiPathSyntax(raw: string): void {
  const fail = createRuleFail({ label: "API路径", maxLength: PATH_MAX_LENGTH.apiPath });

  const trimmed = chkPathCore(raw, { maxLength: PATH_MAX_LENGTH.apiPath }, fail); // trim 后检查非空、长度上限、禁协议头、必须以 / 开头、禁 //、禁空白与不可见字符
  chkPathFrag(trimmed, fail); // 检查 ?/# 连用、?/# 数量、?/# 位置

  if (trimmed === "/") {
    return;
  }

  const segments = trimmed.split("/").slice(1);
  for (let index = 0; index < segments.length; index++) {
    const segment = segments[index];
    // 黑名单拦截
    chkSegVoid(segment, index, segments, trimmed, fail); // 拒绝 // 连续空段；拒绝除根路径 / 外的尾部 /
    chkSegLead(segment, fail); // 拒绝段首为 ?/#&= 的字符
    chkSegApiColon(segment, fail);
    chkSegIllegalChars(segment, API_PATH_SEGMENT_ILLEGAL_CHAR_RE, fail);
    // 白名单放行
    if (API_PATH_STATIC_SEGMENT_REGEX.test(segment)) {
      continue;
    }
    if (chkSegFrag(segment, API_PATH_PARAM_SUFFIX_SEGMENT_REGEX, fail)) {
      continue;
    }
    // 报错兜底
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
      trigger: ["blur", "change"],
    },
  ];
}

export function createApiPathRules(): FormItemRule[] {
  return [
    {
      validator: createApiPathValidator(),
      trigger: ["blur", "change"],
    },
  ];
}

export function trimFieldOnBlur<T extends object>(
  model: T,
  field: keyof T & string,
  formRef?: FormInstance | null
): void {
  const raw = model[field];
  if (typeof raw !== "string") {
    return;
  }
  const next = raw.trim(); // 去除空格
  if (next !== raw) {
    // 如果去除空格后与原值不同
    (model as Record<string, unknown>)[field] = next;
    // validateField 失败时会 reject 携带 fields，需吞掉以免控制台未处理 Promise
    void formRef?.validateField(field).catch(() => undefined);
  }
}
