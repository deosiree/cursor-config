import axios, {
  type AxiosInstance,
  type InternalAxiosRequestConfig,
  type AxiosResponse,
  type AxiosRequestConfig,
} from "axios";
import qs from "qs";
import { useUserStoreHook } from "@/store/modules/user.store";
import { ResultEnum } from "@/enums/api/result.enum";
import { Auth } from "@/utils/auth";
import router from "@/router";
import { useLoadingStore } from "@/store/modules/loading.store";
import { showNotification } from "@/utils/notification";

/**
 * 声明合并，扩展 AxiosRequestConfig
 */
declare module "axios" {
  export interface AxiosRequestConfig {
    silent?: boolean;
  }
}

/**
 * 扩展 InternalAxiosRequestConfig 以支持 silent
 */
export interface HttpRequestConfig<T = any> extends AxiosRequestConfig<T> {
  silent?: boolean;
}
/**
 * 创建 HTTP 请求实例
 */
const httpRequest = axios.create({
  baseURL: import.meta.env.VITE_APP_BASE_API,
  timeout: 50000,
  headers: { "Content-Type": "application/json;charset=utf-8" },
  paramsSerializer: (params) => qs.stringify(params),
});

/**
 * 请求拦截器
 */
httpRequest.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // const accessToken = Auth.getAccessToken();

    // // Authorization 设置为 no-auth，则不携带 token
    // if (config.headers?.Authorization !== "no-auth" && accessToken) {
    //   config.headers.Authorization = `Bearer ${accessToken}`;
    // } else {
    //   delete config.headers.Authorization;
    // }

    // 类型断言为 HttpRequestConfig 以访问 silent
    const httpConfig = config as HttpRequestConfig;
    if (!httpConfig.silent) {
      const loadingStore = useLoadingStore();
      loadingStore.start();
    }

    return config;
  },
  (error) => {
    console.error("Request interceptor error:", error);
    return Promise.reject(error);
  }
);

/**
 * 响应拦截器
 */
httpRequest.interceptors.response.use(
  (response: AxiosResponse<any>) => {
    const config = response.config as HttpRequestConfig;
    const loadingStore = useLoadingStore();

    if (!config.silent) {
      loadingStore.finish();
    }

    // 1. 优先处理二进制流（blob/arraybuffer）
    if (config.responseType === "blob" || config.responseType === "arraybuffer") {
      return response; // 直接返回原始响应
    }

    //  2. 判断 response.data 是否为对象
    const isPlainObject = (val: any): val is Record<string, any> =>
      val !== null && typeof val === "object" && !Array.isArray(val);

    if (!isPlainObject(response.data)) {
      console.log("非 JSON 响应（如 text/html, text/plain）", response.data);
      // 非 JSON 响应（如 text/html, text/plain），视为业务成功但无结构化数据
      return response.data;
    }

    const { code, data, result, message } = response.data;

    // 3. 判断业务状态码
    if (String(code) === String(ResultEnum.SUCCESS)) {
      // 成功：优先返回 data，兼容 result
      return data !== undefined ? data : result;
    }

    // 业务失败
    if (!config.silent) {
      showNotification(message || "Business Error", { type: "error" });
    }

    return Promise.reject({
      type: "business",
      error: new Error(message || "Business Error"),
      response,
    });
  },
  async (error) => {
    const config = error.config as HttpRequestConfig | undefined;
    const loadingStore = useLoadingStore();

    if (config && !axios.isCancel(error) && !config.silent) {
      loadingStore.error();
    }

    const response = error.response;
    console.log("response", response);
    // 网络错误（无响应）
    if (!response) {
      if (config?.silent) {
        return Promise.reject({ type: "network", error, config });
      }
      showNotification("网络连接失败，请检查网络设置", { type: "error" });
      return Promise.reject({ type: "network", error, config });
    }
    // 401 Unauthorized 错误处理
    if (response.status === 401) {
      await redirectToLogin("登录状态已失效，请重新登录");
      return Promise.reject({ type: "auth", error, response });
    }

    // 4. 安全处理错误响应体
    let code: string | undefined;
    let message: string | undefined;

    if (typeof response.data === "object" && response.data !== null) {
      code = String(response.data.code);
      message = response.data.message;
    }
    console.log(code, ResultEnum.ACCESS_TOKEN_INVALID);

    // 其他业务错误
    const errorMsg = message || "请求失败";
    if (config?.silent) {
      return Promise.reject({ type: "silent", message: errorMsg, response });
    }

    showNotification(errorMsg, { type: "error" });
    return Promise.reject({
      type: "business",
      error: new Error(errorMsg),
      response,
    });
  }
);

/**
 * token 刷新相关
 */
let isRefreshingToken = false;
const pendingRequests: (() => void)[] = [];

async function refreshTokenAndRetry(config: HttpRequestConfig): Promise<any> {
  return new Promise((resolve, reject) => {
    const retryRequest = () => {
      const newToken = Auth.getAccessToken();
      if (newToken && config.headers) {
        config.headers.Authorization = `Bearer ${newToken}`;
      }
      httpRequest(config).then(resolve).catch(reject);
    };

    pendingRequests.push(retryRequest);

    if (!isRefreshingToken) {
      isRefreshingToken = true;

      useUserStoreHook()
        .refreshToken()
        .then(() => {
          pendingRequests.forEach((callback) => callback());
          pendingRequests.length = 0;
        })
        .catch(async () => {
          pendingRequests.length = 0;
          await redirectToLogin("登录状态已失效，请重新登录");
          pendingRequests.forEach(() => reject(new Error("Token refresh failed")));
        })
        .finally(() => {
          isRefreshingToken = false;
        });
    }
  });
}

/**
 * 跳转登录页
 */
async function redirectToLogin(message: string = "请重新登录") {
  try {
    showNotification(message, { title: "提示", type: "warning" });
    await useUserStoreHook().resetAllState();
    const currentPath = router.currentRoute.value.fullPath;
    await router.push(`/login?redirect=${encodeURIComponent(currentPath)}`);
  } catch (error) {
    console.error("Redirect to login error:", error);
  }
}

export default httpRequest;
