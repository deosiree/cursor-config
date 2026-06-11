import { ref } from "vue";
import { ElLoading } from "element-plus";

export function useLoading(delay = 500) {
  const loadingText = ref("加载中……");

  let loadingInstance: ReturnType<typeof ElLoading.service> | null = null;
  let loadingTimer: number | null = null;
  let shown = false;

  const startLoading = (text?: string) => {
    if (loadingTimer || shown) return;

    if (text !== undefined) {
      loadingText.value = text;
    }

    loadingTimer = window.setTimeout(() => {
      loadingTimer = null;
      shown = true;

      loadingInstance = ElLoading.service({
        lock: true,
        text: loadingText.value,
        background: "rgba(0, 0, 0, 0.3)",
      });
    }, delay);
  };

  const stopLoading = () => {
    // 还没显示 直接取消 timer
    if (loadingTimer) {
      clearTimeout(loadingTimer);
      loadingTimer = null;
      return;
    }

    // 已经显示、正常关闭
    if (shown && loadingInstance) {
      loadingInstance.close();
      loadingInstance = null;
      shown = false;
    }
  };

  return {
    startLoading,
    stopLoading,
  };
}
