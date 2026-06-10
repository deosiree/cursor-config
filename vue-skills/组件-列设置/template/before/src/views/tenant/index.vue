<!-- 绉熸埛绠＄悊 -->
<template>
  <div class="app-container tenant-manage">
    <el-card shadow="hover" class="bg-white bottom-container data-table h-full">
      <BaseListToolbar :title="$t('绉熸埛鍒楄〃')">
        <template #filters>
          <el-input
            v-model="queryParams.keyword"
            v-hasPerm="'sys:tenant:query'"
            suffix-icon="search"
            :placeholder="$t('璇疯緭鍏ュ叧閿瓧鎼滅储')"
            clearable
            :style="{ width: $localeLayout.queryField.md }"
            @keyup.enter="handleQuery"
            @clear="handleQuery"
          />
        </template>
        <template #actions>
          <el-button
            v-hasPerm="'sys:tenant:query'"
            type="primary"
            plain
            icon="search"
            size="small"
            @click="handleQuery"
          >
            {{ $t("鎼滅储") }}
          </el-button>
          <el-button
            v-hasPerm="'sys:tenant:add'"
            size="small"
            icon="plus"
            type="primary"
            plain
            @click="handleOpenCreateDialog"
          >
            {{ $t("鏂板") }}
          </el-button>
          <el-button
            v-hasPerm="'sys:tenant:delete'"
            size="small"
            :disabled="selectIds.length === 0"
            icon="delete"
            type="danger"
            plain
            @click="handleDelete()"
          >
            {{ $t("鍒犻櫎") }}
          </el-button>
        </template>
      </BaseListToolbar>

      <div class="tenant-list-page__body">
        <TenantTable
          :data="pageData"
          :loading="loading"
          :action-perms="tenantActionPerms"
          @selection-change="handleSelectionChange"
          @manage-info="handleOpenInfoDialog"
          @manage-project="handleOpenProjectDialog"
          @manage-bind-project-resource="handleOpenProjectResourceDialog"
          @manage-bind-device="handleOpenBindDeviceDialog"
          @resend-activation="handleResendActivation"
          @delete="(row) => handleDelete(row.id)"
        />
      </div>

      <div class="tenant-list-page__pagination">
        <Pagination
          v-model:total="total"
          v-model:page="queryParams.page"
          v-model:limit="queryParams.pageSize"
          @pagination="fetchData"
        />
      </div>
    </el-card>
    <!-- 鍒涘缓绉熸埛 -->
    <SinglePaneDialog
      v-model="createDialog.visible"
      :title="createDialog.title"
      width="60%"
      :confirm-loading="createDialog.confirmLoading"
      :show-footer="true"
      :show-confirm="false"
      @closed="handleCreateDialogClosed"
    >
      <!-- 姝ラ娴佹按绾?-->
      <div class="custom-steps">
        <div
          v-for="(step, index) in stepConfig"
          :key="index"
          class="custom-step"
          :class="{
            'is-active': createDialog.activeStep === index,
            'is-completed': createDialog.activeStep > index,
          }"
        >
          <div
            v-if="index > 0"
            class="custom-step-line"
            :class="{
              'bg-[#e4e7ed]': createDialog.activeStep < index,
              'bg-[#67c23a]': createDialog.activeStep >= index,
            }"
          />
          <div
            class="custom-step-node bg-white border-2 transition-all"
            :class="{
              'is-active': createDialog.activeStep === index,
              'is-valid': createStepStatus[index] === 'valid',
              'is-invalid': createStepStatus[index] === 'invalid',
            }"
          >
            <span class="custom-step-index">{{ index + 1 }}</span>
          </div>
          <div class="custom-step-content">
            <div class="custom-step-title">{{ step.title }}</div>
            <div class="custom-step-description">{{ step.description }}</div>
          </div>
        </div>
      </div>
      <!-- 姝ラ1锛氬熀纭€淇℃伅 -->
      <TenantFormStep
        v-if="createDialog.activeStep === 0"
        ref="createFormStepRef"
        :tenant-model="createTenantForm"
        :owner-model="createOwnerForm"
        tenant-access="write"
        owner-access="write"
        :owner-rules="ownerRules"
        :activation-method="createActivationMethod"
        :show-owner-password-fields="ownerFieldPolicy.showPasswordFields"
        @update:tenant-model="Object.assign(createTenantForm, $event)"
        @update:activation-method="createActivationMethod = $event"
      />
      <!-- 姝ラ2锛氶」鐩€夋嫨 -->
      <TenantProjectSelectStep
        v-else-if="createDialog.activeStep === 1"
        v-model:selected-ids="createSelectedProjectIds"
        :options="createProjectOptions"
        :show-device-config="false"
      />
      <!-- 姝ラ3锛氳鑹查瑙?-->
      <TenantRolePreviewStep v-else />

      <template #footer>
        <div class="dialog-footer">
          <el-button size="small" @click="createDialog.visible = false">{{ $t("鍙栨秷") }}</el-button>
          <el-button
            v-if="createDialog.activeStep > 0"
            size="small"
            @click="createDialog.activeStep -= 1"
          >
            {{ $t("涓婁竴姝?) }}
          </el-button>
          <el-button
            type="primary"
            size="small"
            :loading="createDialog.confirmLoading"
            @click="handleCreateNextOrSubmit"
          >
            {{ createDialog.activeStep < stepConfig.length - 1 ? $t("涓嬩竴姝?) : $t("纭畾") }}
          </el-button>
        </div>
      </template>
    </SinglePaneDialog>
    <!-- 姝ラ4(浠呴摼鎺ユ縺娲?/閲嶅彂婵€娲婚摼鎺ユ寜閽細婵€娲婚〉 -->
    <ActivationDialog
      :model-value="activationDialogVisible"
      :result="activationDialogResult"
      @update:model-value="activationDialogVisible = $event"
      @closed="resetActivationDialog"
    />
    <!-- 绠＄悊淇℃伅 -->
    <SinglePaneDialog
      v-model="infoDialog.visible"
      :title="infoDialog.title"
      width="70%"
      :destroy-on-close="true"
      :loading="infoDialog.loading"
      :confirm-loading="infoDialog.confirmLoading"
      @confirm="handleSubmitInfo"
      @closed="handleInfoDialogClosed"
    >
      <TenantFormStep
        ref="infoFormStepRef"
        :tenant-model="infoTenantForm"
        :owner-model="infoOwnerView"
        tenant-access="write"
        owner-access="read"
        :lock-timezone="true"
        @update:tenant-model="Object.assign(infoTenantForm, $event)"
      />
    </SinglePaneDialog>
    <!-- 绠＄悊椤圭洰 -->
    <SinglePaneDialog
      v-model="projectDialog.visible"
      :title="projectDialog.title"
      width="60%"
      :loading="projectDialog.loading"
      :confirm-loading="projectDialog.confirmLoading"
      @confirm="handleSubmitProjectDialog"
      @closed="handleProjectDialogClosed"
    >
      <TenantProjectSelectStep
        ref="projectSelectRef"
        v-model:selected-ids="projectDialogSelectedIds"
        :options="projectDialogOptions"
        :initial-selected-ids="projectDialogSelectedIds"
        :initial-project-bindings="projectDialogInitialBindings"
        :tenant-devices="projectDialogTenantDevices"
        :tenant-name="projectDialog.tenantName"
        :show-device-config="true"
      />
    </SinglePaneDialog>
    <!-- 绠＄悊杈圭璁惧 -->
    <BindDeviceDialog
      v-model:visible="bindDeviceDialog.visible"
      :tenant-id="bindDeviceDialog.currentTenant?.id"
      :tenant-name="bindDeviceDialog.currentTenant?.tenantName"
      @success="fetchData"
    />
    <!-- 椤圭洰璧勬簮缁戝畾 -->
    <ProjectSourceDialog
      v-model:visible="projectResourceDialog.visible"
      :form-data="projectResourceFormData"
      :bind-info-cache="tenantProjectBindInfoCache"
      :cascader-options="currentProjectCascaderOptions"
      @success="handleProjectResourceBindSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import type {
  OwnerViewModel,
  TenantInfoFormModel,
  TenantProjectBindingModel,
  TenantOwnerFormModel,
  TenantTableRowModel,
} from "@/types/tenant";
import type { ActivationDialogResult } from "@/types/activation";
import TenantGateway, { type TenantListV2Request } from "@/gateway/system/tenant/tenant.gateway";
import ConfigGateway from "@/gateway/system/config.gateway";
import BindDeviceDialog from "@/views/tenant/components/BindDeviceDialog.vue";
import ProjectSourceDialog from "@/views/deviceManage/device/components/ProjectSourceDialog.vue";
import TenantTable from "@/views/tenant/components/TenantTable.vue";
import BaseListToolbar from "@/components/ListToolbar/BaseListToolbar.vue";
import Pagination from "@/components/Pagination/index.vue";
import { resolvePasswordByLoginSetting } from "@/gateway/auth/password-transit.gateway";
import { useI18n } from "vue-i18n";
import { ElMessageBox } from "element-plus";
import { showNotification } from "@/utils/notification";
import ProjectGateway from "@/gateway/resource/project/project.gateway";
import SinglePaneDialog from "@/components/Dialog/SinglePaneDialog.vue";
import TenantFormStep from "@/views/tenant/components/TenantFormStep.vue";
import TenantProjectSelectStep from "@/views/tenant/components/TenantProjectSelectStep.vue";
import TenantRolePreviewStep from "@/views/tenant/components/TenantRolePreviewStep.vue";
import ActivationDialog from "@/views/components/Activation/ActivationDialog.vue";
import UserGateway from "@/gateway/system/user.gateway";
import DeviceGateway from "@/gateway/device/device.gateway";
import { resolveTenantDefaultLocale, resolveTenantDefaultTimezone } from "@/constants/tenant";
import {
  createEmailRules,
  createPhoneRequiredRules,
  createUserNameRules,
  NAME_MAX_LENGTH,
  normName,
} from "@/utils/formRules";
import { getUserActivationFieldPolicy } from "@/views/system/user/user-activation";
import { checkHasPerm } from "@/directive/permission";
import type { ActivationMethodStable } from "@/types/security-config";
import type {
  DeviceBindItemV1,
  ProjectInfoV1,
  ProjectResourceInfoV1,
} from "@/gateway/resource/project/project.gateway";

defineOptions({
  name: "Tenant",
  inheritAttrs: false,
});

interface CascaderResourceOption {
  value: string;
  label: string;
  description?: string;
}

interface CascaderProjectOption {
  value: string;
  label: string;
  description?: string;
  children?: CascaderResourceOption[];
}

interface DeviceBindCacheItem {
  selectedPaths: string[][];
}

interface TenantBoundDeviceOption {
  id: string;
  deviceName?: string;
  deviceDesc?: string;
  deviceKey?: string;
  machineCode?: string;
}

type CreateStepStatus = "idle" | "valid" | "invalid";
const { t } = useI18n();

/** 鎷夊垪琛?/ filters 鎻掓Ы闇€鏍￠獙 query锛涘伐鍏锋爮鎸夐挳鏄鹃殣鐢?v-hasPerm 鎺у埗 */
const canQuery = computed(() => checkHasPerm("sys:tenant:query"));
const canConfig = computed(() => checkHasPerm("sys:tenant:add")); // 鍙湁鍒涘缓绉熸埛鏃舵墠鏈夐€夋嫨婵€娲绘柟寮?const canBindDevice = computed(() => checkHasPerm("sys:tenant:bindDevice"));
const canBindResource = computed(() => checkHasPerm("sys:tenant:bindResource"));

const tenantActionPerms = computed(() => ({
  edit: "sys:tenant:edit",
  bindDevice: "sys:tenant:bindDevice",
  bindResource: "sys:tenant:bindResource",
  delete: "sys:tenant:delete",
}));

const stepConfig = computed(() => [
  { title: t("鍩虹淇℃伅"), description: t("濉啓绉熸埛鍩烘湰淇℃伅骞惰缃墍鏈夎€呰处鍙?) },
  { title: t("鍏宠仈椤圭洰"), description: t("閫夋嫨鍏宠仈鐨勯」鐩?) },
  { title: t("瑙掕壊纭"), description: t("鏌ョ湅榛樿瑙掕壊鏉冮檺") },
]);

const queryParams = reactive<
  Omit<TenantListV2Request, "pagination"> & {
    page: number;
    pageSize: number;
  }
>({
  page: 1,
  pageSize: 20,
  keyword: "",
});

const pageData = ref<TenantTableRowModel[]>([]);
const total = ref(0);
const loading = ref(false);
const selectIds = ref<string[]>([]);

const createDialog = reactive({
  visible: false,
  title: "",
  activeStep: 0,
  confirmLoading: false, // 闃查噸鍏ョ殑閿?});
const activationDialogVisible = ref(false);
const activationDialogResult = ref<ActivationDialogResult | null>(null);

/**
 * 鎵撳紑婵€娲诲璇濇
 * @param result 婵€娲荤粨鏋? */
function openActivationDialog(result: ActivationDialogResult): void {
  activationDialogResult.value = result;
  activationDialogVisible.value = Boolean(result.activationUrl);
}

/**
 * 閲嶇疆婵€娲诲璇濇
 */
function resetActivationDialog(): void {
  activationDialogVisible.value = false;
  activationDialogResult.value = null;
}

const createStepStatus = reactive<Record<number, CreateStepStatus>>({
  0: "idle",
  1: "idle",
  2: "idle",
});

const infoDialog = reactive({
  visible: false,
  title: "",
  tenantId: "",
  loading: false,
  confirmLoading: false, // 闃查噸鍏ョ殑閿?});

const projectDialog = reactive({
  visible: false,
  title: "",
  tenantId: "",
  tenantName: "",
  loading: false,
  confirmLoading: false, // 闃查噸鍏ョ殑閿?});

const EMPTY_TENANT_FORM: TenantInfoFormModel = {
  tenantName: "",
  icon: "",
  expireTime: null,
  remark: "",
  description: "",
  timezone: resolveTenantDefaultTimezone(),
  locale: resolveTenantDefaultLocale(),
  dingtalk: "",
  dingtalkSecret: "",
};

const EMPTY_OWNER_FORM: TenantOwnerFormModel = {
  userName: "",
  password: "",
  confirmPassword: "",
  email: "",
  phone: "",
};

const EMPTY_OWNER_VIEW: OwnerViewModel = {
  userName: "",
  email: "",
  phone: "",
};

const createTenantForm = reactive<TenantInfoFormModel>({
  ...EMPTY_TENANT_FORM,
}); // 鍒涘缓绉熸埛鐨勮〃鍗?
const infoTenantForm = reactive<TenantInfoFormModel>({
  ...EMPTY_TENANT_FORM,
}); // 绉熸埛鍩烘湰淇℃伅鐨勮〃鍗?
const createOwnerForm = reactive<TenantOwnerFormModel>({
  ...EMPTY_OWNER_FORM,
}); // 绉熸埛鎵€鏈夎€呯殑琛ㄥ崟
const createActivationMethod = ref<ActivationMethodStable>("email"); // 婵€娲绘柟寮忥紝榛樿閭

const infoOwnerView = reactive<OwnerViewModel>({
  ...EMPTY_OWNER_VIEW,
}); // 绉熸埛鎵€鏈夎€呯殑瑙嗗浘

const createSelectedProjectIds = ref<string[]>([]);
const projectDialogSelectedIds = ref<string[]>([]);
const createProjectOptions = ref<ProjectOptionByTenant[]>([]);
const projectDialogOptions = ref<ProjectOptionByTenant[]>([]);
const projectDialogInitialBindings = ref<Record<string, string[]>>({});
const projectDialogTenantDevices = ref<TenantBoundDeviceOption[]>([]);

const createFormStepRef = ref<InstanceType<typeof TenantFormStep> | null>(null);
const infoFormStepRef = ref<InstanceType<typeof TenantFormStep> | null>(null);
const projectSelectRef = ref<InstanceType<typeof TenantProjectSelectStep> | null>(null);
const bindDeviceDialog = reactive({
  visible: false,
  currentTenant: null as TenantTableRowModel | null,
});
const projectResourceDialog = reactive({
  visible: false,
});
const projectResourceFormData = reactive<{
  deviceId: string;
  deviceName: string;
  resourceIds: string[];
}>({
  deviceId: "",
  deviceName: "",
  resourceIds: [],
});
const tenantProjectBindInfoCache = ref<Record<string, DeviceBindCacheItem>>({});
const currentProjectCascaderOptions = ref<CascaderProjectOption[]>([]);
const ownerFieldPolicy = computed(() =>
  getUserActivationFieldPolicy(createActivationMethod.value, false)
);
const ownerRules = computed(() => ({
  userName: createUserNameRules(),
  email: [{ required: true, message: t("閭涓嶈兘涓虹┖"), trigger: "blur" }, ...createEmailRules()],
  phone: createPhoneRequiredRules(),
}));

/**
 * 鑾峰彇鐢ㄦ埛婵€娲绘柟寮? */
async function fetchActivationMode() {
  if (!canConfig.value) return;
  try {
    const res = await ConfigGateway.detailConfig({});
    createActivationMethod.value = res?.config?.activationMethod || "email";
  } catch (error) {
    console.error("鑾峰彇鐢ㄦ埛婵€娲绘柟寮忓け璐?", error);
    createActivationMethod.value = "email";
  }
}

/**
 * 閲嶇疆鍒涘缓绉熸埛琛ㄥ崟
 */
function resetCreateTenantForm() {
  Object.assign(createTenantForm, EMPTY_TENANT_FORM);
}

/**
 * 閲嶇疆鍒涘缓绉熸埛鎵€鏈夎€呰〃鍗? */
function resetCreateOwnerForm() {
  Object.assign(createOwnerForm, EMPTY_OWNER_FORM);
}

/**
 * 閲嶇疆淇℃伅瀵硅瘽妗嗘暟鎹? */
function resetInfoDialogData() {
  Object.assign(infoTenantForm, EMPTY_TENANT_FORM);
  Object.assign(infoOwnerView, EMPTY_OWNER_VIEW);
  infoDialog.tenantId = "";
}

/**
 * 閲嶇疆鍒涘缓姝ラ鐘舵€? */
function resetCreateStepStatus() {
  createStepStatus[0] = "idle";
  createStepStatus[1] = "idle";
  createStepStatus[2] = "idle";
}

/**
 * 閲嶇疆鍒涘缓娴佺▼鐨勫熀纭€鐘舵€? */
function resetCreateFlowState() {
  createDialog.activeStep = 0;
  resetCreateStepStatus();
  resetCreateTenantForm();
  resetCreateOwnerForm();
  createActivationMethod.value = "email";
  createSelectedProjectIds.value = [];
}

/**
 * 鑾峰彇绉熸埛鍒楄〃鏁版嵁
 */
async function fetchData() {
  if (!canQuery.value) {
    pageData.value = [];
    total.value = 0;
    return;
  }
  loading.value = true;
  try {
    const result = await TenantGateway.getPageV2({
      pagination: {
        page: queryParams.page,
        pageSize: queryParams.pageSize,
      },
      keyword: queryParams.keyword ?? "",
    });
    pageData.value = result.rows;
    total.value = result.total;
  } finally {
    loading.value = false;
  }
}

/**
 * 澶勭悊鏌ヨ
 */
function handleQuery() {
  queryParams.page = 1;
  fetchData(); // 閲嶆柊鑾峰彇鏁版嵁
}

/**
 * 澶勭悊閫夋嫨鍙樺寲
 * @param selection 閫変腑鐨勭鎴? */
function handleSelectionChange(selection: TenantTableRowModel[]) {
  selectIds.value = selection.map((item) => item.id);
}

/**
 * 澶勭悊鍒涘缓瀵硅瘽妗嗘墦寮€
 */
async function handleOpenCreateDialog() {
  // 鍒濆鍖?  createDialog.title = t("鏂板绉熸埛");
  resetCreateFlowState(); // 閲嶇疆鍒涘缓娴佺▼鐘舵€?  resetActivationDialog(); // 閲嶇疆婵€娲诲璇濇鐘舵€?  try {
    await fetchActivationMode(); // 鑾峰彇鐢ㄦ埛婵€娲绘柟寮?    createProjectOptions.value = await ProjectGateway.getTenantProjectOptions(); // 鍔犺浇椤圭洰閫夐」
    createSelectedProjectIds.value = [];
    createDialog.visible = true;
  } catch {
    createProjectOptions.value = [];
    // showNotification("鍔犺浇椤圭洰鍒楄〃澶辫触", { type: "error" });// 鎷︽埅鍣ㄧ粺涓€show浜?  }
}

/**
 * 鎵撳紑绉熸埛淇℃伅瀵硅瘽妗? * @param row 绉熸埛琛屾暟鎹? */
async function handleOpenInfoDialog(row: TenantTableRowModel) {
  infoDialog.loading = true;
  infoDialog.tenantId = String(row.id);
  infoDialog.title = row.tenantName ? `銆?{row.tenantName}銆?{t("绠＄悊淇℃伅")}` : t("绠＄悊淇℃伅");
  infoDialog.visible = true;

  try {
    const detail = await TenantGateway.getDetailV2(String(row.id));
    Object.assign(infoTenantForm, detail.tenantForm); // 绉熸埛鍩烘湰淇℃伅
    Object.assign(infoOwnerView, detail.ownerView); // 绉熸埛鎵€鏈夎€呬俊鎭?  } catch {
    infoDialog.visible = false;
    // showNotification("鍔犺浇绉熸埛璇︽儏澶辫触", { type: "error" });// 鎷︽埅鍣ㄧ粺涓€show浜?  } finally {
    infoDialog.loading = false;
  }
}

/**
 * 鎵撳紑椤圭洰绠＄悊瀵硅瘽妗? * @param row 绉熸埛琛屾暟鎹? */
async function handleOpenProjectDialog(row: TenantTableRowModel) {
  projectDialog.loading = true;
  projectDialog.tenantId = String(row.id);
  projectDialog.tenantName = row.tenantName || "";
  projectDialog.title = row.tenantName ? `銆?{row.tenantName}銆?{t("绠＄悊椤圭洰")}` : t("绠＄悊椤圭洰");
  projectDialog.visible = true;

  try {
    const [options, tenantProjects, tenantDevicesRes] = await Promise.all([
      ProjectGateway.getTenantProjectOptions(), // 鑾峰彇椤圭洰閫夐」
      ProjectGateway.getTenantProjects(String(row.id)), // 鑾峰彇绉熸埛宸插垎閰嶉」鐩?      DeviceGateway.getBind(String(row.id)),
    ]);
    const tenantDevices: TenantBoundDeviceOption[] = (
      (tenantDevicesRes?.list ?? []) as Array<Record<string, unknown>>
    ).map((device) => ({
      id: String(device.id ?? ""),
      deviceName: String(device.deviceName ?? ""),
      deviceDesc: String(device.deviceDesc ?? ""),
      deviceKey: String(device.deviceKey ?? ""),
      machineCode: String(device.machineCode ?? ""),
    }));

    projectDialogOptions.value = options; // 椤圭洰閫夐」
    projectDialogSelectedIds.value = tenantProjects.selectedProjectIds; // 閫変腑鐨勯」鐩甀D
    projectDialogInitialBindings.value = tenantProjects.projectBindings; // 椤圭洰缁戝畾淇℃伅
    projectDialogTenantDevices.value = tenantDevices;
  } catch {
    projectDialog.visible = false;
    projectDialogOptions.value = [];
    projectDialogSelectedIds.value = [];
    projectDialogInitialBindings.value = {};
    projectDialogTenantDevices.value = [];
    // showNotification("鍔犺浇绉熸埛椤圭洰澶辫触", { type: "error" });// 鎷︽埅鍣ㄧ粺涓€show浜?  } finally {
    projectDialog.loading = false;
  }
}

/**
 * 鍔犺浇绉熸埛宸插叧鑱旈」鐩殑璧勬簮鍒楄〃锛岀粍缁囦负椤圭洰璧勬簮缁戝畾寮圭獥鎵€闇€缁撴瀯
 * @param projectIds 绉熸埛宸插叧鑱旈」鐩?ID 鍒楄〃
 */
async function loadTenantProjectResourceOptions(
  projectIds: string[]
): Promise<CascaderProjectOption[]> {
  const normalizedProjectIds = Array.from(new Set(projectIds.map(String).filter(Boolean)));
  if (normalizedProjectIds.length === 0) {
    return [];
  }

  const projectRes = await ProjectGateway.getProjectList({
    ids: normalizedProjectIds,
    page: 1,
    pageSize: 1000,
  });
  const projectMap = new Map(
    (projectRes?.projects || []).map((project) => [String(project.id), project] as const)
  );

  const orderedProjects = normalizedProjectIds
    .map((projectId) => projectMap.get(projectId))
    .filter((project): project is ProjectInfoV1 => Boolean(project));

  const options = await Promise.all(
    orderedProjects.map(async (project) => {
      const projectId = String(project.id);
      const resourceRes = await ProjectGateway.getProjectResourceList({
        projectId,
        page: 1,
        pageSize: 1000,
        singleton: 2,
      });
      const resources: ProjectResourceInfoV1[] = resourceRes?.resources || [];

      return {
        value: projectId,
        label: project.name || projectId,
        description: project.description || "",
        children: resources.map((resource) => ({
          value: String(resource.id),
          label: resource.name || resource.resourceName || String(resource.id),
          description: resource.description || "",
        })),
      };
    })
  );

  return options.filter((project) => (project.children?.length ?? 0) > 0);
}

/**
 * 鏍规嵁缁戝畾淇℃伅鍥炲～椤圭洰璧勬簮閫夋嫨璺緞
 * @param tenantId 绉熸埛 ID
 * @param cascaderOptions 椤圭洰璧勬簮鍊欓€夐」
 */
async function loadTenantBindSelectedPaths(
  tenantId: string,
  cascaderOptions: CascaderProjectOption[]
): Promise<string[][]> {
  const selectedPaths: string[][] = [];
  const bindRes = await ProjectGateway.getDeviceBindInfo({
    deviceIds: [tenantId],
    page: 1,
    pageSize: 1000,
  });
  const deviceBinds = bindRes?.deviceBinds || [];
  if (deviceBinds.length === 0) {
    return selectedPaths;
  }

  const binds: DeviceBindItemV1[] = deviceBinds[0]?.binds || [];
  const resourceIds = binds
    .map((bind) => bind.pvrId || bind.id)
    .filter((id): id is string => Boolean(id));

  for (const projectOption of cascaderOptions) {
    const projectId = projectOption.value;
    const children = projectOption.children || [];
    for (const resourceOption of children) {
      if (resourceIds.includes(resourceOption.value)) {
        selectedPaths.push([projectId, resourceOption.value]);
        break;
      }
    }
  }

  return selectedPaths;
}

/**
 * 鎵撳紑椤圭洰璧勬簮缁戝畾瀵硅瘽妗? * @param row 绉熸埛琛屾暟鎹? */
async function handleOpenProjectResourceDialog(row: TenantTableRowModel) {
  if (!canBindResource.value) return;
  const tenantId = String(row.id || "");
  if (!tenantId) {
    showNotification(t("绉熸埛淇℃伅涓嶅瓨鍦?), { type: "warning" });
    return;
  }

  try {
    const { projectIds = [] } = await TenantGateway.getProjectsV2(tenantId);
    const cascaderOptions = await loadTenantProjectResourceOptions(projectIds);
    const selectedPaths = await loadTenantBindSelectedPaths(tenantId, cascaderOptions);

    currentProjectCascaderOptions.value = cascaderOptions;
    Object.assign(projectResourceFormData, {
      deviceId: tenantId,
      deviceName: row.tenantName || "",
      resourceIds: [],
    });
    tenantProjectBindInfoCache.value[tenantId] = {
      selectedPaths,
    };
    projectResourceDialog.visible = true;
  } catch {
    currentProjectCascaderOptions.value = [];
  }
}

/**
 * 椤圭洰璧勬簮缁戝畾鎴愬姛鍥炶皟
 */
async function handleProjectResourceBindSuccess() {
  const tenantId = projectResourceFormData.deviceId;
  if (tenantId) {
    delete tenantProjectBindInfoCache.value[tenantId];
  }
  await fetchData();
}

/**
 * 閲嶅彂婵€娲婚摼鎺? * @param row 绉熸埛琛屾暟鎹? */
async function handleResendActivation(row: TenantTableRowModel) {
  if (!row.ownerId) {
    showNotification(t("绉熸埛鎵€鏈夎€呬俊鎭笉瀛樺湪锛屾棤娉曢噸鍙戞縺娲婚摼鎺?), { type: "warning" });
    return;
  }

  loading.value = true;
  try {
    const res = await UserGateway.resendActivation({ id: row.ownerId });

    if (res.activationUrl) {
      // 鑻ユ槸鏈塙rl锛岃鏄庢槸閾炬帴婵€娲?      openActivationDialog(res);
    } else {
      // 鑻ユ槸鏃燯rl锛岃鏄庢槸閭婵€娲?      showNotification(t(res.activationMsg), { type: "success" });
    }

    await fetchData(); // 閲嶆柊鑾峰彇鏁版嵁
  } finally {
    loading.value = false;
  }
}

/**
 * 澶勭悊鍒涘缓瀵硅瘽妗嗗叧闂? */
function handleCreateDialogClosed() {
  resetCreateFlowState(); // 閲嶇疆鍒涘缓娴佺▼鐘舵€?  createDialog.confirmLoading = false;
  createProjectOptions.value = [];
  createFormStepRef.value?.clearValidate?.();
}

/**
 * 澶勭悊绉熸埛淇℃伅瀵硅瘽妗嗗叧闂? */
function handleInfoDialogClosed() {
  infoDialog.loading = false;
  infoDialog.confirmLoading = false;
  resetInfoDialogData();
  infoFormStepRef.value?.clearValidate?.();
}

/**
 * 澶勭悊椤圭洰绠＄悊瀵硅瘽妗嗗叧闂? */
function handleProjectDialogClosed() {
  projectDialog.loading = false;
  projectDialog.confirmLoading = false;
  projectDialog.tenantId = "";
  projectDialog.tenantName = "";
  projectDialogOptions.value = [];
  projectDialogSelectedIds.value = [];
  projectDialogInitialBindings.value = {};
  projectDialogTenantDevices.value = [];
}

/**
 * 澶勭悊鍒涘缓姝ラ鐨勪笅涓€姝ユ垨鎻愪氦
 */
async function handleCreateNextOrSubmit() {
  // 闃叉閲嶅鎻愪氦锛堥槻閲嶅叆锛屽弬鑰僽ser涓殑闃叉姈锛?  if (createDialog.confirmLoading) {
    return;
  }

  const { activeStep } = createDialog;

  // --- 姝ラ 1: 鍩虹涓庢墍鏈夎€呬俊鎭獙璇?---
  if (activeStep === 0) {
    const [tRes, oRes] = await Promise.all([
      createFormStepRef.value?.validateTenant?.(), // 楠岃瘉绉熸埛淇℃伅
      createFormStepRef.value?.validateOwner?.(), // 楠岃瘉鎵€鏈夎€呬俊鎭?    ]);

    if (!tRes?.valid || !oRes?.valid) {
      createStepStatus[0] = "invalid";
      const firstError = [...(tRes?.errors ?? []), ...(oRes?.errors ?? [])][0];
      showNotification(firstError || t("璇峰畬鍠勫熀纭€淇℃伅鍜屾墍鏈夎€呬俊鎭?), { type: "error" });
      return;
    }

    createStepStatus[0] = "valid";
    createDialog.activeStep = 1;
    return;
  }

  // --- 姝ラ 2: 椤圭洰閰嶇疆楠岃瘉 ---
  if (activeStep === 1) {
    createStepStatus[1] = "valid";
    createDialog.activeStep = 2;
    return;
  }

  // --- 姝ラ 3: 鏈€缁堟彁浜ら€昏緫 ---
  createDialog.confirmLoading = true;
  try {
    // 1. 瀵嗙爜澶勭悊
    let ownerPassword;
    if (ownerFieldPolicy.value.requirePassword) {
      const ownerPasswordResult = await resolvePasswordByLoginSetting(createOwnerForm.password);
      if (ownerPasswordResult.ok) {
        ownerPassword = ownerPasswordResult.password;
      } else {
        console.error("鍔犲瘑澶辫触", ownerPasswordResult.code);
        return;
      }
    }

    // 2. 璋冪敤缃戝叧鏂规硶锛堝悕绉版彁浜ゅ墠瑙勮寖鍖栵級
    const createRes = await TenantGateway.createV2({
      tenantForm: {
        ...createTenantForm,
        tenantName: normName(createTenantForm.tenantName, NAME_MAX_LENGTH.tenantName),
      },
      ownerForm: {
        ...createOwnerForm,
        userName: normName(createOwnerForm.userName, NAME_MAX_LENGTH.username),
      },
      ownerPassword,
      activationMethod: createActivationMethod.value,
      selectedProjectIds: createSelectedProjectIds.value,
    });

    // 3. 缁撴灉澶勭悊
    createStepStatus[2] = "valid";
    createDialog.visible = false;

    if (createActivationMethod.value === "link") {
      // 姝ラ4(鍙€?锛氭柊澧炵鎴锋垚鍔燂紝閾炬帴婵€娲伙紝createRes鏈夊睘鎬ctivationUrl鏃讹紝鎵峷isible
      openActivationDialog(createRes);
    } else {
      // 鏂板绉熸埛鎴愬姛
      showNotification(t("鏂板绉熸埛鎴愬姛"), { type: "success" });
    }

    await fetchData(); // 閲嶆柊鑾峰彇鏁版嵁
  } finally {
    createDialog.confirmLoading = false;
  }
}

/**
 * 鎻愪氦绉熸埛淇℃伅
 */
async function handleSubmitInfo() {
  // 闃叉閲嶅鎻愪氦锛堥槻閲嶅叆锛屽弬鑰僽ser涓殑闃叉姈锛?  if (infoDialog.confirmLoading) {
    return;
  }

  const validation = await infoFormStepRef.value?.validateTenant?.();
  if (!validation?.valid || !infoDialog.tenantId) {
    showNotification(validation?.errors?.[0] || t("璇峰畬鍠勭鎴峰熀纭€淇℃伅"), { type: "error" });
    return;
  }

  infoDialog.confirmLoading = true;
  try {
    await TenantGateway.updateV2({
      tenantId: infoDialog.tenantId,
      tenantForm: {
        ...infoTenantForm,
        tenantName: normName(infoTenantForm.tenantName, NAME_MAX_LENGTH.tenantName),
      },
    });
    showNotification(t("绉熸埛淇℃伅鏇存柊鎴愬姛"), { type: "success" });
    infoDialog.visible = false;
    await fetchData();
  } finally {
    infoDialog.confirmLoading = false;
  }
}

/**
 * 鎻愪氦椤圭洰绠＄悊瀵硅瘽妗? */
async function handleSubmitProjectDialog() {
  // 闃叉閲嶅鎻愪氦锛堥槻閲嶅叆锛屽弬鑰僽ser涓殑闃叉姈锛?  if (projectDialog.confirmLoading) {
    return;
  }

  if (!projectDialog.tenantId) {
    showNotification(t("绉熸埛淇℃伅涓嶅瓨鍦?), { type: "warning" });
    return;
  }

  projectDialog.confirmLoading = true;
  try {
    const projects: TenantProjectBindingModel[] =
      projectSelectRef.value?.getProjectsForSubmit?.() ?? [];
    const projectIds = projectSelectRef.value?.getSelectedProjectIds?.() ?? [];

    await TenantGateway.assignProjectsV2({
      tenantId: projectDialog.tenantId,
      projectIds,
      projects,
    });
    showNotification(t("鍏宠仈椤圭洰鏇存柊鎴愬姛"), { type: "success" });
    projectDialog.visible = false;
    await fetchData();
  } finally {
    projectDialog.confirmLoading = false;
  }
}

/**
 * 鍒犻櫎绉熸埛
 * @param id
 */
async function handleDelete(id?: string) {
  const userIds = id !== undefined ? [id] : selectIds.value;
  if (!userIds || userIds.length === 0) {
    showNotification(t("璇峰嬀閫夊垹闄ら」"), { type: "warning" });
    return;
  }

  ElMessageBox.confirm(t("鍒犻櫎绉熸埛鐨勫悓鏃朵細瑙ｇ粦璇ョ鎴风殑鎵€鏈夎澶囷紝纭畾鍒犻櫎绉熸埛?"), t("璀﹀憡"), {
    confirmButtonText: t("纭畾"),
    cancelButtonText: t("鍙栨秷"),
    type: "warning",
    buttonSize: "small",
    closeOnClickModal: false,
  }).then(function () {
    loading.value = true;
    Promise.all(userIds.map((item) => TenantGateway.deleteV2(String(item))))
      .then(() => {
        showNotification(t("鍒犻櫎鎴愬姛"), { type: "success" });
        handleQuery();
      })
      .finally(() => (loading.value = false));
  });
}

/**
 * 鎵撳紑缁戝畾璁惧瀵硅瘽妗? * @param row
 */
function handleOpenBindDeviceDialog(row: TenantTableRowModel) {
  if (!canBindDevice.value) return;
  bindDeviceDialog.visible = true;
  bindDeviceDialog.currentTenant = row;
}

onMounted(() => {
  if (canConfig.value) void fetchActivationMode();
  if (canQuery.value) void handleQuery();
});
</script>

<style lang="scss" scoped>
.h-full {
  width: 100%;
  height: 100%;
}

.app-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.tenant-manage {
  :deep(.el-card__body) {
    display: flex;
    flex-direction: column;
    height: 100% !important;
    overflow: hidden;
  }
}

.bottom-container {
  display: flex;
  flex: 1;
  flex-direction: column;
  height: 100%;
  min-height: 0;
}

.tenant-manage :deep(.base-list-toolbar) {
  flex-shrink: 0;
}

.tenant-list-page__body {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.tenant-list-page__pagination {
  flex-shrink: 0;
}

.dialog-footer {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.custom-steps {
  position: relative;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 0 20px 20px;
}

.custom-step {
  position: relative;
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;

  &:first-child {
    .custom-step-line {
      display: none;
    }
  }
}

.custom-step-line {
  position: absolute;
  top: 16px;
  left: -50%;
  z-index: 0;
  width: 100%;
  height: 2px;
}

.custom-step-node {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-color: #dcdfe6;
  border-radius: 50%;

  &.is-active {
    background: #ecf5ff;
    border-color: #409eff;
  }

  &.is-valid {
    background: #f0f9ff;
    border-color: #67c23a;
  }

  &.is-invalid {
    background: #fef0f0;
    border-color: #f56c6c;
  }
}

.custom-step-content {
  margin-top: 8px;
  text-align: center;
}

.custom-step-title {
  margin-bottom: 4px;
  font-size: 14px;
  font-weight: 500;
}

.custom-step-description {
  font-size: 12px;
}

/* 宸茶縼绉诲埌閫氱敤 `ActivationDialog`锛屼繚鐣欐澶勪粎鐢ㄤ簬鍘嗗彶 diff 瀵圭収 */
</style>
