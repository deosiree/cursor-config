import DeviceAPI, {
  DEVICE_STATUS,
  DEVICE_STATUS_CONFIG,
  type DeviceForm,
  type DevicePageQuery,
} from "@/api/device/device.api";
import { handleGatewayError } from "@/utils/notification";
import type { DeviceDetailStableModel } from "@/types/device";

export { DEVICE_STATUS, DEVICE_STATUS_CONFIG };
export type { DeviceForm, DevicePageQuery };

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
  /** 鏌ヨ鎸囧畾/鎵€鏈夌鎴蜂笅鐨勬墍鏈夊凡缁戝畾璁惧銆俿crop=1琛ㄧず鏌ヨ褰撳墠绉熸埛涓嬬殑鎵€鏈?*/
  getBind(tenantId?: string, scope?: number): Promise<any> {
    return handleGatewayError(
      () =>
        DeviceAPI.get({
          page: 1,
          pageSize: 999999,
          productId: 0,
          status: [
            DEVICE_STATUS.ACTIVATED,
            DEVICE_STATUS.OFFLINE,
            DEVICE_STATUS.ONLINE,
            DEVICE_STATUS.DISABLED,
          ],
          ...(tenantId ? { tenantId } : {}),
          ...(scope ? { scope } : {}),
        }),
      tenantId ? "鍔犺浇绉熸埛宸茬粦瀹氳澶囧け璐? : "鍔犺浇宸茬粦瀹氳澶囧け璐?
    );
  },
  /** 鏌ヨ褰撳墠绉熸埛涓嬬殑鎵€鏈夋湭缁戝畾璁惧銆?*/
  getUnbind(): Promise<any> {
    return DeviceAPI.get({
      page: 1,
      pageSize: 999999,
      productId: 0,
      status: [DEVICE_STATUS.UNACTIVATED],
    });
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
