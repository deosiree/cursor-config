import { qiankunWindow } from "vite-plugin-qiankun/dist/helper";
import type { QiankunProps } from "vite-plugin-qiankun/dist/helper";
import { APP_NAME } from "./config"; // 导入统一配置的子应用名称
import { getCurrentLanguage, setCurrentLanguage } from "@/i18n";

// 全局状态类型定义
export interface GlobalState {
  user?: { name: string; token: string };
  theme?: string;
  // 主应用当前激活的微应用名称
  activeApp?: string;
  // 多语言：主应用当前语言（例如 'zh-cn' | 'en'）
  language?: string;
  [key: string]: any;
}

let qiankunProps: QiankunProps | null = null;

export function setQiankunProps(props: QiankunProps) {
  qiankunProps = props;
}

// 处理主应用状态变化
export function handleGlobalStateChange(state: GlobalState, prev: GlobalState) {
  console.log(`[${APP_NAME}] 全局状态变化:`, state, prev); // 使用动态名称

  // 同步语言：当主应用语言变化时，更新子应用的语言和 ElementPlus 语言包
  if (state.language && state.language !== getCurrentLanguage()) {
    setCurrentLanguage(state.language);
  }
}

// 向主应用发送消息
export function setGlobalState(state: Partial<GlobalState>) {
  if (qiankunWindow.__POWERED_BY_QIANKUN__ && qiankunProps?.setGlobalState) {
    qiankunProps.setGlobalState(state);
    console.log(`[${APP_NAME}] 向主应用发送消息:`, state); // 使用动态名称
  } else {
    console.warn(`[${APP_NAME}] 不在 qiankun 环境中`); // 使用动态名称
  }
}

// 向主应用发送通知
export function notifyMainApp(message: string, data?: any) {
  setGlobalState({
    notification: {
      from: APP_NAME, // 使用动态名称
      message,
      data,
      timestamp: Date.now(),
    },
  });
}
