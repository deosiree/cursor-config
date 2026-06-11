import { ref } from "vue";

import { MENU_NAVBAR_SYNC_STATUS_KEY } from "@/constants/storage-keys";
import { Storage as AppStorage } from "@/utils/storage";
import { MENU_LIST_STORAGE_KEY } from "@/utils/menu-cache";

type MenuSource = "cache" | "remote";
type MenuDiagnostic =
  | "cache_missing"
  | "cache_empty"
  | "cache_parse_failed"
  | "remote_fallback_used";

export interface MenuReadResult<T = any[]> {
  menus: T;
  source: MenuSource;
  diagnostics: MenuDiagnostic[];
  version: string;
}

interface ReadMenuTreeOptions<T = any[]> {
  remoteLoader?: () => Promise<T>;
}

const menuVersionRef = ref("0");
const menuTickRef = ref(0);

/**
 * 生成稳定 JSON 文本，避免 `null/undefined` 导致版本计算不一致。
 */
function stableJson(input: unknown): string {
  return JSON.stringify(input ?? []);
}

/**
 * 轻量字符串哈希，用于菜单版本号计算。
 */
function hashText(input: string): string {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return `${hash}`;
}

function computeVersion(menus: unknown): string {
  return hashText(stableJson(menus));
}

/**
 * 递增菜单变更计数，供 UI 侧监听。
 */
function bumpTick() {
  menuTickRef.value += 1;
}

/**
 * 判断菜单缓存键是否存在（存在即使为空数组也视为有效缓存）。
 */
function hasMenuCacheKey(): boolean {
  return localStorage.getItem(MENU_LIST_STORAGE_KEY) !== null;
}

/**
 * 从本地缓存读取菜单树。
 *
 * 规则：
 * - key 缺失：返回 `cache_missing`
 * - key 存在且解析成功：直接返回缓存（空数组也有效）
 * - 解析失败：返回 `cache_parse_failed`
 */
export function readMenuCache<T = any[]>(): MenuReadResult<T> {
  if (!hasMenuCacheKey()) {
    return {
      menus: [] as T,
      source: "cache",
      diagnostics: ["cache_missing"],
      version: menuVersionRef.value,
    };
  }

  try {
    const raw = localStorage.getItem(MENU_LIST_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    // 缓存结构异常时，降级为空数组，避免上层崩溃。
    const menus = (Array.isArray(parsed) ? parsed : []) as T;
    const diagnostics: MenuDiagnostic[] = [];
    if (Array.isArray(menus) && menus.length === 0) diagnostics.push("cache_empty");
    const version = computeVersion(menus);
    menuVersionRef.value = version;
    return {
      menus,
      source: "cache",
      diagnostics,
      version,
    };
  } catch {
    return {
      menus: [] as T,
      source: "cache",
      diagnostics: ["cache_parse_failed"],
      version: menuVersionRef.value,
    };
  }
}

/**
 * 统一菜单读取入口：先缓存，缺失/解析失败时才回退远端。
 *
 * 注意：空数组缓存属于有效结果，不触发远端回退。
 */
export async function readMenuTree<T = any[]>(
  options: ReadMenuTreeOptions<T> = {}
): Promise<MenuReadResult<T>> {
  const cacheResult = readMenuCache<T>();
  const missing = cacheResult.diagnostics.includes("cache_missing");
  const parseFailed = cacheResult.diagnostics.includes("cache_parse_failed");
  if (!missing && !parseFailed) return cacheResult;

  if (!options.remoteLoader) return cacheResult;
  // 仅在缓存不可用时执行远端兜底。
  const remoteMenus = await options.remoteLoader();
  const normalized = writeMenuCache(remoteMenus);
  return {
    menus: normalized as T,
    source: "remote",
    diagnostics: [
      ...cacheResult.diagnostics,
      "remote_fallback_used",
      ...(Array.isArray(normalized) && normalized.length === 0 ? ["cache_empty" as const] : []),
    ],
    version: menuVersionRef.value,
  };
}

/**
 * 写入菜单缓存（唯一写入口），并同步版本/tick。
 */
export function writeMenuCache<T = any[]>(nodes: T): T {
  const normalized = (Array.isArray(nodes) ? nodes : []) as T;
  localStorage.setItem(MENU_LIST_STORAGE_KEY, JSON.stringify(normalized));
  menuVersionRef.value = computeVersion(normalized);
  bumpTick();
  return normalized as T;
}

/**
 * 清空菜单缓存并重置版本信号。
 */
export function clearMenuCache() {
  // 菜单树：raw JSON 字符串，与 menu-cache 一致
  localStorage.removeItem(MENU_LIST_STORAGE_KEY);
  // 导航栏同步状态：AppStorage KV 封装
  AppStorage.remove(MENU_NAVBAR_SYNC_STATUS_KEY);
  menuVersionRef.value = "0";
  bumpTick();
}

/**
 * 获取当前菜单版本。
 */
export function getMenuVersion(): string {
  return menuVersionRef.value;
}

/**
 * 暴露菜单变更计数（Ref），用于 UI 监听刷新。
 */
export function useMenuTick() {
  return menuTickRef;
}

export type { MenuDiagnostic, MenuSource };
