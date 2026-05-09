import { trans } from "vue-i18n-kit-sy/runtime";

export enum DEVICE_STATUS {
  UNACTIVATED = 1, // 未分配
  ACTIVATED = 2, // 未投运
  OFFLINE = 3, // 离线
  ONLINE = 4, // 在线
  DISABLED = 5, // 禁用
}

type StatusTagType = "success" | "warning" | "primary" | "danger" | "info";

export const DEVICE_STATUS_CONFIG: Record<number, { label: string; type: StatusTagType }> = {
  [DEVICE_STATUS.UNACTIVATED]: { label: trans("未分配"), type: "info" },
  [DEVICE_STATUS.ACTIVATED]: { label: trans("未投运"), type: "primary" },
  [DEVICE_STATUS.OFFLINE]: { label: trans("离线"), type: "warning" },
  [DEVICE_STATUS.ONLINE]: { label: trans("在线"), type: "success" },
  [DEVICE_STATUS.DISABLED]: { label: trans("禁用"), type: "danger" },
};
