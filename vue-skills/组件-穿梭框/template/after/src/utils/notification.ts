import { ElNotification } from "element-plus";
import type { NotificationOptions } from "element-plus";

/**
 * 灏佽 ElNotification 缁勪欢
 * @param message 閫氱煡娑堟伅鍐呭
 * @param option 鍙€夐厤缃」锛屼紶鍏ョ殑璇濅細瑕嗙洊榛樿閰嶇疆
 */
export function showNotification(message: string, option?: Partial<NotificationOptions>) {
  const defaultOptions: Partial<NotificationOptions> = {
    position: "bottom-right",
    duration: 3000,
  };

  const finalOptions: NotificationOptions = {
    ...defaultOptions,
    ...option,
    message, // 纭繚 message 濮嬬粓浣跨敤浼犲叆鐨勫€?  } as NotificationOptions;

  ElNotification(finalOptions);
}

/**
 * 缁熶竴澶勭悊 HTTP 鐘舵€侀敊璇彁绀? * @param error 鎹曡幏鐨勫紓甯稿璞? * @param defaultMsg 榛樿鎻愮ず鏂囨
 */
export const handleStatusError = (error: any, defaultMsg: string = "璇锋眰澶辫触") => {
  const responseData = error?.response?.data;
  const code = responseData?.code;
  const message = responseData?.message ?? defaultMsg;
  const finalMessage = code !== undefined && code !== null ? `[${code}]${message}` : message;

  ElNotification({
    message: finalMessage,
    type: "error",
    position: "bottom-right",
    duration: 3000,
  });
};

/**
 * 缁熶竴澶勭悊 API 閿欒鎻愮ず
 * @param error 鎹曡幏鐨勫紓甯稿璞? * @param defaultMsg 榛樿鎻愮ず鏂囨锛堝綋鏃犳硶鑾峰彇鍚庣娑堟伅鏃舵樉绀猴級
 */
export const handleApiError = (error: any, defaultMsg: string = "鎿嶄綔澶辫触") => {
  if (error.type !== "business") return;
  let message = defaultMsg;
  if (error?.response?.data) {
    const { code, message: backendMessage } = error.response.data;
    if (backendMessage) {
      message = code != null ? `[${code}]${backendMessage}` : backendMessage;
    }
  } else if (error?.data?.message) {
    message = error.data.message;
  } else if (error?.message) {
    message = error.message.includes("Network Error") ? "缃戠粶杩炴帴寮傚父锛岃妫€鏌ョ綉缁? : error.message;
  }
  ElNotification({
    message,
    type: "error",
    position: "bottom-right",
    duration: 3000, // 閿欒淇℃伅鍋滅暀涔呬竴鐐?  });
};

/** 骞跺彂 HTTP 閿欒閫氱煡閿侊紙骞惰鎵规寮€濮嬪墠 newConcurLock 涓€娆★級
 *  鎻愪緵鍙彉鍏变韩鐘舵€侊紙瑙ｅ喅 primitive 涓嶈兘鍥炲啓鐨勯棶棰橈級
 */
export interface ConcurErrLock {
  notified: boolean;
}

/** 鍒涘缓骞跺彂 HTTP 閿欒閫氱煡閿? *  缁熶竴鍒濆鍖栥€佸皯鍐欓敊瀛楁鍚嶃€佸皯浼犲弬
 */
export function newConcurLock(): ConcurErrLock {
  return { notified: false };
}

/**
 * 澶勭悊骞跺彂 HTTP 璇锋眰涓殑鍗曟澶辫触锛坈oncur = concurrent锛夈€? * - 姣忔璋冪敤閮戒細 `console.error(errMsg, error)`锛屼究浜庨€愭潯鎺掓煡
 * - 浠呭 `type === "business"` 璋冪敤 `handleApiError`锛屼笖鍚屼竴鎶婇攣鍙脊涓€娆? * - 鍏堢疆 `lock.notified = true` 鍐嶅脊绐楋紝闄嶄綆骞惰 catch 鍙?toast 姒傜巼
 *
 * @param lock 鐢?newConcurLock 鍒涘缓锛屽悓涓€娆″苟琛屾媺鍙栧叡鐢? * @param error 鎹曡幏鐨勫紓甯? * @param errMsg 鍙€夛紱console 涓?toast 鍏滃簳鏂囨锛岄粯璁ゃ€屾搷浣滃け璐ャ€? */
export function concurApiErr(lock: ConcurErrLock, error: unknown, errMsg = "鎿嶄綔澶辫触"): void {
  console.error(errMsg, error);
  if (lock.notified || (error as { type?: string })?.type !== "business") {
    // 宸查€氱煡鎴栭潪涓氬姟閿欒锛岀洿鎺ヨ繑鍥?    return;
  }
  lock.notified = true; // 缃负宸查€氱煡
  handleApiError(error, errMsg); // 寮圭獥
  return;
}

/**
 * 缃戝叧灞傜粺涓€閿欒鎻愮ず鍖呰鍣ㄣ€? * @param action 瀹為檯璇锋眰鍔ㄤ綔
 * @param defaultMsg 榛樿閿欒鎻愮ず
 */
export async function handleGatewayError<T>(
  action: () => Promise<T>,
  defaultMsg: string = "鎿嶄綔澶辫触"
): Promise<T> {
  try {
    return await action();
  } catch (error) {
    handleApiError(error, defaultMsg);
    throw error;
  }
}
