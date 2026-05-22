/**
 * sample-nebula — pathLike 风格完整参考（合并到项目 formRules.ts）
 * 依赖：同文件顶部已有 INVISIBLE_REGEX；i18n 按 project-discovery 探测结果接入
 */
import type { FormInstance, FormItemRule } from "element-plus";
import i18n from "@/i18n";

const INVISIBLE_PATTERN = String.raw`[\p{Cc}\p{Cf}\u2028\u2029]`;
const INVISIBLE_REGEX = new RegExp(INVISIBLE_PATTERN, "u");

export const ROUTE_PATH_MAX_LENGTH = 64;

const ROUTE_PATH_SCHEME_REGEX = /^[a-zA-Z][a-zA-Z\d+\-.]*:/;
const ROUTE_PATH_STATIC_SEGMENT_REGEX = /^[a-zA-Z][a-zA-Z0-9_-]*$/;
const ROUTE_PATH_VUE_DYNAMIC_SEGMENT_REGEX =
  /^:[a-zA-Z_][a-zA-Z0-9_]*(\([^)]+\))?[*+]?\??$/;
const ROUTE_PATH_PARAM_SUFFIX_SEGMENT_REGEX =
  /^[a-zA-Z][a-zA-Z0-9_-]*[?#][a-zA-Z0-9\-._~/?#&=*+()]*$/;

const ROUTE_PATH_RULE_TRIGGER: FormItemRule["trigger"] = ["blur", "change"];

export function validateRoutePathSyntax(raw: string): void {
  const { t } = i18n.global;
  const fail = (messageKey: string): never => {
    throw new Error(String(t(messageKey)));
  };

  const trimmed = String(raw ?? "").trim();
  if (trimmed.length < 1) fail("路径不可为空");
  if (trimmed.length > ROUTE_PATH_MAX_LENGTH) fail("路径超过64字");
  if (ROUTE_PATH_SCHEME_REGEX.test(trimmed)) fail("不要使用协议头");
  if (!trimmed.startsWith("/")) fail("必须以/开头");
  if (trimmed.startsWith("//")) fail("不要以//开头");
  if (/\s/.test(trimmed)) fail("不要包含空格");
  if (INVISIBLE_REGEX.test(trimmed)) fail("包含非法字符");
  if (trimmed === "/") return;

  const segments = trimmed.split("/").slice(1);
  for (let index = 0; index < segments.length; index++) {
    const segment = segments[index];
    if (!segment) {
      if (index === segments.length - 1 && trimmed.endsWith("/")) fail("不要以/结尾");
      fail("不要连续斜杠");
    }
    const segmentLead = [...segment][0] ?? "";
    if (/[?#&=]/.test(segmentLead)) fail("段首不要片段符");

    if (segment.includes(":")) {
      if (!ROUTE_PATH_VUE_DYNAMIC_SEGMENT_REGEX.test(segment)) {
        if (!segment.startsWith(":")) fail("段中不要用冒号");
        if (/[#?]/.test(segment.slice(1))) fail("动态段不要接#?");
        if (!/^:[a-zA-Z_][a-zA-Z0-9_]*/.test(segment)) fail("动态参数名无效");
        fail("动态段格式不对");
      }
      continue;
    }
    if (ROUTE_PATH_STATIC_SEGMENT_REGEX.test(segment)) continue;

    if (/[?#]/.test(segment)) {
      if (!ROUTE_PATH_PARAM_SUFFIX_SEGMENT_REGEX.test(segment)) fail("拼参格式不对");
      continue;
    }
    if (segment.match(/[^a-zA-Z0-9\-._~:/?#&=*+()\\]/)) fail("包含非法字符");
    const firstChar = [...segment][0] ?? "";
    if (/[0-9]/.test(firstChar)) fail("段首不要为数字");
    if (firstChar === "_") fail("段首不要下划线");
    fail("路径段格式不对");
  }
}

export function createRoutePathValidator(): NonNullable<FormItemRule["validator"]> {
  return (_rule, value, callback) => {
    try {
      validateRoutePathSyntax(typeof value === "string" ? value : String(value ?? ""));
      callback();
    } catch (error) {
      callback(error as Error);
    }
  };
}

export function createRoutePathRules(): FormItemRule[] {
  return [{ validator: createRoutePathValidator(), trigger: ROUTE_PATH_RULE_TRIGGER }];
}

export function trimRoutePathOnBlur(
  model: Record<string, unknown>,
  field: string,
  formRef?: FormInstance | null
): void {
  const raw = model[field];
  if (typeof raw !== "string") return;
  const next = raw.trim();
  if (next !== raw) {
    model[field] = next;
    void formRef?.validateField(field);
  }
}
