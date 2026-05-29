import DeviceAPI, {
  DEVICE_STATUS,
  DEVICE_STATUS_CONFIG,
  type DeviceForm,
  type DeviceListPageResponse,
  type DevicePageQuery,
} from "@/api/device/device.api";
import { PAGE_SIZE_MAX } from "@/constants/pagination";
import { concurApiErr, handleGatewayError, newConcurLock } from "@/utils/notification";
import type { DeviceDetailStableModel, DeviceListBaseQuery } from "@/types/device";

export { DEVICE_STATUS, DEVICE_STATUS_CONFIG };
export type { DeviceForm, DevicePageQuery };

/**
 * 鎸夋爣鍑嗗垎椤靛娆¤姹傝澶囧垪琛紝鍚堝苟涓哄叏閲忕粨鏋溿€? * 鍏堣姹傜 1 椤佃幏鍙?totalPages锛屽啀骞惰鎷夊彇鍓╀綑椤碉紱涓嶈椤垫暟涓婇檺銆? *
 * @param baseQuery 涓氬姟绛涢€夋潯浠讹紙status銆乼enantId銆乻cope 绛夛級
 * @returns 鍚堝苟鍚庣殑 list 涓?total锛坱otalCount锛? */
async function fetchAllDevicePages(
  baseQuery: DeviceListBaseQuery
): Promise<{ list: DeviceForm[]; total: number }> {
  const lock = newConcurLock();
  const page = 1;

  let firstRes: DeviceListPageResponse;
  try {
    firstRes = (await DeviceAPI.get({
      ...baseQuery,
      pagination: { page, pageSize: PAGE_SIZE_MAX },
    })) as DeviceListPageResponse;
  } catch (error) {
    concurApiErr(lock, error, `鍔犺浇璁惧鍒楄〃绗?${page} 椤靛け璐?`);
    throw error;
  }

  const firstList = firstRes?.list ?? [];
  const pagination = firstRes?.pagination;
  const totalCount = Number(pagination?.totalCount ?? firstList.length);
  let totalPages = Number(pagination?.totalPages ?? 0);

  // 鎺ュ彛鏈繑鍥?totalPages 鏃讹紝鐢?totalCount 鎺ㄧ畻
  if (!totalPages && totalCount > 0) {
    totalPages = Math.ceil(totalCount / PAGE_SIZE_MAX);
  }
  if (totalPages < 1) {
    totalPages = 1;
  }

  if (totalPages <= 1) {
    return { list: firstList, total: totalCount };
  }

  // 绗?2锝濶 椤靛苟琛岃姹傦紝鍗曢〉澶辫触涓嶉樆鏂叾浣欓〉
  const pagePromises = Array.from({ length: totalPages - 1 }, (_, index) => {
    const curPage = page + index + 1;
    return DeviceAPI.get({
      ...baseQuery,
      pagination: { page: curPage, pageSize: PAGE_SIZE_MAX },
    }).catch((error) => {
      concurApiErr(lock, error, `鍔犺浇璁惧鍒楄〃绗?${curPage} 椤靛け璐?`);
      return null;
    });
  });

  const pageResults = await Promise.all(pagePromises);
  const mergedList = [...firstList];

  pageResults.forEach((res) => {
    const pageRes = res as DeviceListPageResponse | null;
    if (pageRes?.list?.length) {
      mergedList.push(...pageRes.list);
    }
  });

  return { list: mergedList, total: totalCount };
}

/**
 * 璁惧缃戝叧锛岀粺涓€灏佽璁惧鍩熻兘鍔涜闂€? */
const DeviceGateway = {
  /** 鏌ヨ璁惧璇︽儏銆?*/
  get(data: any): Promise<any> {
    return DeviceAPI.get(data);
  },
  /**
   * 鑱氬悎璁惧琛屼笌绉熸埛璇︽儏锛岃緭鍑鸿澶囪鎯呯ǔ瀹氭ā鍨嬨€?   *
   * @param row 璁惧鍒楄〃琛屾暟鎹?   * @returns 璁惧璇︽儏绋冲畾妯″瀷
   */
  async getDeviceDetailStableByRow(row: DeviceForm): Promise<DeviceDetailStableModel> {
    const tenantId = row.tenantId;
    if (!tenantId) {
      return { ...row, tenantName: "-" };
    }
    try {
      const { default: TenantGateway } = await import("@/gateway/system/tenant/tenant.gateway");
      const detailRes = await TenantGateway.getDetailV2(tenantId);
      const tenantName = detailRes.tenant?.name?.trim() || "-";
      return { ...row, tenantName };
    } catch {
      return { ...row, tenantName: "-" };
    }
  },
  /**
   * 鏌ヨ鎸囧畾/鎵€鏈夌鎴蜂笅鐨勫凡缁戝畾璁惧鍏ㄩ噺鍒楄〃锛堝唴閮ㄥ垎椤?pageSize=50 鎷夊彇鍏ㄩ儴椤碉級銆?   *
   * @param tenantId 鍙€夛紝闄愬畾绉熸埛
   * @param scope 鍙€夛紝scope=1 琛ㄧず褰撳墠绉熸埛缁村害涓嬬殑鍏ㄩ儴宸茬粦瀹氳澶?   * @returns list 鍏ㄩ噺璁惧琛岋紱total 涓?pagination.totalCount
   */
  getBind(tenantId?: string, scope?: number): Promise<{ list: DeviceForm[]; total: number }> {
    return fetchAllDevicePages({
      productId: 0,
      status: [
        DEVICE_STATUS.ACTIVATED,
        DEVICE_STATUS.OFFLINE,
        DEVICE_STATUS.ONLINE,
        DEVICE_STATUS.DISABLED,
      ],
      ...(tenantId ? { tenantId } : {}),
      ...(scope ? { scope } : {}),
    });
  },
  /**
   * 鏌ヨ鏈粦瀹氳澶囧叏閲忓垪琛紙鍐呴儴鍒嗛〉 pageSize=50 鎷夊彇鍏ㄩ儴椤碉級銆?   *
   * @returns list 鍏ㄩ噺鏈縺娲昏澶囷紱total 涓?pagination.totalCount
   */
  getUnbind(): Promise<{ list: DeviceForm[]; total: number }> {
    return fetchAllDevicePages({
      productId: 0,
      status: [DEVICE_STATUS.UNACTIVATED],
    });
  },
  /**
   * 鍒嗛〉鏌ヨ宸茬粦瀹氳澶囷紙鍗曢〉锛屼緵瑙掕壊鍏宠仈璁惧绛夊満鏅紝涓嶈蛋鍏ㄩ噺鍚堝苟锛夈€?   *
   * @param query.page 椤电爜
   * @param query.pageSize 姣忛〉鏉℃暟
   * @param query.scope 鍙€夛紝scope=1 琛ㄧず褰撳墠绉熸埛缁村害
   * @param query.keyword 鍙€夛紝鎼滅储鍏抽敭瀛?   */
  getBindPage(query: {
    page: number;
    pageSize: number;
    scope?: number;
    keyword?: string;
  }): Promise<{ list: DeviceForm[]; total: number }> {
    return handleGatewayError(async () => {
      const res = (await DeviceAPI.get({
        productId: 0,
        status: [
          DEVICE_STATUS.ACTIVATED,
          DEVICE_STATUS.OFFLINE,
          DEVICE_STATUS.ONLINE,
          DEVICE_STATUS.DISABLED,
        ],
        ...(query.keyword ? { keyword: query.keyword } : {}),
        ...(query.scope ? { scope: query.scope } : {}),
        pagination: { page: query.page, pageSize: query.pageSize },
      })) as DeviceListPageResponse;
      return {
        list: res?.list ?? [],
        total: Number(res?.pagination?.totalCount ?? 0),
      };
    }, "鍔犺浇璁惧鍒楄〃澶辫触");
  },
  /**
   * 瑙ｇ粦鎸囧畾绉熸埛涓嬬殑鍏ㄩ儴宸茬粦瀹氳澶囷紙闆嗘垚鏂规硶锛屼笉鍖?handleGatewayError锛夈€?   *
   * @param tenantId 绉熸埛 ID
   */
  async unbindAllByTenantId(tenantId: string): Promise<void> {
    // 鏌ヨ绉熸埛涓嬬殑鎵€鏈夊凡缁戝畾璁惧
    const bindRes = await DeviceGateway.getBind(tenantId);
    const deviceIds = ((bindRes?.list ?? []) as Array<{ id?: string | number }>)
      .map((d) => String(d.id ?? "").trim())
      .filter(Boolean);

    if (deviceIds.length === 0) {
      return;
    }
    // 璁剧疆婵€娲昏澶囦负绌猴紝瑙ｇ粦璁惧涓鸿绉熸埛鐨勬墍鏈夊凡缁戝畾璁惧
    await DeviceGateway.deviceActivate({
      tenantId,
      activateDeviceIds: [],
      deactivateDeviceIds: deviceIds,
      autoDeviceKey: true,
      deviceName: "",
    });
  },
  /** 鏇存柊璁惧淇℃伅銆?*/
  update(data: DeviceForm): Promise<any> {
    return DeviceAPI.update(data);
  },
  /** 鍒涘缓璁惧銆?*/
  create(data: DeviceForm): Promise<any> {
    return DeviceAPI.create(data);
  },
  /** 鍒犻櫎璁惧銆?*/
  delete(data: DeviceForm): Promise<any> {
    return DeviceAPI.delete(data);
  },
  /** 鍚敤/绂佺敤璁惧銆?*/
  forbidden(data: { ids: Array<string | number>; disabled: boolean }): Promise<any> {
    return DeviceAPI.forbidden({
      ...data,
      ids: data.ids.map((id) => Number(id)),
    });
  },
  /** 鏌ヨ璁惧姒傝缁熻銆?*/
  overview(data?: { deviceTypeId?: string | number }): Promise<any> {
    return DeviceAPI.overview(data);
  },
  /** 瀵煎叆璁惧銆?*/
  import(data: { file: any; deviceTypeId: any }): Promise<any> {
    return DeviceAPI.import(data);
  },
  /** 涓嬭浇璁惧瀵煎叆妯℃澘銆?*/
  downloadTemplate(): Promise<any> {
    return DeviceAPI.downloadTemplate();
  },
  /** 瀵煎嚭璁惧閰嶇疆銆?*/
  exportDeviceConfig(data: any): Promise<any> {
    return DeviceAPI.exportDeviceConfig(data);
  },
  /** 鏌ヨ璋冭瘯鍛戒护鍒楄〃銆?*/
  queryDebugCommandsList(data: any): Promise<any> {
    return DeviceAPI.queryDebugCommandsList(data);
  },
  /** 鎵ц璋冭瘯鍛戒护銆?*/
  commandExecute(data: any): Promise<any> {
    return DeviceAPI.commandExecute(data);
  },
  /** 鏌ヨ鍛戒护鎵ц鏃ュ織銆?*/
  queryCommandLog(data: any): Promise<any> {
    return DeviceAPI.queryCommandLog(data);
  },
  /** 璁惧婵€娲?瑙ｇ粦銆?*/
  deviceActivate(data: any): Promise<any> {
    return handleGatewayError(() => DeviceAPI.deviceActivate(data), "璁惧缁戝畾/瑙ｇ粦澶辫触");
  },
  /** 鏌ヨ璁惧鏍戯紙妯℃澘 + 璁惧缁村害锛夈€?*/
  getDeviceTreeByTemplateNameAndDeviceId(data: any): Promise<any> {
    return DeviceAPI.getDeviceTreeByTemplateNameAndDeviceId(data);
  },
  /** 鏌ヨ RDB 鏁版嵁銆?*/
  getRdbData(data: any): Promise<any> {
    return DeviceAPI.getRdbData(data);
  },
  /** 鏌ヨ TSDB 鏁版嵁銆?*/
  getTsdbData(data: any): Promise<any> {
    return DeviceAPI.getTsdbData(data);
  },
  /** 鏌ヨ CDB 鏁版嵁銆?*/
  getCdbData(data: any): Promise<any> {
    return DeviceAPI.getCdbData(data);
  },
  /** 鏌ヨ Redis 閿€笺€?*/
  getRedisKeyValue(data: any): Promise<any> {
    return DeviceAPI.getRedisKeyValue(data);
  },
  /** 鏌ヨ璁惧缁戝畾椤圭洰涓庢ā鏉夸俊鎭€?*/
  getDeviceBindProjectAndTemplate(data: any): Promise<any> {
    return DeviceAPI.getDeviceBindProjectAndTemplate(data);
  },
};

export default DeviceGateway;
