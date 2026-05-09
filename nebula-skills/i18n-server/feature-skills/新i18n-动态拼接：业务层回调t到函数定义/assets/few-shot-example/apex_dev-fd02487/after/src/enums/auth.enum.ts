import type { ActivationMethodStable } from "@/types/security-config";
import { trans } from "vue-i18n-kit-sy/runtime";

/**
 * 租户创建场景使用的激活方式下拉选项。
 */
export const ACTIVATION_METHOD_OPTIONS: Array<{
  label: string;
  value: ActivationMethodStable;
}> = [
  { label: trans("密码直设"), value: "password" },
  { label: trans("邮箱激活"), value: "email" },
  { label: trans("链接激活"), value: "link" },
];

/**
 * 租户激活方式：原始模型 -> 稳定模型。
 *
 * @param method 后端激活方式码值（0/1/2/3）
 * @returns 前端稳定激活方式
 */
export function mapWire2StableActivationMethod(method?: number | null): ActivationMethodStable {
  switch (method) {
    case 1:
      return "password";
    case 2:
      return "email";
    case 3:
      return "link";
    default:
      return "unspecified";
  }
}

/**
 * 租户激活方式：稳定模型 -> 原始模型。
 *
 * @param method 前端稳定激活方式
 * @returns 后端激活方式码值（0/1/2/3）
 */
export function mapStable2WireActivationMethod(method?: ActivationMethodStable): number {
  switch (method) {
    case "password":
      return 1;
    case "email":
      return 2;
    case "link":
      return 3;
    default:
      return 0;
  }
}
