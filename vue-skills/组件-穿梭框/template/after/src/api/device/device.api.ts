import request from "@/utils/request";
import { DEVICE_STATUS, DEVICE_STATUS_CONFIG } from "@/enums/device/device-status.enum";

const DEVICE_BASE_URL = "/forward/devmgr/device";
const DeviceAPI = {
  get(data: any) {
    return request<any, any>({
      url: `${DEVICE_BASE_URL}/list`,
      method: "post",
      data,
    });
  },
  //淇敼璁惧鍨嬪彿
  update(data: DeviceForm) {
    return request<any, any>({
      url: `${DEVICE_BASE_URL}/update`,
      method: "post",
      data,
    });
  },
  //鏂板璁惧鍨嬪彿
  create(data: DeviceForm) {
    return request<any, any>({
      url: `${DEVICE_BASE_URL}/create`,
      method: "post",
      data,
    });
  },
  delete(data: DeviceForm) {
    return request<any, any>({
      url: `${DEVICE_BASE_URL}/delete`,
      method: "post",
      data,
    });
  },
  forbidden(data: { ids: number[]; disabled: boolean }) {
    return request<any, any>({
      url: `${DEVICE_BASE_URL}/disable`,
      method: "post",
      data,
    });
  },
  /**
   * 鏌ヨ璁惧鎬昏
   */
  overview(data?: { deviceTypeId?: string | number }) {
    return request<any, any>({
      url: `${DEVICE_BASE_URL}/overview`,
      method: "post",
      data,
    });
  },
  /**
   * 瀵煎叆璁惧鍨嬪彿
   *
   * @param deptId 閮ㄩ棬ID
   * @param file 瀵煎叆鏂囦欢
   */
  import({ file, deviceTypeId }: { file: any; deviceTypeId: any }) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("deviceTypeId", deviceTypeId);
    return request<any, ExcelResult>({
      url: `${DEVICE_BASE_URL}/import`,
      method: "post",
      data: formData,
    });
  },
  /** 涓嬭浇鐢ㄦ埛瀵煎叆妯℃澘 */
  downloadTemplate() {
    return request<any, any>({
      url: `${DEVICE_BASE_URL}/template/get`,
      method: "get",
    });
  },
  /**
   * 鎵归噺瀵煎嚭璁惧閰嶇疆
   *
   */
  exportDeviceConfig(data: any) {
    return request<any, any>({
      url: `${DEVICE_BASE_URL}/export`,
      method: "post",
      data,
    });
  },
  /**
   * 鏌ヨ璋冭瘯鍛戒护鍒楄〃
   *
   */
  queryDebugCommandsList(data: any) {
    return request<any, any>({
      url: `${DEVICE_BASE_URL}/command/list`,
      method: "post",
      data,
    });
  },
  //鎵ц璋冭瘯鍛戒护
  commandExecute(data: any) {
    return request<any, any>({
      url: `${DEVICE_BASE_URL}/command/execute`,
      method: "post",
      data,
    });
  },
  //鏌ヨ鎵ц鏃ュ織
  queryCommandLog(data: any) {
    return request<any, any>({
      url: `${DEVICE_BASE_URL}/command/log`,
      method: "post",
      data,
    });
  },
  //璁惧婵€娲?  deviceActivate(data: any) {
    return request<any, any>({
      url: `${DEVICE_BASE_URL}/activate`,
      method: "post",
      data,
    });
  },
  //鑾峰彇鏁版嵁涓婁笅鏂?-鏍规嵁璁惧ID鍜屾ā鏉胯幏鍙栦竴棰楄〃鏍?  getDeviceTreeByTemplateNameAndDeviceId(data: any) {
    return request<any, any>({
      url: `/direct/devicedata/context`,
      method: "post",
      data,
    });
  },
  //鑾峰彇鍏崇郴鏁版嵁搴撴暟鎹?  getRdbData(data: any) {
    return request<any, any>({
      url: `/direct/devicedata/rdb/get`,
      method: "post",
      data,
    });
  },
  //鑾峰彇鏃跺簭鏁版嵁搴?  getTsdbData(data: any) {
    return request<any, any>({
      url: `/direct/devicedata/tsdb/get`,
      method: "post",
      data,
    });
  },
  //鑾峰彇缂撳瓨搴撴暟鎹?  getCdbData(data: any) {
    return request<any, any>({
      url: `/direct/devicedata/cdb/get`,
      method: "post",
      data,
    });
  },
  //鑾峰彇缂撳瓨搴撻敭鐨勫€?  getRedisKeyValue(data: any) {
    return request<any, any>({
      url: `/direct/devicedata/cdb/getValues`,
      method: "post",
      data,
    });
  },
  //鑾峰彇璁惧缁戝畾鐨勯」鐩強妯℃澘淇℃伅
  getDeviceBindProjectAndTemplate(data: any) {
    return request<any, any>({
      url: `/direct/dbres/bind/projects`,
      method: "post",
      data,
    });
  },
};

export interface DevicePageQuery extends PaginationQuery {
  /** 鎼滅储鍏抽敭瀛?*/
  keyword?: string;
  // 璁惧鍨嬪彿
  deviceTypeId?: number | string;
  // 璁惧鐘舵€?  status?: string[] | number[];
  tenantId?: string;
  sortKey?: string;
  sortOrder?: string;
  productId?: number;
  scope?: number;
}

/** 璁惧鍒楄〃鍗曢〉鎺ュ彛鍝嶅簲 pagination锛坵ire锛?*/
export interface DeviceListPagination {
  totalCount?: number;
  totalPages?: number;
  page?: number;
  pageSize?: number;
}

/** 璁惧鍒楄〃鍗曢〉鎺ュ彛鍝嶅簲缁撴瀯锛坵ire锛?*/
export interface DeviceListPageResponse {
  list?: DeviceForm[];
  pagination?: DeviceListPagination;
}
export interface DeviceForm {
  deviceTypeId?: string;
  deviceName?: string;
  deviceMark?: string;
  id?: string;
  lastOnlineTime?: string;
  deviceTypeDesc?: string;
  deviceTypeName?: string;
  deviceDesc?: string;
  status?: any;
  ids?: any[];
  deviceSecret?: string;
  machineCode?: string; //鏈哄櫒鐮?  createTime?: string; //鍒涘缓浜嬩欢
  address?: string;
  tenantId?: string; //绉熸埛id
  activateTime?: string;
  version?: string;
  tenantName?: string;
  deviceKey?: string;
  activateDeviceIds?: string[];
  editing?: boolean;
  editingDeviceDesc?: string;
  batchDevices?: DeviceForm[];
  autoDeviceKey?: boolean;
  ips?: string[];
}
export default DeviceAPI;
export { DEVICE_STATUS, DEVICE_STATUS_CONFIG };
