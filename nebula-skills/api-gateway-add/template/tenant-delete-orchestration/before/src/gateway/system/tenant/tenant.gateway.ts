import TenantAPI from "@/api/system/tenant.api";
import ConfigV2API from "@/api/seccenter/config.v2.api";
import { normalizeTenantLocale, normalizeTenantTimezone } from "@/constants/tenant";
import { mapWire2StableTime, mapStable2WireTime } from "./tenant-expire-at";

export type {
  AssignTenantProjectsPayload,
  TenantDetailV2Data,
  TenantDeleteV2Response,
  TenantListV2Data,
  TenantListV2Request,
  TenantProjectsV2Data,
  v2GetTenantStatusStatsRequest,
  v2GetTenantStatusStatsResponse,
  TenantV2,
  UpdateTenantStatusV2Payload,
  v2CreateTenantRequest,
  v2CreateTenantResponse,
  v2UpdateTenantRequest,
  v2UpdateTenantResponse,
} from "@/api/system/tenant.api";

import type {
  TenantDetailV2Data,
  TenantDeleteV2Response,
  TenantListV2Data,
  TenantListV2Request,
  TenantProjectsV2Data,
  v2GetTenantStatusStatsResponse,
  v2CreateTenantRequest,
  v2CreateTenantResponse,
  v2UpdateTenantRequest,
} from "@/api/system/tenant.api";
import ProjectGateway from "@/gateway/resource/project/project.gateway";
import {
  mapStable2WireProject,
  mapWire2StableProject,
} from "@/gateway/resource/project/project.map";
import {
  mapWire2StableOwnerStatus,
  mapWire2StableTenantStatus,
  resolveTenantStatusVO,
} from "@/enums";
import { mapStable2WireActivationMethod, mapWire2StableActivationMethod } from "@/enums/auth.enum";
import { handleGatewayError } from "@/utils/notification";
import type {
  TenantCreateFormInput,
  TenantDetailResult,
  TenantCreateResult,
  TenantInfoFormModel,
  TenantListPageResult,
  TenantProjectBindingModel,
  TenantTableRowModel,
  TenantStatusStats,
} from "@/types/tenant";

/**
 * 规范化 projects:[{projectId,deviceIds}]
 * @param projects
 * @returns
 */
function normalizeTenantProjectBindings(
  projects: Array<{ projectId?: string; deviceIds?: string[] }> | undefined
): TenantProjectBindingModel[] {
  const result: any[] = [];

  (projects ?? []).forEach((p) => {
    // 1. 映射并清洗项目 ID
    const projectId = mapWire2StableProject(String(p?.projectId ?? "").trim());

    // 2. 只有 ID 合法时才继续处理
    if (projectId) {
      // 3. 内联去重并清洗设备 ID 列表
      const deviceIds = Array.from(
        new Set((p?.deviceIds ?? []).map((id) => String(id).trim()).filter(Boolean))
      );

      result.push({ projectId, deviceIds });
    }
  });

  return result;
}

/**
 * projects的稳定类型->原始类型
 * @param projects
 * @returns
 */
function mapStableTenantProjectBindingsToWire(
  projects: TenantProjectBindingModel[] | undefined
): TenantProjectBindingModel[] {
  return (projects ?? [])
    .map((project) => ({
      projectId: mapStable2WireProject(String(project?.projectId ?? "").trim()),
      deviceIds: Array.from(
        new Set((project?.deviceIds ?? []).map((id) => String(id).trim()).filter(Boolean))
      ),
    }))
    .filter((project) => Boolean(project.projectId));
}

/**
 * 将租户详情detail原始响应映射为稳定模型响应。
 *
 * @param data 原始租户详情
 * @returns 稳定租户详情
 */
function mapWireDetailToStableDetail(data: TenantDetailV2Data): TenantDetailResult {
  return {
    tenant: data.tenant,
    tenantForm: {
      tenantName: data.tenant?.name ?? "",
      icon: (data as any).icon ?? "",
      expireTime: mapWire2StableTime(data.tenant?.expireAt),
      remark: (data as any).remark ?? "",
      description: data.tenant?.description ?? "",
      timezone: normalizeTenantTimezone(data.tenant?.timezone),
      locale: normalizeTenantLocale(data.tenant?.locale),
      dingtalk: data.tenant?.dingtalk ?? "",
      dingtalkSecret: data.tenant?.dingtalkSecret ?? "",
    },
    ownerView: {
      userName: data.tenant?.ownerName ?? "",
      email: (data as any).ownerEmail ?? data.tenant?.ownerEmail ?? "",
      phone: (data as any).ownerPhone ?? data.tenant?.ownerPhone ?? "",
    },
  };
}

/**
 * 租户网关，统一封装租户域接口调用与少量响应修正。
 */
const TenantGateway = {
  /**
   * 查询 租户分页 + 租户配置
   *
   * @param query 查询参数
   * @returns v2 风格分页结果
   */
  async getPageV2(query: TenantListV2Request): Promise<TenantListPageResult> {
    return handleGatewayError(async () => {
      // 发送请求并获取响应
      const [res, configRes] = await Promise.all([
        TenantAPI.getPageV2(query), // 租户分页查询
        ConfigV2API.detail({}), // 租户配置查询
      ]);
      const data: TenantListV2Data = (res as unknown as { data?: TenantListV2Data }).data ?? res; // 原始响应
      const activationMethod = mapWire2StableActivationMethod(configRes?.config?.activationMethod); // 激活方式

      // 原始响应->稳定响应
      const rows: TenantTableRowModel[] = (data.tenants ?? []).map((item) => {
        const status = mapWire2StableTenantStatus(item.status);
        const ownerStatus = mapWire2StableOwnerStatus(item.ownerStatus);
        const statusVO = resolveTenantStatusVO(status, ownerStatus); // 合并租户状态和租户所有者状态的状态值对象

        return {
          id: String(item.id ?? ""),
          ownerId: item.ownerId ? String(item.ownerId) : undefined,
          tenantName: item.name ?? "",
          contactName: item.ownerName ?? "",
          contactPhone: item.ownerPhone ?? "",
          contactEmail: item.ownerEmail ?? "",
          status,
          ownerStatus,
          statusVO,
          showResendActivation: activationMethod !== "password" && statusVO === "activation", // 是否显示重发激活链接
          expireAt: item.expireAt ?? "",
          createdAt: item.createdAt ?? "",
          updatedAt: item.updatedAt ?? "",
        };
      }); // 租户列表的稳定响应
      return {
        rows,
        total: data.pagination?.totalCount ?? 0,
        pagination: {
          page: data.pagination?.page ?? query.pagination.page,
          pageSize: data.pagination?.pageSize ?? query.pagination.pageSize,
          totalCount: data.pagination?.totalCount ?? 0,
          totalPages: data.pagination?.totalPages ?? 0,
        },
      }; // 再加上分页信息
    }, "加载租户列表失败");
  },

  /**
   * 查询租户状态统计（直连 v2）。
   *
   * @returns 首页租户卡片使用的稳定态统计
   */
  async getStatusStatsV2(): Promise<TenantStatusStats> {
    return handleGatewayError(async () => {
      const res = await TenantAPI.getStatusStatsV2();
      const data: v2GetTenantStatusStatsResponse =
        (res as unknown as { data?: v2GetTenantStatusStatsResponse }).data ?? res;

      return {
        total: data.total ?? 0,
        active: data.active ?? 0,
        disabled: (data.suspended ?? 0) + (data.ownerDisabled ?? 0),
        expired: data.expired ?? 0,
        locked: data.ownerLocked ?? 0,
        activation: data.ownerActivation ?? 0,
      };
    }, "加载租户状态统计失败");
  },

  /**
   * 创建租户。
   * 稳定模型请求->原始模型请求->api->原始模型响应->稳定模型响应
   *
   * @param input 创建表单输入
   * @returns 创建结果
   */
  async createV2(input: TenantCreateFormInput): Promise<TenantCreateResult> {
    return handleGatewayError(async () => {
      const { tenantForm, ownerForm, ownerPassword, activationMethod, selectedProjectIds } = input;
      const platformProjectIds = await ProjectGateway.getPlatformProjectIds(); // 获取全部平台项目

      const stableProjectIds = Array.from(
        new Set([
          ...platformProjectIds,
          ...(selectedProjectIds ?? []).map((id) => String(id).trim()).filter(Boolean),
        ])
      ); // 去重并必选所有平台项目

      // 1. 稳定请求->原始请求
      const wirePayload: v2CreateTenantRequest = {
        name: tenantForm.tenantName,
        description: tenantForm.description ?? "",
        expireAt: mapStable2WireTime(tenantForm.expireTime),
        timezone: normalizeTenantTimezone(tenantForm.timezone),
        locale: normalizeTenantLocale(tenantForm.locale),
        ownerUsername: ownerForm.userName,
        ownerPassword,
        ownerEmail: ownerForm.email,
        ownerPhone: ownerForm.phone,
        projectIds: stableProjectIds.map(mapStable2WireProject),
        activationMethod: mapStable2WireActivationMethod(activationMethod),
        dingtalk: tenantForm.dingtalk ?? "",
        dingtalkSecret: tenantForm.dingtalkSecret ?? "",
      };

      // 2. 调用 API
      const response: v2CreateTenantResponse = await TenantAPI.createV2(wirePayload);

      // 3. 原始响应->稳定响应
      return {
        ...response,
        activationMethod: mapWire2StableActivationMethod(response.activationMethod),
        activationMsg: response.activationMsg as string,
      };
    }, "新增租户失败");
  },

  /**
   * 更新租户。
   * 稳定模型请求->原始模型请求->api->原始模型响应->稳定模型响应
   *
   * @param input 更新参数
   * 说明：
   * - 当前后端更新接口支持 `name` / `description` / `expireAt` / `dingtalk` / `dingtalkSecret`
   * - `icon` / `remark` 已在前端表单模型中保留，但在接口支持前不会透传到此 payload
   * @returns 稳定租户详情
   */
  async updateV2(input: {
    tenantId: string;
    tenantForm: TenantInfoFormModel;
  }): Promise<TenantDetailResult> {
    return handleGatewayError(async () => {
      // 稳定请求->原始请求
      const wirePayload: v2UpdateTenantRequest = {
        id: input.tenantId,
        name: input.tenantForm.tenantName,
        description: input.tenantForm.description,
        expireAt: mapStable2WireTime(input.tenantForm.expireTime),
        timezone: normalizeTenantTimezone(input.tenantForm.timezone),
        locale: normalizeTenantLocale(input.tenantForm.locale),
        dingtalk: input.tenantForm.dingtalk ?? "",
        dingtalkSecret: input.tenantForm.dingtalkSecret ?? "",
      };

      // api调用
      const res = await TenantAPI.updateV2(wirePayload);

      // 原始响应->稳定响应
      const raw = (res as any)?.data || res;
      const data: TenantDetailV2Data = {
        tenant: raw.tenant || raw, // 兼容 res.data.tenant 或 res.tenant
      };

      return mapWireDetailToStableDetail(data);
    }, "更新租户信息失败");
  },

  /**
   * 删除租户。
   *
   * @param id 租户 ID
   * @returns 删除结果
   */
  deleteV2(id: string): Promise<TenantDeleteV2Response> {
    return handleGatewayError(() => TenantAPI.deleteV2(id), "删除租户失败");
  },

  /**
   * 查询租户项目绑定信息（直连 v2）。
   *
   * @param tenantId 租户 ID
   * @returns 项目信息
   */
  async getProjectsV2(tenantId: string): Promise<TenantProjectsV2Data> {
    return handleGatewayError(async () => {
      const res = await TenantAPI.getProjectsV2(tenantId);
      const projectIds = (res.projectIds ?? []).map(mapWire2StableProject);
      const projects = normalizeTenantProjectBindings(res.projects);
      return { ...res, projectIds, projects };
    }, "加载租户项目失败");
  },

  /**
   * 查询租户详情（直连 v2）。
   *
   * @param tenantId 租户 ID
   * @returns 租户详情
   */
  async getDetailV2(tenantId: string): Promise<TenantDetailResult> {
    return handleGatewayError(async () => {
      // 发送请求并获取响应
      const res = await TenantAPI.getDetailV2(tenantId);
      const data: TenantDetailV2Data =
        (res as unknown as { data?: TenantDetailV2Data }).data ?? res;
      // 原始响应->稳定响应
      return mapWireDetailToStableDetail(data);
    }, "加载租户详情失败");
  },

  /**
   * 分配租户项目（直连 v2）。
   *
   * @param data 分配参数
   * @returns 分配结果
   */
  async assignProjectsV2(data: {
    tenantId: string;
    projectIds?: string[];
    projects?: TenantProjectBindingModel[];
  }) {
    return handleGatewayError(async () => {
      const platformProjectIds = await ProjectGateway.getPlatformProjectIds(); // 获取全部平台项目
      const stableProjects = normalizeTenantProjectBindings(data.projects);
      const selectedProjectIdsFromProjects = stableProjects.map((project) => project.projectId);

      const stableProjectIds = Array.from(
        new Set([
          ...platformProjectIds,
          ...selectedProjectIdsFromProjects,
          ...(data.projectIds ?? []).map((id) => String(id).trim()).filter(Boolean),
        ])
      ); // 去重并必选所有平台项目

      return TenantAPI.assignProjectsV2({
        ...data,
        projectIds: stableProjectIds.map(mapStable2WireProject),
        projects: mapStableTenantProjectBindingsToWire(stableProjects),
      });
    }, "更新租户项目失败");
  },
};

export default TenantGateway;
