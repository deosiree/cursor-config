import { computed, onBeforeMount, onUnmounted, reactive, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import ConfigGateway from "@/gateway/system/config.gateway";
import { checkHasPerm } from "@/directive/permission";
import { useDirtyState } from "@/composables/useDirtyState";
import { useLoading } from "@/layouts/composables/useLoading";
import { showNotification } from "@/utils/notification";
import { splitDurationSeconds } from "@/utils/format";
import type {
  SecurityConfigSnapshot,
  SecurityConfigStable,
  SecurityConfigPageState,
  SessionConfigStable,
  SecurityTabKey,
} from "@/types/security-config";

// ---表单数据默认值工厂（兜底的默认值，确保表单有初始值；读取detail后会反显配置的）

/**
 * 创建默认安全配置
 * @returns 默认安全配置
 */
function createDefaultSecurityConfig(): SecurityConfigStable {
  return {
    encryptPasswordInTransit: false,
    maxLoginAttempts: 5,
    lockoutDurationSeconds: 1800,
    passwordMinLength: 8,
    passwordRequireUppercase: false,
    passwordRequireLowercase: false,
    passwordRequireDigit: false,
    passwordRequireSpecial: false,
    captchaEnabled: true,
    captchaTriggerMode: "on_failure",
    captchaTriggerThreshold: 3,
    captchaExpireSeconds: 300,
    mfaEnabled: false,
    mfaMethod: "MFA_METHOD_NONE",
    mfaCodeLength: 6,
    mfaCodeExpireSeconds: 300,
    mfaMaxAttempts: 5,
    activationMethod: "password",
  };
}

/**
 * 创建默认会话配置
 * @returns 默认会话配置
 */
function createDefaultSessionConfig(): SessionConfigStable {
  return {
    cookieMaxAge: splitDurationSeconds(86400),
    sessionTtl: splitDurationSeconds(3600),
    maxConcurrent: 0,
  };
}

// ----快照工厂

/**
 * 克隆安全配置
 * 作用：生成一个不会被后续修改联动污染的快照对象
 * - 对扁平对象，浅拷贝足够
 * @param config 安全配置
 * @returns 克隆后的安全配置
 */
function cloneSecurityConfig(config: SecurityConfigStable): SecurityConfigStable {
  return { ...config };
}

/**
 * 克隆会话配置
 * 作用：生成一个不会被后续修改联动污染的快照对象
 * - 对扁平对象，浅拷贝足够
 * - 对嵌套对象，补一层深拷贝以避免引用污染
 * @param config 会话配置
 * @returns 克隆后的会话配置
 */
function cloneSessionConfig(config: SessionConfigStable): SessionConfigStable {
  return {
    ...config,
    cookieMaxAge: { ...config.cookieMaxAge },
    sessionTtl: { ...config.sessionTtl },
  };
}

/**
 * 创建快照
 * @param config 安全配置
 * @param sessionConfig 会话配置
 * @returns 快照对象
 */
function createSnapshot(
  securityConfig: SecurityConfigStable,
  sessionConfig: SessionConfigStable
): SecurityConfigSnapshot {
  const { id: _configId, ...configSnapshot } = cloneSecurityConfig(securityConfig); // 克隆安全配置
  const { id: _sessionId, ...sessionSnapshot } = cloneSessionConfig(sessionConfig); // 克隆会话配置
  return {
    securityConfig: configSnapshot,
    sessionConfig: sessionSnapshot,
  };
}

// -----Tab 可见性与激活态

const SECURITY_TAB_ORDER: SecurityTabKey[] = ["login", "password", "session"];

/**
 * 当前激活 Tab 不在可见集合时，回落到首个可见 Tab
 */
function syncActiveTabToVisible(
  activeTab: { value: SecurityTabKey },
  canSecurity: boolean,
  canSession: boolean
) {
  const visible = SECURITY_TAB_ORDER.filter((key) =>
    key === "session" ? canSession : canSecurity
  );
  if (!visible.length) return;
  if (!visible.includes(activeTab.value)) {
    activeTab.value = visible[0];
  }
}

// -----状态管理工厂

/**
 * 配置应用页面状态
 * @param target 目标状态
 * @param source 源状态
 */
function applyPageState(
  target: SecurityConfigPageState,
  source: SecurityConfigPageState | SecurityConfigSnapshot
) {
  Object.assign(target.securityConfig, cloneSecurityConfig(source.securityConfig));
  Object.assign(target.sessionConfig, cloneSessionConfig(source.sessionConfig));
}

/**
 * 统一管理 安全配置页面的状态
 * - baseline 保存“最近一次加载成功/保存成功后”的快照。会被isDirty和markPristine使用：
 *    - isDirty 不是独立状态，而是“当前值 vs baseline”的比较结果；
 *    - markPristine 则是在 reload/save 后显式更新 baseline，用来告诉 useDirtyState：从这一刻起页面重新回到“干净状态”。
 * @returns
 */
export function useSecurityConfigPage() {
  const canEditSecurity = computed(() => checkHasPerm("sys:securityConfig:edit"));
  const canEditSession = computed(() => checkHasPerm("sys:sessionConfig:edit"));
  const canSave = computed(() => canEditSecurity.value || canEditSession.value);

  const { t } = useI18n();
  const loading = ref(false); // 防重入 guard，非 UI 遮罩
  const configLoaded = ref(false);
  const { startLoading, stopLoading } = useLoading(0);
  const saving = ref(false); // 当前保存状态
  const activeTab = ref<SecurityTabKey>("login");
  watch(
    [canEditSecurity, canEditSession],
    ([canSecurity, canSession]) => syncActiveTabToVisible(activeTab, canSecurity, canSession),
    { immediate: true }
  ); // 动态配置激活tab（默认显示动态激活的第一个tab页，用login兜底）

  const securityForm = reactive<SecurityConfigStable>(createDefaultSecurityConfig()); // 当前安全策略表单数据
  const sessionForm = reactive<SessionConfigStable>(createDefaultSessionConfig()); // 当前会话表单数据
  const baseline = ref<SecurityConfigSnapshot | null>(null); // 基线快照
  const pageState: SecurityConfigPageState = {
    securityConfig: securityForm, // 安全策略["登陆策略","密码策略"]
    sessionConfig: sessionForm, // 会话策略
  }; // 页面状态

  /**
   * 这里保留 isDirty + markPristine 两个出口是有意设计：
   * - isDirty: 只读结果，表示当前快照是否偏离 baseline
   * - markPristine: 状态迁移动作，在 reload/save 后重建 baseline
   * 两者不是重复标识，一个负责“判断”，一个负责“定义何时重新变干净”。
   */
  const { isDirty, markPristine } = useDirtyState(() => createSnapshot(securityForm, sessionForm)); // isDirty: 表单是否脏；markPristine: 标记表单为干净

  /**
   * 撤销未保存的改动
   * @returns
   */
  function discardChanges() {
    if (!baseline.value || saving.value || loading.value) return;
    applyPageState(pageState, baseline.value); // 撤销未保存的改动
    showNotification(t("已撤销未保存改动"), { type: "info" });
  }

  /**
   * 重新加载配置
   * @param options.withLoading 是否全屏遮罩；默认仅首次未 loaded 时显示
   */
  async function reload(options?: { withLoading?: boolean }) {
    if (loading.value) return;
    if (!canSave.value) {
      configLoaded.value = true;
      stopLoading();
      return;
    }

    const withLoading = options?.withLoading ?? !configLoaded.value;
    loading.value = true;
    try {
      if (withLoading) startLoading();
      const result = await ConfigGateway.detail(
        canEditSecurity.value ? {} : null,
        canEditSession.value ? {} : null
      ); // 仅获取有权限的配置

      const patch: SecurityConfigPageState = {
        securityConfig: createDefaultSecurityConfig(),
        sessionConfig: createDefaultSessionConfig(),
      };
      if (canEditSecurity.value && result.config) {
        // 安全配置
        patch.securityConfig = result.config;
      }
      if (canEditSession.value && result.sessionConfig) {
        // 会话配置
        patch.sessionConfig = result.sessionConfig;
      }

      applyPageState(pageState, patch); // 配置应用页面状态

      const newSnapshot = createSnapshot(securityForm, sessionForm);
      baseline.value = newSnapshot;
      markPristine(baseline.value); // 标记基线快照为干净
      configLoaded.value = true;
    } catch (error) {
      console.error("加载配置失败", error);
    } finally {
      loading.value = false;
      if (withLoading) stopLoading();
    }
  }

  /**
   * 保存配置
   * @returns
   */
  async function save() {
    if (saving.value || !isDirty.value || !canSave.value) return;
    saving.value = true;
    try {
      await ConfigGateway.update(
        canEditSecurity.value ? securityForm : null,
        canEditSession.value ? sessionForm : null
      );
      showNotification(t("配置保存成功"), { type: "success" });

      // 保存成功后，直接将当前表单设为基线，无需重新从后端 reload
      const newSnapshot = createSnapshot(securityForm, sessionForm);
      baseline.value = newSnapshot;
      markPristine(newSnapshot); // 同步基线快照为干净
    } catch (error) {
      console.error("保存配置失败", error);
    } finally {
      saving.value = false;
    }
  }

  startLoading();
  onBeforeMount(() => {
    void reload();
  });
  onUnmounted(() => {
    stopLoading();
  });

  return {
    activeTab,
    canEditSecurity,
    canEditSession,
    canSave,
    configLoaded,
    discardChanges,
    securityForm,
    isDirty,
    loading,
    reload,
    save,
    saving,
    sessionForm,
  };
}
