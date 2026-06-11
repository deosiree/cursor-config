import { onBeforeMount, onUnmounted, ref } from "vue";
import type { UserProfileVO } from "@/types/user";
import UserGateway from "@/gateway/system/user.gateway";
import { Storage } from "@/utils/storage";
import { useLoading } from "@/layouts/composables/useLoading";

/** 从 session userInfo 构造首屏占位（缺 status 等字段，接口返回后覆盖） */
function profileFromSession(): UserProfileVO {
  const cached = Storage.sessionGet<any>("userInfo", {});
  const tenantName = (typeof cached?.tenant?.name === "string" ? cached.tenant.name : "").trim();
  return {
    id: cached?.id ?? cached?.userId,
    userName: cached?.userName ?? cached?.username,
    email: cached?.email,
    phone: cached?.phone,
    mobile: cached?.phone,
    roleName: cached?.roleName ?? cached?.roles?.[0],
    tenantName,
  };
}

/**
 * 个人中心资料：展示始终读 userProfile；真源由网关 load 写入。
 * - 首次 loadProfile：可选全屏 loading（默认仅首次）
 * - 变更后 refreshProfile：静默拉取并覆盖
 */
export function useProfile() {
  const userProfile = ref<UserProfileVO>(profileFromSession());
  const profileLoaded = ref(false);
  const { startLoading, stopLoading } = useLoading(0);

  /**
   * 加载当前用户的个人资料。
   *
   * @param options - 可选配置项
   * @param options.withLoading - 是否显示加载状态。如果未指定，则仅在资料尚未加载时显示 loading。
   */
  async function loadProfile(options?: { withLoading?: boolean }) {
    const withLoading = options?.withLoading ?? !profileLoaded.value;

    try {
      if (withLoading) startLoading();
      const userId = userProfile.value.id;
      if (!userId) return;

      userProfile.value = await UserGateway.getProfile({ id: userId });
      profileLoaded.value = true;
    } finally {
      if (withLoading) stopLoading();
    }
  }

  /** 资料变更后刷新，不重复遮罩 */
  function refreshProfile() {
    return loadProfile({ withLoading: false });
  }

  // 路由进入组件 setup 即开 loading，onBeforeMount 拉数，接口返回后 finally 关闭
  startLoading();
  onBeforeMount(() => {
    void loadProfile();
  });
  onUnmounted(() => {
    stopLoading();
  });

  return {
    userProfile,
    profileLoaded,
    loadProfile,
    refreshProfile,
  };
}
