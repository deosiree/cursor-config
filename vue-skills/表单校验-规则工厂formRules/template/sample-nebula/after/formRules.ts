import type { FormInstance, FormItemRule } from "element-plus";
import i18n from "@/i18n";

/**
 * formRules.ts 分区目录
 * §1 常量与类型（规则常量 | 业务常量）
 * §2 工具函数（仅 export 非校验器纯函数）
 * §3 规则工厂（通用 | 名称 builder | 路径原子 | 路径聚合 | 路径 Element 校验器）
 * §4 预定义规则集（通用字段 | 名称字段 | 组合字段 | routePath | apiUrl）
 *
 * skill 样本（自包含成品）：人类通读 / 绿场复制用本文件；增量改 pathLike/name 见同目录 *.fragment.ts
 */

// ============ 常量与类型 ============

// --- 规则常量 ---

/** 不可见字符：Unicode 控制类 + 格式类 + 行/段分隔符（避免 no-control-regex / no-misleading-character-class） */
const INVISIBLE_PATTERN = String.raw`[\p{Cc}\p{Cf}\u2028\u2029]`; // 不可见字符模式
const INVISIBLE_REGEX = new RegExp(INVISIBLE_PATTERN, "u"); // 不可见字符正则表达式
const DANGEROUS_REGEX = /[<>&"'`/\\]/; // 危险字符
const PATH_TRAVERSAL_REGEX = /\.\.\/|\.\.\\/; // 路径遍历字符
const WHITELIST_CHAR_REGEX = /^[\p{sc=Han}\p{sc=Latin}0-9_]+$/u; // 白名单字符
const FIRST_CHAR_REGEX = /^[\p{sc=Han}\p{sc=Latin}]/u; // 首字符

/** 斜杠路径协议头检测（如 http:、https:） */
const PATH_SCHEME_RE = /^[a-zA-Z][a-zA-Z\d+\-.]*:/;

const EMAIL_PATTERN = /\w[-\w.+]*@([A-Za-z0-9][-A-Za-z0-9]+\.)+[A-Za-z]{2,14}/; //邮箱格式:符合邮箱格式
const PHONE_PATTERN = /^1[3|4|5|6|7|8|9][0-9]\d{8}$/; //手机号码格式:11位数字，以1开头，第二位为3-9之间的数字
const CAPTCHA_PATTERN = /^\d{4,6}$/; //验证码格式:4-6位数字

/**
 * 表单项校验规则统一触发时机：失焦（blur）与值变化（change）
 */
const RULE_TRIGGER: FormItemRule["trigger"] = ["blur", "change"];

const ROUTE_PATH_STATIC_SEGMENT_REGEX = /^[a-zA-Z][a-zA-Z0-9_-]*$/; // 静态段 如：user
const ROUTE_PATH_VUE_DYNAMIC_SEGMENT_REGEX = /^:[a-zA-Z_][a-zA-Z0-9_]*(\([^)]+\))?[*+]?\??$/; // 动态段 如：:id
/** 静态前缀 + ?/# 拼参后缀（无段内冒号），如 user?、list?from=menu */
const ROUTE_PATH_PARAM_SUFFIX_SEGMENT_REGEX =
  /^[a-zA-Z][a-zA-Z0-9_-]*[?#][a-zA-Z0-9\-._~/?#&=*+()]*$/;

const API_PATH_STATIC_SEGMENT_REGEX = /^[a-zA-Z0-9_-]+$/;
/** 静态前缀 + ?/# 后缀；前缀允许数字（如 v2?、1#） */
const API_PATH_PARAM_SUFFIX_SEGMENT_REGEX = /^[a-zA-Z0-9_-]+[?#][a-zA-Z0-9\-._~/?#&=*+()]*$/;

const ROUTE_PATH_SEGMENT_ILLEGAL_CHAR_RE = /[^a-zA-Z0-9\-._~:/?#&=*+()\\]/;
const API_PATH_SEGMENT_ILLEGAL_CHAR_RE = /[^a-zA-Z0-9\-._~/?#&=*+()\\]/;

// --- 业务常量 ---

export type NameFieldKind = "username" | "tenantName" | "roleName" | "menuName";

export const NAME_MAX_LENGTH: Record<NameFieldKind, number> = {
  username: 64,
  tenantName: 128,
  roleName: 128,
  menuName: 128,
}; // 名称最大长度

export const ROUTE_PATH_MAX_LENGTH = 64;
export const API_PATH_MAX_LENGTH = 512;

// ============ 工具函数 ============

/** 将 requiredRule 返回值规范为数组，便于展开 */
export function asRuleArray(rule: FormItemRule | FormItemRule[]): FormItemRule[] {
  return Array.isArray(rule) ? rule : [rule];
}

/**
 * 收集 Element Plus 表单校验错误（已去重）
 */
export function collectFormValidationErrors(fields: Record<string, unknown> | undefined): string[] {
  const errorSet = new Set<string>();
  if (!fields || typeof fields !== "object") return [];
  Object.values(fields).forEach((items) => {
    const arr = Array.isArray(items) ? items : items != null ? [items] : [];
    arr.forEach((item) => {
      const msg = typeof item === "string" ? item : (item as { message?: string })?.message;
      if (msg) errorSet.add(msg);
    });
  });
  return [...errorSet];
}

/**
 * 将校验错误和警告拼成一句展示文案（已去重）
 */
export function formatValidationMessages(
  errors: string[],
  warnings: string[] = [],
  separator = "；"
): string {
  return [...new Set([...errors, ...warnings].filter(Boolean))].join(separator);
}

/**
 * 提交前名称规范化：trim → 去黑名单字符 → NFC → 按上限截断
 *
 * **示例**：`normName('  hello  ', 64)` → `'hello'`；`normName('user<bad>', 64)` → `'userbad'`
 */
export function normName(value: string | null | undefined, maxLength: number): string {
  if (value == null || value === "") {
    return "";
  }
  let cleaned = value.trim(); // 去除空格
  cleaned = cleaned.replace(new RegExp(INVISIBLE_PATTERN, "gu"), ""); // 去除不可见字符
  cleaned = cleaned.replace(new RegExp(DANGEROUS_REGEX.source, "g"), ""); // 去除危险字符
  return cleaned.normalize("NFC").slice(0, maxLength); // 返回规范化后的名称
}

/**
 * 失焦时 trim 表单字段并重新触发该字段校验（名称、路由路径、API 地址等通用）。
 *
 * **职责**：与具体 ruleStyle 无关的 UI 辅助；校验语义由对应 `createXxxRules` 承担。
 *
 * **示例**：`@blur="() => trimFieldOnBlur(formData, 'routePath', formRef)"`
 */
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

/** 校验失败回调：按需合并 bind/extra 后 t(key)，无插值则 t(key) */
type RuleFail = (messageKey: string, extra?: Record<string, unknown>) => never;

/**
 * 创建校验失败回调（名称、路径等规则工厂共用）。
 *
 * bind 仅用于含 `{label}`、`{maxLength}` 等占位符的 messageKey；无占位符的 key 可不传 bind。
 */
function createRuleFail(bind?: Record<string, unknown>): RuleFail {
  const { t } = i18n.global;
  return (messageKey, extra) => {
    const params = bind || extra ? { ...bind, ...extra } : undefined;
    throw new Error(String(params ? t(messageKey, params) : t(messageKey)));
  };
}

// ============ 规则工厂 ============

export interface RuleOptions {
  trigger?: string | string[];
  pattern?: RegExp;
  patternMessage?: string;
  min?: number;
  max?: number;
  /** 长度校验消息：有 max 时为范围校验，否则为下限校验 */
  minMessage?: string;
}

// --- 通用 ---

/**
 * 通用规则工厂：支持必填、格式、长度等，按需组合
 * @param message 必填项错误提示
 * @param triggerOrOptions 可选：trigger 字符串，或 { trigger, pattern, patternMessage, min, max, minMessage }
 */
export function requiredRule(
  message: string,
  triggerOrOptions?: string | RuleOptions
): FormItemRule | FormItemRule[] {
  const options: RuleOptions =
    typeof triggerOrOptions === "string" ? { trigger: triggerOrOptions } : (triggerOrOptions ?? {});
  const trigger = options.trigger ?? "blur";
  const rules: FormItemRule[] = [{ required: true, message, trigger }];

  if (options?.pattern != null && options?.patternMessage != null) {
    rules.push({
      pattern: options.pattern,
      message: options.patternMessage,
      trigger,
    });
  }
  if (options?.min != null && options?.minMessage != null) {
    const lenRule: FormItemRule = {
      min: options.min,
      message: options.minMessage,
      trigger,
    };
    if (options?.max != null) {
      lenRule.max = options.max;
    }
    rules.push(lenRule);
  }

  return rules.length === 1 ? rules[0] : rules;
}

/**
 * 仅格式校验规则（无必填）
 */
export function patternRule(
  pattern: RegExp,
  message: string,
  trigger: string | string[] = "blur"
): FormItemRule {
  return { pattern, message, trigger };
}

// --- 名称校验 builder ---

/**
 * 将单个字符转换为其对应的 Unicode 代码点表示形式。
 * 例如：
 * "中" -> "U+4E2D"
 * "a" -> "U+0061"
 * "1" -> "U+0031"
 * " " -> "U+0020"
 * "@" -> "U+0040"
 * "!" -> "U+0021"
 * "?" -> "U+003F"
 * " " -> "U+0020"
 * " " -> "U+0020"
 * @param char - 需要转换的单个字符字符串。
 * @returns 格式化后的 Unicode 代码点字符串，格式为 "U+XXXX"（十六进制大写，不足4位前补零）。
 */
function formatCodePoint(char: string): string {
  // 获取字符的 Unicode 代码点，若获取失败则默认为 0
  const cp = char.codePointAt(0) ?? 0;

  // 将代码点转换为十六进制大写字符串，并确保至少4位宽度（前导零填充）
  return `U+${cp.toString(16).toUpperCase().padStart(4, "0")}`;
}

/**
 * 创建名称字段 Element Plus 校验器（含必填、黑名单/白名单/首字符；校验时对值 trim，不写回 model）
 */
export function createNameValidator(options: {
  label: string;
  maxLength: number;
}): NonNullable<FormItemRule["validator"]> {
  const { label, maxLength } = options;
  const fail = createRuleFail({ label, maxLength });

  /** 多语言标识符校验：黑名单 → 白名单 → 首字符（trim 后长度仅校验上限） */
  function validateNameValue(raw: string): void {
    const trimmed = raw.trim();
    if (trimmed.length === 0) {
      fail("{label}不能为空");
    }
    if (trimmed.length > maxLength) {
      fail("{label}超过{maxLength}字");
    }

    const invisible = trimmed.match(INVISIBLE_REGEX);
    if (invisible) {
      fail("{label}包含不可见控制字符 ({detail})", {
        detail: formatCodePoint(invisible[0]), // 格式化不可见字符
      });
    }

    const dangerous = trimmed.match(DANGEROUS_REGEX);
    if (dangerous) {
      fail("{label}不能包含字符: {detail}", {
        detail: dangerous[0], // 格式化危险字符
      });
    }

    if (PATH_TRAVERSAL_REGEX.test(trimmed)) {
      fail("{label}不能包含目录遍历字符");
    }

    if (!WHITELIST_CHAR_REGEX.test(trimmed)) {
      fail("仅允许中文、西文、数字、下划线");
    }

    const firstChar = [...trimmed][0] ?? "";
    if (!FIRST_CHAR_REGEX.test(firstChar)) {
      fail("{label}首字符不能为数字或下划线");
    }
  }

  return (_rule, value, callback) => {
    try {
      // 多语言标识符校验：黑名单 → 白名单 → 首字符（trim 后长度仅校验上限）
      validateNameValue(typeof value === "string" ? value : String(value ?? ""));
      callback();
    } catch (error) {
      callback(error as Error); // 抛出错误
    }
  };
}

// --- 路径校验原子 ---

type ChkPathCoreOpts = {
  maxLength: number;
};

/**
 * 斜杠路径整段通用前置校验（菜单 routePath、API apiUrl 共用）。
 *
 * **职责**：trim 后检查非空、长度上限、禁协议头、必须以 `/` 开头、禁 `//`、禁空白与不可见字符。
 *
 * **示例**
 * - 通过：`chkPathCore('/system/menu', { maxLength: 64 }, fail)` → `'/system/menu'`
 * - 失败：`chkPathCore('http://x/menu', …, fail)` → `不要使用协议头`
 *
 * @param raw 原始输入
 * @param opts 长度上限（超长文案由 fail 的 bind 与 `"{label}超过{maxLength}字"` 生成）
 * @param fail 失败时抛出 Error
 * @returns trim 后的路径，供后续分段校验使用
 */
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

/**
 * 整路径上 `?` / `#` 的 URI 约束（routePath、apiUrl 共用）。
 *
 * **职责**：禁止 `??`、`##`、`?#`、`#?`；整条路径至多一个 `?`、一个 `#`；若同时存在则 `?` 须在 `#` 前。
 *
 * **示例**
 * - 通过：`chkPathFrag('/list?from=menu', fail)`、`chkPathFrag('/user#', fail)`
 * - 失败：`chkPathFrag('/a1_####????', fail)` → `片段符不要连用`
 * - 失败：`chkPathFrag('/user?#', fail)` → `片段符不要连用`
 * - 失败：`chkPathFrag('/user#?x', fail)` → `片段符不要连用` 或 `问号要在#前`
 *
 * @param path 已通过 chkPathCore 的 trim 路径
 * @param fail 失败回调
 */
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

// 整路径片段符 ↑  段内拼参后缀 ↓

/**
 * 单段内 ?/# 拼参后缀（须在 chkPathFrag 整路径约束之后调用）。
 *
 * @returns true 表示本段含 ?/# 且格式合法，调用方 continue
 */
function chkSegFrag(segment: string, paramSuffixRe: RegExp, fail: RuleFail): boolean {
  if (!/[?#]/.test(segment)) {
    return false;
  }
  if (!paramSuffixRe.test(segment)) {
    fail("拼参格式不对");
  }
  return true;
}

/**
 * 斜杠分段中的空段与尾斜杠（routePath、apiUrl 共用）。
 *
 * **职责**：拒绝 `//` 连续空段；拒绝除根路径 `/` 外的尾部 `/`。
 *
 * **示例**
 * - 失败：`chkSegVoid('', lastIdx, segs, '/system/', fail)` → `不要以/结尾`
 * - 失败：`chkSegVoid('', midIdx, segs, '/a//b', fail)` → `不要连续斜杠`
 *
 * @param segment 当前分段（可能为空串）
 * @param index 分段下标
 * @param segments split('/') 去掉首段后的数组
 * @param trimmed 整路径 trim 结果
 * @param fail 失败回调
 */
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
};

/**
 * 分段首字符不得为 URI 片段/查询起始符（routePath、apiUrl 共用）。
 *
 * **职责**：段首不能是 `?` `#` `&` `=`，避免 `/?xxx`、`/#anchor` 误入分段。
 *
 * **示例**
 * - 失败：`chkSegLead('?page=1', fail)` → `段首不要片段符`
 *
 * @param segment 非空分段
 * @param fail 失败回调
 * @param opts onlyDigitUnderscoreLead：仅检 route 静态段段首数字/下划线（尾链）
 */
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

/** 段内字符白名单外（与 chkPathCore 不可见字符同属「包含非法字符」文案，职责不同） */
function chkSegIllegalChars(segment: string, illegalCharRe: RegExp, fail: RuleFail): void {
  if (illegalCharRe.test(segment)) {
    fail("包含非法字符");
  }
}

/** routePath：含 `:` 时校验 Vue 动态段；已处理则 true */
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

/** apiUrl：禁止 Vue 动态段与段中冒号 */
function chkSegApiColon(segment: string, fail: RuleFail): void {
  if (!segment.includes(":")) {
    return;
  }
  if (segment.startsWith(":")) {
    fail("不要用动态段");
  }
  fail("段中不要用冒号");
}

// --- 路径校验聚合 ---

/**
 * 路由路径语法校验（1–64；禁止空白；允许 #、? 拼接参数；支持 Vue 动态段）。
 *
 * **职责**：组合路径原子 + 菜单 routePath 分段规则（含 `:id` 动态段）。
 */
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

/**
 * API 路径语法校验（1–512；允许 ?/# 拼参；禁止 Vue 动态段 :id）。
 *
 * **职责**：组合路径原子 + API apiUrl 分段规则（禁止 `:` 动态段）。
 */
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

// --- 路径 Element 校验器 ---

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

// ============ 预定义规则集（按需导入，支持 tree-shaking） ============

// --- 通用字段 ---

/** 角色必选 */
export function createRoleIdsRules() {
  const { t } = i18n.global;
  return asRuleArray(requiredRule(t("用户角色不能为空")));
}

/** 角色必选（单选，如 roleId） */
export function createRoleIdRules() {
  const { t } = i18n.global;
  return asRuleArray(requiredRule(t("角色必选")));
}

/** 租户必选 */
export function createTenantIdRules() {
  const { t } = i18n.global;
  return asRuleArray(requiredRule(t("租户必选")));
}

/** 认证方式必选 */
export function createAuthMethodRules() {
  const { t } = i18n.global;
  return asRuleArray(requiredRule(t("认证方式必选")));
}

/** 密码必填（无复杂度） */
export function createPasswordRules() {
  const { t } = i18n.global;
  return asRuleArray(requiredRule(t("密码不能为空")));
}

/** 密码（必填 + 最少 6 位）用于用户管理等 */
export function createPasswordWithMin6Rules() {
  const { t } = i18n.global;
  return [
    ...createPasswordRules(),
    {
      min: 6,
      message: t("密码至少需要6位"),
      trigger: RULE_TRIGGER,
    } as FormItemRule,
  ];
}

/** 邮箱格式（无必填） */
export function createEmailRules() {
  const { t } = i18n.global;
  return [patternRule(EMAIL_PATTERN, t("请输入正确的邮箱地址"))];
}

/** 邮箱（格式 + 必填） */
export function createEmailRequiredRules() {
  const { t } = i18n.global;
  return [...createEmailRules(), ...asRuleArray(requiredRule(t("邮箱不能为空")))];
}

/** 手机号格式（无必填） */
export function createPhoneRules() {
  const { t } = i18n.global;
  return [patternRule(PHONE_PATTERN, t("请输入正确的手机号码"))];
}

/** 手机号（格式 + 必填） */
export function createPhoneRequiredRules() {
  const { t } = i18n.global;
  return [...createPhoneRules(), ...asRuleArray(requiredRule(t("手机号不能为空")))];
}

/** 状态必选 */
export function createEnableRules() {
  const { t } = i18n.global;
  return asRuleArray(requiredRule(t("请选择状态")));
}

/** 验证码（必填 + 4-6 位数字） */
export function createCaptchaRules() {
  const { t } = i18n.global;
  return asRuleArray(
    requiredRule(t("验证码不能为空"), {
      pattern: CAPTCHA_PATTERN,
      patternMessage: t("验证码格式不正确"),
      trigger: RULE_TRIGGER,
    })
  );
}

// --- 名称字段 ---

/** 用户名（必填 + 多语言标识符格式，最长 64） */
export function createUserNameRules(): FormItemRule[] {
  const { t } = i18n.global;
  return [
    {
      validator: createNameValidator({
        label: t("用户名"),
        maxLength: NAME_MAX_LENGTH.username,
      }),
      trigger: RULE_TRIGGER,
    },
  ];
}

/** 租户名（必填 + 多语言标识符格式，最长 128） */
export function createTenantNameRules(): FormItemRule[] {
  const { t } = i18n.global;
  return [
    {
      validator: createNameValidator({
        label: t("租户名"),
        maxLength: NAME_MAX_LENGTH.tenantName,
      }),
      trigger: RULE_TRIGGER,
    },
  ];
}

/** 角色名（必填 + 多语言标识符格式，最长 128） */
export function createRoleNameRules(): FormItemRule[] {
  const { t } = i18n.global;
  return [
    {
      validator: createNameValidator({
        label: t("角色名称"),
        maxLength: NAME_MAX_LENGTH.roleName,
      }),
      trigger: RULE_TRIGGER,
    },
  ];
}

/** 菜单名（必填 + 多语言标识符格式，最长 128） */
export function createMenuNameRules(): FormItemRule[] {
  const { t } = i18n.global;
  return [
    {
      validator: createNameValidator({
        label: t("菜单名"),
        maxLength: NAME_MAX_LENGTH.menuName,
      }),
      trigger: RULE_TRIGGER,
    },
  ];
}

/** 权限名称（必填 + 多语言标识符格式，最长 128） */
export function createPermissionNameRules(): FormItemRule[] {
  const { t } = i18n.global;
  return [
    {
      validator: createNameValidator({
        label: t("权限名称"),
        maxLength: NAME_MAX_LENGTH.menuName,
      }),
      trigger: RULE_TRIGGER,
    },
  ];
}

// --- 组合字段 ---

/**
 * 创建「确认密码」校验规则（必填 + 一致性）
 */
export function createConfirmPasswordRules(getPassword: () => string) {
  const { t } = i18n.global;
  return [
    requiredRule(t("请再次输入密码")),
    {
      validator: (_: unknown, value: string, callback: (error?: Error) => void) => {
        if (!value) {
          callback(new Error(t("请再次输入密码")));
        } else if (value !== getPassword()) {
          callback(new Error(t("两次输入的密码不一致")));
        } else {
          callback();
        }
      },
      trigger: "blur",
    },
  ];
}

/**
 * 创建「确认密码」校验规则（用户管理：最少 6 位 + 一致性）
 */
export function createConfirmPasswordRulesWithMin(
  getPassword: () => string,
  minLen: number = 6
): FormItemRule[] {
  const { t } = i18n.global;
  return [
    { required: true, message: t("请再次输入密码"), trigger: "blur" },
    { min: minLen, message: t("密码至少需要6位"), trigger: RULE_TRIGGER },
    {
      validator: (_: unknown, value: string, callback: (error?: Error) => void) => {
        if (value !== getPassword()) {
          callback(new Error(t("两次输入的密码不一致")));
        } else {
          callback();
        }
      },
      trigger: RULE_TRIGGER,
    },
  ];
}

/** 手机号码和邮箱的上下文 */
export interface PhoneEmailFormContext {
  phone: string;
  email: string;
  authMethod?: number;
}

/**
 * 创建「手机号码和邮箱至少填写一个」的校验器
 */
export function createPhoneOrEmailValidator(
  getForm: () => PhoneEmailFormContext
): (rule: unknown, value: unknown, callback: (error?: Error) => void) => void {
  const { t } = i18n.global;
  return (_, __, callback) => {
    const form = getForm();
    const hasPhone = !!(form.phone ?? "").toString().trim();
    const hasEmail = !!(form.email ?? "").toString().trim();
    const method = form.authMethod ?? 0;

    if (!hasPhone && !hasEmail) {
      callback(new Error(t("手机号码和邮箱需至少填写一个")));
      return;
    }
    if (method === 4 && !hasPhone) {
      callback(new Error(t("二次认证方式为短信验证时，手机号码为必填项")));
      return;
    }
    if (method === 3 && !hasEmail) {
      callback(new Error(t("二次认证方式为邮箱验证时，邮箱为必填项")));
      return;
    }
    callback();
  };
}

// --- 路由路径（routePath） ---

/** 路由路径（语法 1–64） */
export function createRoutePathRules(): FormItemRule[] {
  return [
    {
      validator: createRoutePathValidator(),
      trigger: RULE_TRIGGER,
    },
  ];
}

// --- API路径（apiUrl） ---

/** API 路径（语法 1–512；?/# 规则同路由 pathLike，无 :动态段） */
export function createApiPathRules(): FormItemRule[] {
  return [
    {
      validator: createApiPathValidator(),
      trigger: RULE_TRIGGER,
    },
  ];
}
