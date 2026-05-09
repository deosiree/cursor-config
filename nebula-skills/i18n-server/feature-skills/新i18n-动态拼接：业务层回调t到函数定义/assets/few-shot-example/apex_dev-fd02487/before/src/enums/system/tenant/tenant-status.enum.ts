import type { UserStableStatus } from "@/types/user";
import type { TenantStatusMeta, TenantStableStatus } from "./tenant.enum";
export { TENANT_STATUS_CONFIG, mapWire2StableTenantStatus } from "./tenant.enum";
export type { TenantStableStatus, TenantStatusTagType } from "./tenant.enum";

/**
 * 租户列表展示状态。
 * 这是租户状态与所有者状态合并后的业务展示语义，不应与原始租户状态混用。
 */
export type TenantStatusVO =
  | "unspecified" // 租户状态未指定，且无法得出更明确的展示状态
  | "active" // 租户和所有者均正常
  | "disabled" // 租户停用，或租户正常但所有者已停用
  | "expired" // 租户已过期
  | "locked" // 租户正常，但所有者已锁定
  | "activation"; // 租户正常，但所有者待激活

/**
 * 租户列表业务展示状态配置。
 * 用于“状态”列展示，优先体现租户状态；当租户正常时，再体现所有者用户状态。
 */
export const TENANT_STATUS_VO_CONFIG: Record<TenantStatusVO, TenantStatusMeta> = {
  unspecified: { label: "未指定", type: "info" },
  active: { label: "正常", type: "success" },
  disabled: { label: "停用", type: "danger" },
  expired: { label: "过期", type: "warning" },
  locked: { label: "锁定", type: "warning" },
  activation: { label: "待激活", type: "primary" },
};

/**
 * 将 wire 态所有者用户状态映射为稳定态。
 *
 * @param status wire 态所有者用户状态
 * @returns 所有者用户稳定状态
 */
export function mapWire2StableOwnerStatus(status?: number | null): UserStableStatus {
  switch (status) {
    case 1:
      return "active";
    case 2:
      return "locked";
    case 3:
      return "disabled";
    case 4:
      return "activation";
    default:
      return "unspecified";
  }
}

/**
 * 计算租户列表“状态”列的业务展示状态。
 * 规则：
 * 1. 租户状态非正常时，优先显示租户状态。
 * 2. 租户状态为正常时：
 *    - 所有者正常，显示正常
 *    - 否则显示所有者状态
 *
 * @param tenantStatus 租户原始稳定状态
 * @param ownerStatus 所有者用户稳定状态
 * @returns 租户列表业务展示状态
 */
export function resolveTenantStatusVO(
  tenantStatus: TenantStableStatus,
  ownerStatus: UserStableStatus = "unspecified"
): TenantStatusVO {
  return (tenantStatus !== "active" ? tenantStatus : ownerStatus) as TenantStatusVO;
}
