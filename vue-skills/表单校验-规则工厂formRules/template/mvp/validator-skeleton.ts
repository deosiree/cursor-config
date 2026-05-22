/**
 * 未知规则 MVP 骨架（复制到项目 rulesModule 后改名）
 * messageStrategy=plainText 示例；若项目有 i18n，改为 t(key)
 */
import type { FormItemRule } from "element-plus";

const TRIGGER: FormItemRule["trigger"] = ["blur", "change"];

export function validateExampleFieldSyntax(raw: string): void {
  const trimmed = String(raw ?? "").trim();
  if (!trimmed) {
    throw new Error("示例字段不可为空");
  }
  // TODO: 按 Plan 补充规则
}

export function createExampleFieldValidator(): NonNullable<FormItemRule["validator"]> {
  return (_rule, value, callback) => {
    try {
      validateExampleFieldSyntax(typeof value === "string" ? value : String(value ?? ""));
      callback();
    } catch (error) {
      callback(error as Error);
    }
  };
}

export function createExampleFieldRules(): FormItemRule[] {
  return [{ validator: createExampleFieldValidator(), trigger: TRIGGER }];
}
