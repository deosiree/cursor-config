import { initGlobalState } from "qiankun";
import router from "@/router";
import { Storage } from "@/utils/storage";
import { ThemeMode } from "@/enums";
import { defaultSettings } from "@/settings";
import { MENU_LIST_STORAGE_KEY } from "@/constants/storage-keys";

// 定义全局状态接口
export interface GlobalState {
  user?: {
    name: string;
    token: string;
    userId?: string | number;
  };
  theme?: string;
  language?: string;
  stationContext?: {
    stationId?: string;
    stationName?: string;
    stationType?: "pv" | "energy" | "both";
    timestamp?: number;
  } | null;
  notification?: {
    from?: string;
    message?: string;
    data?: any;
    timestamp?: number;
    [key: string]: any;
  } | null;
  menuVisibilityIntent?: {
    from?: string;
    activeMenuId?: string;
    showMenuIds?: string[];
    hiddenMenuIds?: string[];
    timestamp?: number;
  } | null;
  [key: string]: any;
}

export const STATION_CONTEXT_CHANGED_EVENT = "qiankun-station-context-changed";
export const STATION_LIST_CHANGE_REQUESTED_EVENT = "qiankun-station-list-change-requested";

// 初始化全局状态
function normalizeThemeMode(raw: unknown): ThemeMode {
  if (typeof raw !== "string") return defaultSettings.theme as ThemeMode;
  if (raw === ThemeMode.LIGHT || raw === ThemeMode.DARK) {
    return raw;
  }
  return defaultSettings.theme as ThemeMode;
}

function getPersistedGlobalInit() {
  const persistedTheme = normalizeThemeMode(Storage.get<unknown>("theme", defaultSettings.theme));
  const persistedLanguage = Storage.get<string>("language", defaultSettings.language);

  return {
    theme: persistedTheme || defaultSettings.theme,
    // 优先读取本地存储语言，缺失时回退默认配置
    language: persistedLanguage || defaultSettings.language,
  };
}

const initialState: GlobalState = (() => {
  const { theme, language } = getPersistedGlobalInit();

  return {
    theme,
    language,
    // 当前电站上下文（基座切换时下发给所有子应用）
    stationContext: null,
    // 必须在 initGlobalState 时声明 notification，否则 qiankun 会忽略未声明的 key
    notification: null,
    // 子应用上报的菜单显隐意图（由主应用执行 isVisible patch）
    menuVisibilityIntent: null,
  };
})();

// 创建全局状态管理实例
const actions = initGlobalState(initialState);

// qiankun：同一 initGlobalState 返回的 actions 上，多次 onGlobalStateChange 只会保留【最后一个】回调（deps[id] 单槽）
// 1）主应用内不能注册两次
// 2）不能把 actions.onGlobalStateChange 原样传给子应用，否则子应用 mount 时会覆盖主应用的监听
const subAppGlobalCallbacks = new Map<string, (state: GlobalState, prev: GlobalState) => void>();

let currentState: GlobalState = initialState;

function deepClone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function hasChangedByTimestamp<
  T extends {
    timestamp?: number;
  } | null,
>(nextValue: T | undefined, prevValue: T | undefined): nextValue is NonNullable<T> {
  return Boolean(nextValue?.timestamp && nextValue.timestamp !== prevValue?.timestamp);
}

function hasStationContextChanged(state: GlobalState, prev: GlobalState): boolean {
  const nextStationId = String(state?.stationContext?.stationId || "");
  const prevStationId = String(prev?.stationContext?.stationId || "");
  return nextStationId !== prevStationId;
}

function emitStationContextChanged(state: GlobalState, prev: GlobalState) {
  window.dispatchEvent(
    new CustomEvent(STATION_CONTEXT_CHANGED_EVENT, {
      detail: {
        stationContext: state?.stationContext || null,
        prevStationContext: prev?.stationContext || null,
      },
    })
  );
}
/**
 *  监听全局状态变化，处理电站上下文变更、菜单显隐意图变更、以及子应用上报的电站列表变更通知等副作用
 * @param state
 * @param prev
 * @returns
 */
function handleStationContextChange(state: GlobalState, prev: GlobalState) {
  if (!hasStationContextChanged(state, prev)) return;
  console.log("handleStationContextChange==主", state, prev);
  emitStationContextChanged(state, prev);
}
/**
 *  处理菜单显隐意图变化
 * @param state
 * @param prev
 * @returns
 */
function handleMenuVisibilityIntentChange(state: GlobalState, prev: GlobalState) {
  console.log("handleMenuVisibilityIntentChange", state, prev);
  const nextIntent = state.menuVisibilityIntent;
  const prevIntent = prev?.menuVisibilityIntent;
  if (!hasChangedByTimestamp(nextIntent, prevIntent)) return;
  applyMenuVisibilityIntentToMainMenu(nextIntent);
}
/**
 *  处理子应用上报的电站列表变更通知
 * @param state
 * @param prev
 * @returns
 */
function handleStationListChangeNotification(state: GlobalState, prev: GlobalState) {
  const nextNotification = state.notification;
  const prevNotification = prev?.notification;
  if (
    nextNotification?.message !== "microgrid_station_change" ||
    !hasChangedByTimestamp(nextNotification, prevNotification)
  ) {
    return;
  }

  // 无需携带参数，通知 headerMenu 自行重新拉取电站列表
  window.dispatchEvent(new CustomEvent(STATION_LIST_CHANGE_REQUESTED_EVENT));
}

const globalStateSideEffects: Array<(state: GlobalState, prev: GlobalState) => void> = [
  handleStationContextChange,
  handleMenuVisibilityIntentChange,
  handleStationListChangeNotification,
];

/**
 *  运行全局状态副作用函数
 * @param state
 * @param prev
 */
function runGlobalStateSideEffects(state: GlobalState, prev: GlobalState) {
  for (const effect of globalStateSideEffects) {
    effect(state, prev);
  }
}
/**
 *  递归设置菜单树节点的可见状态字段。
 * @param node
 * @param visible
 * @returns
 */
function setSubtreeVisible(node: any, visible: boolean) {
  if (!node) return;
  node.isVisible = visible;
  if (Array.isArray(node.children)) {
    for (const child of node.children) {
      setSubtreeVisible(child, visible);
    }
  }
}
/**
 * 根据菜单显隐意图更新菜单列表。
 * @param menuList 菜单列表
 * @param intent 菜单显隐意图
 * @returns 更新后的菜单列表
 */
function patchMenuEnableByIntent(
  menuList: any[],
  intent: NonNullable<GlobalState["menuVisibilityIntent"]>
): any[] {
  const nextMenu = deepClone(menuList);
  const activeMenuId = String(intent.activeMenuId || "");
  const showMenuIds = new Set(
    Array.isArray(intent.showMenuIds)
      ? intent.showMenuIds.map((id) => String(id)).filter(Boolean)
      : []
  );
  const hiddenMenuIds = new Set(
    Array.isArray(intent.hiddenMenuIds)
      ? intent.hiddenMenuIds.map((id) => String(id)).filter(Boolean)
      : []
  );

  const walk = (nodes: any[]) => {
    for (const node of nodes || []) {
      if (!node) continue;
      const nodeId = String(node.id ?? "");

      // 命中的激活菜单整棵子树显示
      if (activeMenuId && nodeId === activeMenuId) {
        setSubtreeVisible(node, true);
      }
      // 显式要求显示的菜单根节点整棵子树显示
      if (showMenuIds.has(nodeId)) {
        setSubtreeVisible(node, true);
      }

      // 命中的隐藏菜单根节点整棵子树隐藏（支持一次多个，activeMenuId 优先）
      if (hiddenMenuIds.has(nodeId) && nodeId !== activeMenuId) {
        setSubtreeVisible(node, false);
      }

      if (Array.isArray(node.children) && node.children.length > 0) {
        walk(node.children);
      }
    }
  };

  // 当存在 activeMenuId 时，先整体隐藏，再只显示激活菜单对应子树
  if (activeMenuId) {
    for (const root of nextMenu) {
      setSubtreeVisible(root, false);
    }
  }

  walk(nextMenu);
  return nextMenu;
}
/**
 *  根据子应用上报的菜单显隐意图，更新主应用菜单列表的 `isVisible` 字段，并在必要时自动导航到 activeMenuId 对应的路由。
 * @param intent
 * @returns
 */
function applyMenuVisibilityIntentToMainMenu(
  intent: NonNullable<GlobalState["menuVisibilityIntent"]>
) {
  const menuList = Storage.get<any[]>(MENU_LIST_STORAGE_KEY, []);
  if (!Array.isArray(menuList) || menuList.length === 0) return;
  const nextMenuList = patchMenuEnableByIntent(menuList, intent);
  Storage.set(MENU_LIST_STORAGE_KEY, nextMenuList);
  console.log(nextMenuList, "nextMenuList");
  window.dispatchEvent(new CustomEvent("menuListUpdated", { detail: { menuList: nextMenuList } }));

  // 若子应用指定 activeMenuId，则在主应用中自动跳转到对应菜单的 routePath，并保证该菜单处于可见状态
  const activeMenuId = intent.activeMenuId && String(intent.activeMenuId);
  if (!activeMenuId) return;

  const findNodeById = (nodes: any[]): any | null => {
    for (const node of nodes || []) {
      if (!node) continue;
      const nodeId = String(node.id ?? "");
      if (nodeId === activeMenuId) return node;
      if (Array.isArray(node.children) && node.children.length > 0) {
        const found = findNodeById(node.children);
        if (found) return found;
      }
    }
    return null;
  };

  const targetNode = findNodeById(nextMenuList);
  const targetPath = targetNode?.routePath;

  if (targetPath && targetNode?.isVisible === true) {
    router.push(targetPath).catch(() => {
      // 忽略重复导航等错误
    });
  }
}

/**\
 * 注册子应用全局状态变化监听器，
 * 主应用内不可重复注册同一 appName 的监听器
 * ；子应用可通过 setGlobalState 主动触发回调，fireImmediately 参数可控制是否立即以当前状态触发一次回调
 */
export function registerSubAppGlobalListener(
  appName: string,
  callback: (state: GlobalState, prev: GlobalState) => void,
  fireImmediately?: boolean
) {
  subAppGlobalCallbacks.set(appName, callback);
  if (fireImmediately) {
    const snap = JSON.parse(JSON.stringify(currentState)) as GlobalState;
    callback(snap, snap);
  }
  return () => {
    subAppGlobalCallbacks.delete(appName);
  };
}

export function unregisterSubAppGlobalListener(appName: string) {
  subAppGlobalCallbacks.delete(appName);
}

actions.onGlobalStateChange((state, prev) => {
  currentState = state;

  runGlobalStateSideEffects(state, prev);

  subAppGlobalCallbacks.forEach((cb) => {
    try {
      cb(state, prev);
    } catch (e) {
      console.error("[main-app] sub-app global state callback failed:", e);
    }
  });
}, true);

// 设置全局状态
export const setGlobalState = (state: Partial<GlobalState>) => {
  actions.setGlobalState(state);
};

export const getGlobalState = (): GlobalState => {
  return currentState;
};

export default actions;
