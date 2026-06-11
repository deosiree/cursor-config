/**
 * 领域 hook 泛化骨架（应用-hook 阶段拷贝并重命名）。
 * 将 Profile / profile / UserGateway.getProfile 替换为目标领域命名与 gateway。
 * 形态选型见 references/page-archetypes.md
 */
import { onBeforeMount, onUnmounted, ref, type Ref } from "vue";
import { useLoading } from "@/layouts/composables/useLoading";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PageDataVO = Record<string, any>;

function initialFromCache(): PageDataVO {
  // 可选：从 session / route / store 读取首屏占位
  return {};
}

export function usePageData() {
  const pageData: Ref<PageDataVO> = ref(initialFromCache());
  const dataLoaded = ref(false);
  const { startLoading, stopLoading } = useLoading(0);

  async function loadPageData(options?: { withLoading?: boolean }) {
    const withLoading = options?.withLoading ?? !dataLoaded.value;

    try {
      if (withLoading) startLoading();
      const id = pageData.value.id;
      if (!id) return;

      // pageData.value = await XxxGateway.getDetail({ id });
      dataLoaded.value = true;
    } finally {
      if (withLoading) stopLoading();
    }
  }

  function refreshPageData() {
    return loadPageData({ withLoading: false });
  }

  startLoading();
  onBeforeMount(() => {
    void loadPageData();
  });
  onUnmounted(() => {
    stopLoading();
  });

  return {
    pageData,
    dataLoaded,
    loadPageData,
    refreshPageData,
  };
}
