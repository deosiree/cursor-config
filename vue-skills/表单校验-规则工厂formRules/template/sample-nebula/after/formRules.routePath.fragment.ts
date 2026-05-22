/**
 * sample-nebula — pathLike 编排示意（非完整实现）
 * 真源：仓库 src/utils/formRules.ts — 见 formRules-module-map.md
 */
import type { FormItemRule } from "element-plus";
// import { trimFieldOnBlur, ROUTE_PATH_MAX_LENGTH, API_PATH_MAX_LENGTH } from "@/utils/formRules";

export { ROUTE_PATH_MAX_LENGTH, API_PATH_MAX_LENGTH } from "@/utils/formRules";

// --- 模块内私有（不 export）---
// chkPathCore → chkPathFrag
// validateRoutePathSyntax / validateApiPathSyntax：
//   for 段循环：chkSegVoid → chkSegLead → chkSegRouteColon|chkSegApiColon → static → chkSegFrag
//   → chkSegIllegalChars → (route) chkSegLead(onlyDigitUnderscoreLead) → fail("路径段格式不对")
// createRuleFail({ label: "路径", maxLength }) — 超长 fail("{label}超过{maxLength}字")

const RULE_TRIGGER: FormItemRule["trigger"] = ["blur", "change"];

// function createRoutePathValidator() { return wrapPathSyntaxValidator(validateRoutePathSyntax); }
// function createApiPathValidator() { return wrapPathSyntaxValidator(validateApiPathSyntax); }

export function createRoutePathRules(): FormItemRule[] {
  // return [{ validator: createRoutePathValidator(), trigger: RULE_TRIGGER }];
  return [];
}

export function createApiPathRules(): FormItemRule[] {
  // return [{ validator: createApiPathValidator(), trigger: RULE_TRIGGER }];
  return [];
}
