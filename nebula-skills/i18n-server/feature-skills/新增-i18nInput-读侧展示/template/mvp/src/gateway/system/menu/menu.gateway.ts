import MenuV2API, {
  AddMenuApiV2Request,
  CreateMenuV2Request,
  DeleteMenuApiV2Request,
  ExportMenuTreeV2Request,
  GetMenuTreeV2Request,
  ImportMenuTreeV2Request,
  ListMenusV2Request,
  type MenuTreeNodeV2,
  UpdateMenuApiV2Request,
} from "@/api/seccenter/menu.v2.api";
import {
  mapStable2WireProject,
  mapWire2StableProject,
} from "@/gateway/resource/project/project.map";
import {
  mapStable2WireHttpMethod,
  mapWire2StableHttpMethod,
  MenuTypeByPage,
  MenuTypeByDIRECTORY,
  MenuTypeEnum,
  MenuTypeAll,
} from "@/enums/system/menu.enum";
import type {
  MenuExportResult,
  MenuForm,
  MenuImportResult,
  MenuQuery,
  MenuVO,
  ApiNode,
} from "@/types/menu";
import { handleGatewayError, showNotification } from "@/utils/notification";
import { getAncLocks, readProjectIdFromMenuCache } from "./menu-tree-helpers";
import { buildTimestamp } from "@/utils/format";
import i18n from "@/i18n";
import { resolveI18nJsonText } from "@/utils/i18n";

const t = (key: string, params?: Record<string, unknown>) =>
  params != null ? i18n.global.t(key, params) : i18n.global.t(key);

/**
 * 规范化路由参数。
 * @param value
 * @returns
 */
export function normalizeMenuParams(value: unknown): KVParams[] {
  // 1. 处理字符串情况：尝试解析 JSON
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return [];
    try {
      const parsed = JSON.parse(trimmed);
      return normalizeMenuParams(parsed); // 递归处理解析后的结果
    } catch {
      return [];
    }
  }

  // 2. 处理数组情况
  if (Array.isArray(value)) {
    return value.flatMap((item): KVParams[] => {
      // 排除非对象或空值
      if (typeof item !== "object" || item === null) {
        return [];
      }

      // 提取 key 和 value，并赋予默认值，同时处理类型安全
      const k = (item as Record<string, unknown>).key;
      const v = (item as Record<string, unknown>).value;

      return [
        {
          key: String(k ?? "").trim(),
          value: String(v ?? "").trim(),
        },
      ];
    });
  }

  return [];
}

/**
 * 解析菜单创建/更新所需 projectId。
 */
function resolveProjectId(data: MenuForm): string {
  const explicitProjectId = data.projectId;
  if (explicitProjectId) return explicitProjectId;

  const cacheProjectId = readProjectIdFromMenuCache();
  if (cacheProjectId) return cacheProjectId;

  const message = t("缺少 projectId，无法提交菜单变更");
  showNotification(message, { type: "error" });
  throw new Error(message);
}

/**
 * 将菜单树从原始数据模型映射为前端视图模型（稳定模型）。
 *
 * @param nodes v2 菜单树
 * @returns 前端菜单树
 */
function mapMenuTreeV2ToMenuVO(nodes: MenuTreeNodeV2[] = []): MenuVO[] {
  return (nodes || []).map((node) => ({
    id: String(node.id ?? ""),
    parentId: node.parentId ?? undefined,
    projectId: node.projectId ? mapWire2StableProject(node.projectId) : undefined,
    name: node.name,
    menuName: resolveI18nJsonText(node.name, i18n.global.locale.value), // 菜单名称和i18n语言绑定
    icon: node.icon || "",
    routeName: node.routeName || "",
    routePath: node.routePath || "",
    component: node.component || "",
    perm: node.perm || "",
    redirect: node.redirect || "",
    keepAlive: node.keepAlive ?? 0,
    params: normalizeMenuParams(node.params),
    sort: node.sortOrder ?? 0,
    isVisible: node.isVisible !== false,
    isSystemOnly: Boolean(node.isSystemOnly),
    alwaysShow: 0,
    type: node.type,
    children: mapMenuTreeV2ToMenuVO(node.children || []),
  }));
}

/**
 * 将前端菜单表单转换为 v2 创建/更新请求体。
 *
 * @param data 前端菜单表单
 * @returns v2 菜单请求体
 */
function mapMenuFormToV2Payload(data: MenuForm): CreateMenuV2Request {
  return {
    parentId: data.parentId == null ? null : String(data.parentId),
    projectId: mapStable2WireProject(resolveProjectId(data)),
    name: data.name || "",
    type: data.type as MenuTypeEnum,
    icon: data.icon,
    redirect: data.redirect,
    component: data.component,
    routeName: data.routeName || "",
    routePath: data.routePath,
    perm: data.perm,
    params: JSON.stringify(data.params || []),
    sortOrder: data.sort,
    isVisible: data.isVisible !== false,
    isSystemOnly: Boolean(data.isSystemOnly),
  };
}

/**
 * 删根前快照：list(menuId) 拉取直接子节点森林；无嵌套 children 时再 list 兜底。
 */
async function loadChildForest(parentId: string): Promise<MenuVO[]> {
  const data = await MenuV2API.list({ menuId: String(parentId) });
  const roots = mapMenuTreeV2ToMenuVO(data?.menus || []);
  const forest: MenuVO[] = [];

  for (const root of roots) {
    const childId = root.id ? String(root.id) : "";
    if (!childId) continue;

    const children = Array.isArray(root.children) ? root.children : [];
    if (children.length > 0) {
      forest.push(root);
    } else {
      const nested = await loadChildForest(childId);
      forest.push({ ...root, children: nested });
    }
  }

  return forest;
}

/** detail 查不到菜单时视为已被后端删掉（含级联删除）。 */
async function isMenuGone(id: string): Promise<boolean> {
  const data = await MenuV2API.detail({ id: String(id) });
  return !data?.menu?.id;
}

/**
 * 尝试删除快照中的单个节点；失败且 detail 显示已不存在则跳过整棵子树。
 */
async function tryDeleteMenuSubtree(node: MenuVO): Promise<void> {
  const id = node.id ? String(node.id) : "";
  if (!id) return;

  try {
    await MenuV2API.delete({ id });
    const children = Array.isArray(node.children) ? node.children : [];
    if (children.length > 0) {
      await deleteSiblingForest(children);
    }
  } catch (error) {
    if (await isMenuGone(id)) {
      return;
    }
    throw error;
  }
}

/** 按兄弟序清理快照子森林（不依赖后端 delete 文案）。 */
async function deleteSiblingForest(nodes: MenuVO[]): Promise<void> {
  for (const node of nodes) {
    await tryDeleteMenuSubtree(node);
  }
}

/**
 * 菜单网关。
 */
const MenuGateway = {
  /**
   * 获得指定页面详情（租户级隔离）
   *
   * @param id 当前点击的菜单节点 ID
   * @returns 权限页右侧功能项面板稳定模型
   */
  async getPageDetail(id: string): Promise<any> {
    return handleGatewayError(async () => {
      const data = await MenuV2API.detail({
        id: String(id),
        includeApis: true,
      });
      return data;
    }, t("加载菜单数据失败"));
  },

  /**
   * 获得指定页面的功能项列表（租户级隔离）
   *
   * @param id 当前点击的菜单节点 ID
   * @returns 权限页右侧功能项稳定模型列表
   */
  async getPageFunc(id: string): Promise<MenuVO[]> {
    return handleGatewayError(async () => {
      const data = await MenuV2API.tree({
        menuId: String(id),
        includeApis: true,
      });
      return mapMenuTreeV2ToMenuVO(data?.tree || []);
    }, t("加载功能项权限数据失败"));
  },

  /**
   * 获取角色权限分配用的菜单子树（租户级隔离）。
   * 不传 menuId 时返回本租户完整树（含功能项）；传 menuId 时返回该节点后代子树。
   *
   * @param menuId 子树根菜单 ID（可选）
   * @returns 菜单树稳定模型
   */
  async getPermissionSubtree(menuId?: string): Promise<MenuVO[]> {
    return handleGatewayError(async () => {
      const payload: GetMenuTreeV2Request = {
        types: MenuTypeAll,
        includeApis: false,
        ...(menuId && { menuId: String(menuId) }),
      };
      const data = await MenuV2API.tree(payload);
      return mapMenuTreeV2ToMenuVO(data?.tree || []);
    }, t("加载权限子树失败"));
  },

  /**
   * 获得租户级隔离的菜单树列表，粒度至页面。
   * @returns
   */
  async getTreeByPage(): Promise<MenuVO[]> {
    return handleGatewayError(async () => {
      const data = await MenuV2API.tree({ types: MenuTypeByPage });
      return mapMenuTreeV2ToMenuVO(data?.tree || []);
    }, t("加载菜单数据失败"));
  },

  /**
   * 获取租户级隔离的菜单树列表。
   *
   * @param queryParams 查询参数
   * @returns 菜单树
   */
  async getTree(queryParams?: MenuQuery): Promise<MenuVO[]> {
    return handleGatewayError(async () => {
      const { projectId, roleId, includeApis, types } = queryParams ?? {};
      const payload: GetMenuTreeV2Request = {
        ...(types && { types }),
        ...(projectId && { projectId: mapStable2WireProject(String(projectId)) }),
        ...(roleId && { roleId: String(roleId) }),
        ...(includeApis !== undefined && { includeApis: Boolean(includeApis) }),
      };
      const data = await MenuV2API.tree(payload);
      return mapMenuTreeV2ToMenuVO(data?.tree || []);
    }, t("加载菜单数据失败"));
  },

  /**
   * 获得指定功能项的apis（全局，仅平台租户可用）
   *
   * @param id 当前点击的菜单节点 ID
   * @returns 权限页右侧功能项稳定模型列表
   */
  async getFuncApis(id: string): Promise<ApiNode[]> {
    return handleGatewayError(async () => {
      const data = await MenuV2API.detail({
        id: String(id),
        includeApis: true,
      });
      return (data.menu?.apis ?? []).map((api) => ({
        ...api,
        apiMethod: mapWire2StableHttpMethod(api.apiMethod),
      }));
    }, t("加载API配置失败"));
  },

  /**
   * 新增指定功能项的 api 关联
   *
   * @param data api 配置
   * @returns 新增结果
   */
  async addFuncApi(data: AddMenuApiV2Request) {
    return handleGatewayError(
      () =>
        MenuV2API.addApi({
          ...data,
          menuId: String(data.menuId),
          ...(data.apiMethod !== undefined && {
            apiMethod: mapStable2WireHttpMethod(data.apiMethod),
          }),
        }),
      t("新增失败")
    );
  },

  /**
   * 更新指定功能项的 api 关联
   *
   * @param data api 配置
   * @returns 更新结果
   */
  async updateFuncApi(data: UpdateMenuApiV2Request) {
    return handleGatewayError(
      () =>
        MenuV2API.updateApi({
          ...data,
          id: String(data.id),
          ...(data.apiMethod !== undefined && {
            apiMethod: mapStable2WireHttpMethod(data.apiMethod),
          }),
        }),
      t("修改失败")
    );
  },

  /**
   * 删除指定功能项的 api 关联
   *
   * @param id api 记录 ID
   * @returns 删除结果
   */
  async deleteFuncApi(id: string) {
    return handleGatewayError(() => {
      const payload: DeleteMenuApiV2Request = {
        id: String(id),
      };
      return MenuV2API.deleteApi(payload);
    }, t("删除失败"));
  },

  /**
   * 获得指定页面的功能项列表（全局，仅平台租户可用）
   *
   * @param id 当前点击的菜单节点 ID
   * @returns 权限页右侧功能项稳定模型列表
   */
  async getPageFuncByList(id: string): Promise<MenuVO[]> {
    return handleGatewayError(async () => {
      const data = await MenuV2API.list({
        menuId: String(id),
        includeApis: true,
      });

      return mapMenuTreeV2ToMenuVO(data?.menus || []);
    }, t("加载权限数据失败"));
  },

  /**
   * 获得项目级的菜单树列表，粒度至页面。（全局，仅平台租户可用）
   * @returns
   */
  async getPageByProjectPage(id: string): Promise<MenuVO[]> {
    return handleGatewayError(async () => {
      const data = await MenuV2API.list({
        types: MenuTypeByPage,
        projectId: mapStable2WireProject(String(id)),
      });
      return mapMenuTreeV2ToMenuVO(data?.menus || []);
    }, t("加载菜单数据失败"));
  },

  /**
   * 获得项目级的菜单树列表，粒度至目录。（全局，仅平台租户可用）
   * @returns
   */
  async getPageByProjectDir(id: string): Promise<MenuVO[]> {
    return handleGatewayError(async () => {
      const data = await MenuV2API.list({
        types: MenuTypeByDIRECTORY,
        projectId: mapStable2WireProject(String(id)),
      });
      return mapMenuTreeV2ToMenuVO(data?.menus || []);
    }, t("加载菜单数据失败"));
  },

  /**
   * 获得全部菜单树列表，粒度至页面。（全局，仅平台租户可用）
   * @returns
   */
  async getListByPage(): Promise<MenuVO[]> {
    return handleGatewayError(async () => {
      const data = await MenuV2API.list({ types: MenuTypeByPage });
      return mapMenuTreeV2ToMenuVO(data?.menus || []);
    }, t("加载菜单数据失败"));
  },

  /**
   * 获取全部菜单树列表。（全局，仅平台租户可用）
   *
   * @param queryParams 查询参数
   * @returns 菜单树
   */
  async getList(queryParams?: MenuQuery): Promise<MenuVO[]> {
    return handleGatewayError(async () => {
      const { projectId, includeApis, types } = queryParams ?? {};
      const payload: ListMenusV2Request = {
        ...(types && { types }),
        ...(projectId && { projectId: mapStable2WireProject(String(projectId)) }),
        ...(includeApis !== undefined && { includeApis: Boolean(includeApis) }),
      };
      const data = await MenuV2API.list(payload);
      return mapMenuTreeV2ToMenuVO(data?.menus || []);
    }, t("加载菜单数据失败"));
  },

  /**
   * 获取菜单路由树（兼容旧接口返回 { result } 结构）。（全局，仅平台租户可用，用于菜单管理的路由-组件）
   *
   * @param queryParams 查询参数
   * @returns 兼容旧结构
   */
  async getRoutes(queryParams: MenuQuery): Promise<{ result: MenuVO[] }> {
    const list = await this.getList(queryParams);
    return { result: list };
  },

  /**
   * 获取当前菜单节点的祖先链锁定信息。
   *
   * 用途：
   * - 菜单编辑弹窗打开时，判断“显示状态”“仅平台显示”是否需要灰禁。
   * - 业务层无需自行遍历菜单树，只消费锁定结果即可。
   *
   * @param menus 当前菜单树。
   * @param parentId 当前菜单节点的父菜单 ID。
   * @returns 祖先链锁定结果。
   */
  getAncLocks(menus: MenuVO[], parentId: string | number | null | undefined) {
    return getAncLocks(menus, parentId);
  },

  /**
   * 创建菜单。
   *
   * @param data 菜单表单
   * @returns 创建结果
   */
  async create(data: MenuForm) {
    return handleGatewayError(() => {
      const payload = mapMenuFormToV2Payload(data);
      return MenuV2API.create(payload);
    }, t("新增失败"));
  },

  /**
   * 更新菜单。
   *
   * @param data 菜单表单
   * @returns 更新结果
   */
  async update(data: MenuForm & { id?: string }) {
    return handleGatewayError(() => {
      const payload = mapMenuFormToV2Payload(data);
      return MenuV2API.update({
        ...payload,
        id: String(data.id || ""),
      });
    }, t("修改失败"));
  },

  /**
   * 删除菜单（含全部后代：删前 list 快照 → 先删根 → 按兄弟序清子树；
   * 子节点 delete 失败且 detail 已无记录则跳过该子树）。
   *
   * @param id 菜单 ID
   * @returns 删除结果
   */
  async deleteById(id: string) {
    return handleGatewayError(async () => {
      const rootId = String(id); // 根菜单ID
      const childForest = await loadChildForest(rootId); // 子菜单树
      await MenuV2API.delete({ id: rootId }); // 删除根菜单
      await deleteSiblingForest(childForest); // 删除子菜单树
    }, t("删除失败"));
  },

  /**
   * 导出全部菜单树 YAML。
   *
   * @param queryParams 查询参数
   * @returns 稳定导出结果
   */
  async exportMenuTreeAll(
    queryParams: Pick<MenuQuery, "projectId" | "includeApis">
  ): Promise<MenuExportResult> {
    return handleGatewayError(async () => {
      const payload: ExportMenuTreeV2Request = {
        ...(queryParams.projectId && {
          projectId: mapStable2WireProject(String(queryParams.projectId)),
        }),
        includeApis: queryParams.includeApis !== false,
      };
      const data = await MenuV2API.exportTree(payload);
      const yamlText = String(data?.data || "");
      const mimeType = "application/x-yaml;charset=utf-8";
      return {
        content: new Blob([yamlText], { type: mimeType }),
        fileName: `${t("菜单树")}_${buildTimestamp()}.yaml`,
        mimeType,
        successMessage: t("导出成功"),
      };
    }, t("导出失败"));
  },

  /**
   * 导入全部菜单树 YAML。
   *
   * 供 gateway 内部复用的基础导入实现，业务层请优先使用
   * `importMenuTreePreview` / `importMenuTreeReal`。
   *
   * @param payload 导入内容
   * @returns 稳定导入结果
   */
  async importMenuTreeAll(payload: ImportMenuTreeV2Request): Promise<MenuImportResult> {
    return handleGatewayError(async () => {
      const data = await MenuV2API.importTree({
        data: payload.data,
        dryRun: Boolean(payload.dryRun),
      });
      const createdCount = Number(data?.createdCount ?? 0);
      const updatedCount = Number(data?.updatedCount ?? 0);
      const skippedCount = Number(data?.skippedCount ?? 0);
      const warningMessage = Array.isArray(data?.warnings)
        ? data.warnings
            .filter((item): item is string => typeof item === "string")
            .map((item) => item.trim())
            .filter(Boolean)
            .join("\n")
        : "";
      return {
        createdCount,
        updatedCount,
        skippedCount,
        successMessage: t(
          "导入成功：新增 {createdCount}，更新 {updatedCount}，跳过 {skippedCount}",
          {
            createdCount,
            updatedCount,
            skippedCount,
          }
        ),
        warningMessage,
      };
    }, t("导入失败"));
  },

  /**
   * 预览导入全部菜单树 YAML。
   *
   * @param data YAML 文本
   * @returns 稳定导入结果
   */
  async importMenuTreeAllPreview(data: string): Promise<MenuImportResult> {
    return this.importMenuTreeAll({ data, dryRun: true });
  },

  /**
   * 正式导入全部菜单树 YAML。
   *
   * @param data YAML 文本
   * @returns 稳定导入结果
   */
  async importMenuTreeAllReal(data: string): Promise<MenuImportResult> {
    return this.importMenuTreeAll({ data, dryRun: false });
  },

  /**
   * 导出菜单树 YAML。
   *
   * @param queryParams 查询参数
   * @returns 稳定导出结果
   */
  async exportMenuTree(
    queryParams: Pick<MenuQuery, "projectId" | "includeApis">
  ): Promise<MenuExportResult> {
    return handleGatewayError(async () => {
      if (!queryParams.projectId) {
        throw new Error(t("请先选择项目"));
      }
      const data = await MenuV2API.exportProjectTree({
        projectId: mapStable2WireProject(String(queryParams.projectId)),
        includeApis: queryParams.includeApis !== false,
      });
      const yamlText = String(data?.data || "");
      const mimeType = "application/x-yaml;charset=utf-8";
      return {
        content: new Blob([yamlText], { type: mimeType }),
        fileName: `${t("菜单树")}_${buildTimestamp()}.yaml`,
        mimeType,
        successMessage: t("导出成功"),
      };
    }, t("导出失败"));
  },

  /**
   * 导入菜单树 YAML。
   *
   * 供 gateway 内部复用的基础导入实现，业务层请优先使用
   * `importMenuTreePreview` / `importMenuTreeReal`。
   *
   * @param payload 导入内容与目标项目 ID
   * @returns 稳定导入结果
   */
  async importMenuTree(
    payload: ImportMenuTreeV2Request & { projectId: string }
  ): Promise<MenuImportResult> {
    return handleGatewayError(async () => {
      if (!payload.projectId) {
        throw new Error(t("请先选择项目"));
      }
      const data = await MenuV2API.importProjectTree({
        projectId: mapStable2WireProject(String(payload.projectId)),
        data: payload.data,
        dryRun: Boolean(payload.dryRun),
      });
      const deletedCount = Number(data?.deletedCount ?? 0);
      const createdCount = Number(data?.createdCount ?? 0);
      const warningMessage = Array.isArray(data?.warnings)
        ? data.warnings
            .filter((item): item is string => typeof item === "string")
            .map((item) => item.trim())
            .filter(Boolean)
            .join("\n")
        : "";
      return {
        createdCount,
        updatedCount: 0,
        skippedCount: 0,
        successMessage: t("导入成功：删除 {deletedCount}，新增 {createdCount}", {
          deletedCount,
          createdCount,
        }),
        warningMessage,
      };
    }, t("导入失败"));
  },

  /**
   * 预览导入菜单树 YAML。
   *
   * @param data YAML 文本
   * @param projectId 目标项目 ID
   * @returns 稳定导入结果
   */
  async importMenuTreePreview(data: string, projectId: string): Promise<MenuImportResult> {
    return this.importMenuTree({ data, projectId, dryRun: true });
  },

  /**
   * 正式导入菜单树 YAML。
   *
   * @param data YAML 文本
   * @param projectId 目标项目 ID
   * @returns 稳定导入结果
   */
  async importMenuTreeReal(data: string, projectId: string): Promise<MenuImportResult> {
    return this.importMenuTree({ data, projectId, dryRun: false });
  },
};

export default MenuGateway;
