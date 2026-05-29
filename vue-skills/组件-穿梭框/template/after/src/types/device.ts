export type DeviceTenantNameSource = "row" | "tenantDetail";

/** 璁惧鍒楄〃鏌ヨ鏉′欢锛堜笉鍚?pagination锛岀敱 gateway 鍐呴儴鍒嗛〉鎷艰锛?*/
export interface DeviceListBaseQuery {
  productId?: number;
  scope?: number;
  keyword?: string;
  deviceTypeId?: number | string;
  status?: string[] | number[];
  tenantId?: string;
  sortKey?: string;
  sortOrder?: string;
}

/**
 * 璁惧璇︽儏绋冲畾妯″瀷锛屼緵璁惧璇︽儏寮圭獥娑堣垂銆? */
export interface DeviceDetailStableModel {
  deviceName?: string;
  deviceKey?: string;
  machineCode?: string;
  deviceSecret?: string;
  deviceMark?: string;
  deviceDesc?: string;
  status?: number;
  tenantId?: string;
  tenantName?: string;
  tenantSource?: DeviceTenantNameSource;
  deviceTypeDesc?: string;
  deviceTypeName?: string;
  version?: string;
  createTime?: string;
  activateTime?: string;
  lastOnlineTime?: string;
  address?: string;
  ips?: string[];
}

export interface DeviceTypeItem {
  id: string;
  deviceTypeMark?: string;
}

export interface CascaderResourceOption {
  value: string;
  label: string;
  description: string;
  leaf: true;
}

export interface CascaderProjectOption {
  value: string;
  label: string;
  description: string;
  children: CascaderResourceOption[];
}

export interface DeviceBindCacheItem {
  deviceId: string;
  selectedPaths: string[][];
}

/**
 * 瑙掕壊绠＄悊-璁惧鏍囩椤? */
export interface DeviceTabItem {
  id: string;
  name: string;
  code: string;
}

/**
 * 瑙掕壊绠＄悊-灏嗚澶囩綉鍏宠繑鍥炵殑鏁版嵁鏄犲皠涓?DeviceTab 鎵€闇€鐨勭ǔ瀹氭ā鍨嬨€? *
 * @param source 璁惧鍒楄〃鍘熷鏁版嵁
 * @returns DeviceTab 璁惧椤? */
export function mapBindDevicesToTabItems(source: any[]): DeviceTabItem[] {
  return (source || [])
    .map((item) => ({
      id: String(item?.id ?? ""),
      name: String(item?.deviceName ?? item?.name ?? ""),
      code: String(item?.deviceKey ?? item?.machineCode ?? item?.deviceMark ?? "-"),
    }))
    .filter((item) => item.id && item.name);
}
