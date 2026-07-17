/**
 * 轻量 routePath 语法探测（skill 自包含，不依赖 apex formRules）。
 * 覆盖扫描常用项：必以 / 开头、禁空段、dir/page 禁 *、function 任意段可 *。
 * 完整 Element 表单文案级校验仍以 apex `formRules` 为准。
 */

const MAX_LEN = 64;
const STATIC_SEG = /^[a-zA-Z][a-zA-Z0-9_-]*$/;
const DYNAMIC_SEG = /^:[a-zA-Z_][a-zA-Z0-9_]*(\([^)]+\))?[*+]?\??$/;
const ILLEGAL = /[^a-zA-Z0-9\-._~:/?#&=*+()\\]/;

function coreError(raw) {
  const s = String(raw ?? "").trim();
  if (!s) return undefined;
  if (s.length > MAX_LEN) return "路由路径长度超限";
  if (!s.startsWith("/")) return "路由路径必须以 / 开头";
  if (s.includes("//")) return "路由路径不能包含 //";
  if (/\s/.test(s)) return "路由路径不能包含空白";
  return undefined;
}

function segmentError(segment, { allowStar }) {
  if (segment === "") return "路径段为空";
  if (allowStar && segment === "*") return undefined;
  if (ILLEGAL.test(segment)) return "路径段含非法字符";
  if (DYNAMIC_SEG.test(segment)) return undefined;
  if (STATIC_SEG.test(segment)) return undefined;
  if (/^[a-zA-Z][a-zA-Z0-9_-]*[?#]/.test(segment)) return undefined;
  return "路径段格式不对";
}

function validate(raw, { allowStar }) {
  const core = coreError(raw);
  if (core) return core;
  const trimmed = String(raw).trim();
  if (trimmed === "/") return undefined;
  const segments = trimmed.split("/").slice(1);
  for (const seg of segments) {
    const err = segmentError(seg, { allowStar });
    if (err) return err;
  }
  return undefined;
}

/** directory/page 精确路径 */
export function getRoutePathError(raw) {
  return validate(raw, { allowStar: false });
}

/** function 模糊路径（任意段可 *） */
export function getFuzzyPathError(raw) {
  return validate(raw, { allowStar: true });
}
