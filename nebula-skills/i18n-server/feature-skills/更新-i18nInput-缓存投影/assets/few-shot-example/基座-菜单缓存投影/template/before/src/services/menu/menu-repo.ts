import { MENU_NAVBAR_SYNC_STATUS_KEY } from "@/constants/storage-keys";
import { Storage } from "@/utils/storage";
import { removeRawLocalStorageItem, setRawLocalStorageItem } from "@/utils/raw-storage";
import { ref, readonly } from "vue";
import type { StableMenuNode } from "@/types/menu";
import { mapWire2StableMenuNode } from "@/gateway/menu/menu.gateway";

export const MENU_LIST_STORAGE_KEY = "subAppMenuList";
export const MENU_VERSION_STORAGE_KEY = "subAppMenuList:version";
export const MENU_LIST_UPDATED_EVENT = "menuListUpdated";

const menuVersionRef = ref("0");

/**
 * 序列化为稳定文本，确保版本计算输入一致。
 */
function toStableText(input: unknown): string {
  return JSON.stringify(input ?? []);
}

/**
 * 轻量哈希，用于生成菜单版本号。
 */
function hashText(input: string): string {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return `${hash}`;
}

/**
 * 计算菜单版本的函数
 * @param menus - 未知类型的菜单数据
 * @returns 返回一个字符串，表示菜单数据的哈希值
 */
function computeVersion(menus: unknown): string {
  // 将菜单数据转换为稳定的文本格式，然后计算其哈希值
  return hashText(toStableText(menus));
}

/**
 * 派发菜单缓存更新事件，驱动页面层按需刷新。
 */
function dispatchMenuUpdated(menus: unknown) {
  if (typeof window === "undefined" || typeof window.dispatchEvent !== "function") {
    return;
  }
  console.log("menus", menus);
  window.dispatchEvent(
    new CustomEvent(MENU_LIST_UPDATED_EVENT, {
      detail: { menus, version: menuVersionRef.value },
    })
  ); // 派发菜单更新事件
}

/**
 * 提供菜单版本的响应式只读引用，供界面层稳定订阅刷新。
 */
export function useMenuVersionSignal() {
  return readonly(menuVersionRef);
}

/**
 * 从缓存中读取菜单数据
 */
export function readMenuCache(): { menus: StableMenuNode[]; version: string } {
  const local = (globalThis as any).localStorage; // 获取本地存储对象
  try {
    const raw = local.getItem(MENU_LIST_STORAGE_KEY); // 从本地存储中获取菜单数据
    const parsed = raw ? JSON.parse(raw) : []; // 将菜单数据解析为对象数组
    const menus = Array.isArray(parsed) ? parsed.map((item) => mapWire2StableMenuNode(item)) : []; // 统一通过网关映射为稳定模型
    const version = computeVersion(menus); // 计算菜单数据的版本号
    menuVersionRef.value = version; // 更新菜单版本号
    return { menus, version };
  } catch {
    return { menus: [], version: menuVersionRef.value };
  }
}

/**
 * 写入菜单缓存（唯一写入口）并更新版本/刷新事件。
 * @param menus - 菜单数据
 */
export function writeMenuCache(menus: StableMenuNode[]): StableMenuNode[] {
  const stableMenus = Array.isArray(menus) ? menus : []; // 确保传入的菜单数据是数组类型
  const nextVersion = computeVersion(stableMenus); // 计算下一个版本号
  Storage.set(MENU_LIST_STORAGE_KEY, stableMenus); // 将菜单数据存储到缓存中
  setRawLocalStorageItem(MENU_VERSION_STORAGE_KEY, nextVersion); // 将下一个版本号存储到本地存储中
  menuVersionRef.value = nextVersion; // 更新菜单版本号
  dispatchMenuUpdated(stableMenus); // 派发菜单更新事件
  return stableMenus;
}

/**
 * 清空菜单缓存并重置版本信号。
 */
export function clearMenuCache() {
  Storage.remove(MENU_LIST_STORAGE_KEY); // 清空菜单缓存
  Storage.remove(MENU_NAVBAR_SYNC_STATUS_KEY); // 清空菜单管理的同步状态
  removeRawLocalStorageItem(MENU_VERSION_STORAGE_KEY); // 清空菜单版本号
  menuVersionRef.value = "0"; // 重置菜单版本号
  dispatchMenuUpdated([]); // 派发菜单更新事件
}

/**
 * 获取当前菜单版本号。
 */
export function getMenuVersion(): string {
  return menuVersionRef.value;
}
