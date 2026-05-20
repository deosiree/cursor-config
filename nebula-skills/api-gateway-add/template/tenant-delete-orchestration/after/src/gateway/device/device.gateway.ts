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
 * 设备网关，统一封装设备域能力访问。
 */
const DeviceGateway = {
  /** 查询设备详情。 */
  get(data: any): Promise<any> {
    return DeviceAPI.get(data);
  },
  /**
   * 聚合设备行与租户详情，输出设备详情稳定模型。
   *
   * @param row 设备列表行数据
   * @returns 设备详情稳定模型
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
  /** 查询指定/所有租户下的所有已绑定设备。 */
  getBind(tenantId?: string): Promise<any> {
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
        }),
      tenantId ? "加载租户已绑定设备失败" : "加载已绑定设备失败"
    );
  },
  /** 查询当前租户下的所有未绑定设备。 */
  getUnbind(): Promise<any> {
    return DeviceAPI.get({
      page: 1,
      pageSize: 999999,
      productId: 0,
      status: [DEVICE_STATUS.UNACTIVATED],
    });
  },
  /**
   * 解绑指定租户下的全部已绑定设备（集成方法，不包 handleGatewayError）。
   *
   * @param tenantId 租户 ID
   */
  async unbindAllByTenantId(tenantId: string): Promise<void> {
    // 查询租户下的所有已绑定设备
    const bindRes = await DeviceGateway.getBind(tenantId);
    const deviceIds = ((bindRes?.list ?? []) as Array<{ id?: string | number }>)
      .map((d) => String(d.id ?? "").trim())
      .filter(Boolean);

    if (deviceIds.length === 0) {
      return;
    }
    // 设置激活设备为空，解绑设备为该租户的所有已绑定设备
    await DeviceGateway.deviceActivate({
      tenantId,
      activateDeviceIds: [],
      deactivateDeviceIds: deviceIds,
      autoDeviceKey: true,
      deviceName: "",
    });
  },
  /** 更新设备信息。 */
  update(data: DeviceForm): Promise<any> {
    return DeviceAPI.update(data);
  },
  /** 创建设备。 */
  create(data: DeviceForm): Promise<any> {
    return DeviceAPI.create(data);
  },
  /** 删除设备。 */
  delete(data: DeviceForm): Promise<any> {
    return DeviceAPI.delete(data);
  },
  /** 启用/禁用设备。 */
  forbidden(data: { ids: Array<string | number>; disabled: boolean }): Promise<any> {
    return DeviceAPI.forbidden({
      ...data,
      ids: data.ids.map((id) => Number(id)),
    });
  },
  /** 查询设备概览统计。 */
  overview(data?: { deviceTypeId?: string | number }): Promise<any> {
    return DeviceAPI.overview(data);
  },
  /** 导入设备。 */
  import(data: { file: any; deviceTypeId: any }): Promise<any> {
    return DeviceAPI.import(data);
  },
  /** 下载设备导入模板。 */
  downloadTemplate(): Promise<any> {
    return DeviceAPI.downloadTemplate();
  },
  /** 导出设备配置。 */
  exportDeviceConfig(data: any): Promise<any> {
    return DeviceAPI.exportDeviceConfig(data);
  },
  /** 查询调试命令列表。 */
  queryDebugCommandsList(data: any): Promise<any> {
    return DeviceAPI.queryDebugCommandsList(data);
  },
  /** 执行调试命令。 */
  commandExecute(data: any): Promise<any> {
    return DeviceAPI.commandExecute(data);
  },
  /** 查询命令执行日志。 */
  queryCommandLog(data: any): Promise<any> {
    return DeviceAPI.queryCommandLog(data);
  },
  /** 设备激活/解绑。 */
  deviceActivate(data: any): Promise<any> {
    return handleGatewayError(() => DeviceAPI.deviceActivate(data), "设备绑定/解绑失败");
  },
  /** 查询设备树（模板 + 设备维度）。 */
  getDeviceTreeByTemplateNameAndDeviceId(data: any): Promise<any> {
    return DeviceAPI.getDeviceTreeByTemplateNameAndDeviceId(data);
  },
  /** 查询 RDB 数据。 */
  getRdbData(data: any): Promise<any> {
    return DeviceAPI.getRdbData(data);
  },
  /** 查询 TSDB 数据。 */
  getTsdbData(data: any): Promise<any> {
    return DeviceAPI.getTsdbData(data);
  },
  /** 查询 CDB 数据。 */
  getCdbData(data: any): Promise<any> {
    return DeviceAPI.getCdbData(data);
  },
  /** 查询 Redis 键值。 */
  getRedisKeyValue(data: any): Promise<any> {
    return DeviceAPI.getRedisKeyValue(data);
  },
  /** 查询设备绑定项目与模板信息。 */
  getDeviceBindProjectAndTemplate(data: any): Promise<any> {
    return DeviceAPI.getDeviceBindProjectAndTemplate(data);
  },
};

export default DeviceGateway;
