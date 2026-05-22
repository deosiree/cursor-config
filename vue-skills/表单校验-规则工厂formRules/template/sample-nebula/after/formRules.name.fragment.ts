/**
 * sample-nebula — nameIdentifier 接入要点（非完整实现）
 * 真源：仓库 src/utils/formRules.ts
 */
import type { FormInstance, FormItemRule } from "element-plus";
// import { trimFieldOnBlur, normName, createMenuNameRules, NAME_MAX_LENGTH } from "@/utils/formRules";

// createNameValidator 内：
//   const fail = createRuleFail({ label, maxLength });
//   fail("{label}超过{maxLength}字");  // 展示如 字段超过64字 — 见 message-key-constraints.md

export function trimFieldOnBlur(
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

export function createMenuNameRules(): FormItemRule[] {
  // return [{ validator: createNameValidator({ label: "菜单名", maxLength }), trigger: RULE_TRIGGER }];
  return [];
}
