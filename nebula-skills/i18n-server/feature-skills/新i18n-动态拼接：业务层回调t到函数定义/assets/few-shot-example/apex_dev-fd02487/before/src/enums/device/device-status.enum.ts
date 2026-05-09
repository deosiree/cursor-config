export enum DEVICE_STATUS {
  UNACTIVATED = 1, // 未分配
  ACTIVATED = 2, // 未投运
  OFFLINE = 3, // 离线
  ONLINE = 4, // 在线
  DISABLED = 5, // 禁用
}

type StatusTagType = "success" | "warning" | "primary" | "danger" | "info";

export const DEVICE_STATUS_CONFIG: Record<number, { label: string; type: StatusTagType }> = {
  [DEVICE_STATUS.UNACTIVATED]: { label: "未分配", type: "info" },
  [DEVICE_STATUS.ACTIVATED]: { label: "未投运", type: "primary" },
  [DEVICE_STATUS.OFFLINE]: { label: "离线", type: "warning" },
  [DEVICE_STATUS.ONLINE]: { label: "在线", type: "success" },
  [DEVICE_STATUS.DISABLED]: { label: "禁用", type: "danger" },
};
