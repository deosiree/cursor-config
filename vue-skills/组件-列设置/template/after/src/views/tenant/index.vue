<!-- 租户管理 -->
<template>
  <div class="app-container tenant-manage">
    <el-card shadow="hover" class="bg-white bottom-container data-table h-full">
      <BaseListToolbar :title="$t('租户列表')">
        <template #filters>
          <el-input
            v-model="queryParams.keyword"
            v-hasPerm="'sys:tenant:query'"
            suffix-icon="search"
            :placeholder="$t('请输入关键字搜索')"
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
            {{ $t("搜索") }}
          </el-button>
          <el-button
            v-hasPerm="'sys:tenant:add'"
            size="small"
            icon="plus"
            type="primary"
            plain
            @click="handleOpenCreateDialog"
          >
            {{ $t("新增") }}
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
            {{ $t("删除") }}
          </el-button>
          <!-- 列过滤组件：v-hasPerm 须包在原生节点上，避免挂在 ColumnFilter 根组件 -->
          <span v-hasPerm="'sys:tenant:query'" class="column-filter-wrap">
            <ColumnFilter v-model="selectedColumns" :columns="tableColumns" />
          </span>
        </template>
      </BaseListToolbar>

      <div class="tenant-list-page__body">
        <TenantTable
          :data="pageData"
          :loading="loading"
          :visible-columns="visibleColumns"
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
    <!-- 创建租户 -->
    <SinglePaneDialog
      v-model="createDialog.visible"
      :title="createDialog.title"
      width="60%"
      :confirm-loading="createDialog.confirmLoading"
      :show-footer="true"
      :show-confirm="false"
      @closed="handleCreateDialogClosed"
    >
      <!-- 步骤流水线 -->
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
      <!-- 步骤1：基础信息 -->
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
      <!-- 步骤2：项目选择 -->
      <TenantProjectSelectStep
        v-else-if="createDialog.activeStep === 1"
        v-model:selected-ids="createSelectedProjectIds"
        :options="createProjectOptions"
        :show-device-config="false"
      />
      <!-- 步骤3：角色预览 -->
      <TenantRolePreviewStep v-else />

      <template #footer>
        <div class="dialog-footer">
          <el-button size="small" @click="createDialog.visible = false">{{ $t("取消") }}</el-button>
          <el-button
            v-if="createDialog.activeStep > 0"
            size="small"
            @click="createDialog.activeStep -= 1"
          >
            {{ $t("上一步") }}
          </el-button>
          <el-button
            type="primary"
            size="small"
            :loading="createDialog.confirmLoading"
            @click="handleCreateNextOrSubmit"
          >
            {{ createDialog.activeStep < stepConfig.length - 1 ? $t("下一步") : $t("确定") }}
          </el-button>
        </div>
      </template>
    </SinglePaneDialog>
    <!-- 步骤4(仅链接激活)/重发激活链接按钮：激活页 -->
    <ActivationDialog
      :model-value="activationDialogVisible"
      :result="activationDialogResult"
      @update:model-value="activationDialogVisible = $event"
      @closed="resetActivationDialog"
    />
    <!-- 管理信息 -->
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
    <!-- 管理项目 -->
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
    <!-- 管理边端设备 -->
    <BindDeviceDialog
      v-model:visible="bindDeviceDialog.visible"
      :tenant-id="bindDeviceDialog.currentTenant?.id"
      :tenant-name="bindDeviceDialog.currentTenant?.tenantName"
      @success="fetchData"
    />
    <!-- 项目资源绑定 -->
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

/** 拉列表 / filters 插槽需校验 query；工具栏按钮显隐由 v-hasPerm 控制 */
const canQuery = computed(() => checkHasPerm("sys:tenant:query"));
const canConfig = computed(() => checkHasPerm("sys:tenant:add")); // 只有创建租户时才有选择激活方式
const canBindDevice = computed(() => checkHasPerm("sys:tenant:bindDevice"));
const canBindResource = computed(() => checkHasPerm("sys:tenant:bindResource"));

const tenantActionPerms = computed(() => ({
  edit: "sys:tenant:edit",
  bindDevice: "sys:tenant:bindDevice",
  bindResource: "sys:tenant:bindResource",
  delete: "sys:tenant:delete",
}));

const stepConfig = computed(() => [
  { title: t("基础信息"), description: t("填写租户基本信息并设置所有者账号") },
  { title: t("关联项目"), description: t("选择关联的项目") },
  { title: t("角色确认"), description: t("查看默认角色权限") },
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
  confirmLoading: false, // 防重入的锁
});
const activationDialogVisible = ref(false);
const activationDialogResult = ref<ActivationDialogResult | null>(null);

/**
 * 打开激活对话框
 * @param result 激活结果
 */
function openActivationDialog(result: ActivationDialogResult): void {
  activationDialogResult.value = result;
  activationDialogVisible.value = Boolean(result.activationUrl);
}

/**
 * 重置激活对话框
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
  confirmLoading: false, // 防重入的锁
});

const projectDialog = reactive({
  visible: false,
  title: "",
  tenantId: "",
  tenantName: "",
  loading: false,
  confirmLoading: false, // 防重入的锁
});

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
}); // 创建租户的表单

const infoTenantForm = reactive<TenantInfoFormModel>({
  ...EMPTY_TENANT_FORM,
}); // 租户基本信息的表单

const createOwnerForm = reactive<TenantOwnerFormModel>({
  ...EMPTY_OWNER_FORM,
}); // 租户所有者的表单
const createActivationMethod = ref<ActivationMethodStable>("email"); // 激活方式，默认邮箱

const infoOwnerView = reactive<OwnerViewModel>({
  ...EMPTY_OWNER_VIEW,
}); // 租户所有者的视图

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
  email: [{ required: true, message: t("邮箱不能为空"), trigger: "blur" }, ...createEmailRules()],
  phone: createPhoneRequiredRules(),
}));

/**
 * 获取用户激活方式
 */
async function fetchActivationMode() {
  if (!canConfig.value) return;
  try {
    const res = await ConfigGateway.detailConfig({});
    createActivationMethod.value = res?.config?.activationMethod || "email";
  } catch (error) {
    console.error("获取用户激活方式失败:", error);
    createActivationMethod.value = "email";
  }
}

/**
 * 重置创建租户表单
 */
function resetCreateTenantForm() {
  Object.assign(createTenantForm, EMPTY_TENANT_FORM);
}

/**
 * 重置创建租户所有者表单
 */
function resetCreateOwnerForm() {
  Object.assign(createOwnerForm, EMPTY_OWNER_FORM);
}

/**
 * 重置信息对话框数据
 */
function resetInfoDialogData() {
  Object.assign(infoTenantForm, EMPTY_TENANT_FORM);
  Object.assign(infoOwnerView, EMPTY_OWNER_VIEW);
  infoDialog.tenantId = "";
}

/**
 * 重置创建步骤状态
 */
function resetCreateStepStatus() {
  createStepStatus[0] = "idle";
  createStepStatus[1] = "idle";
  createStepStatus[2] = "idle";
}

/**
 * 重置创建流程的基础状态
 */
function resetCreateFlowState() {
  createDialog.activeStep = 0;
  resetCreateStepStatus();
  resetCreateTenantForm();
  resetCreateOwnerForm();
  createActivationMethod.value = "email";
  createSelectedProjectIds.value = [];
}

/**
 * 获取租户列表数据
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
 * 处理查询
 */
function handleQuery() {
  queryParams.page = 1;
  fetchData(); // 重新获取数据
}

/**
 * 处理选择变化
 * @param selection 选中的租户
 */
function handleSelectionChange(selection: TenantTableRowModel[]) {
  selectIds.value = selection.map((item) => item.id);
}

/**
 * 处理创建对话框打开
 */
async function handleOpenCreateDialog() {
  // 初始化
  createDialog.title = t("新增租户");
  resetCreateFlowState(); // 重置创建流程状态
  resetActivationDialog(); // 重置激活对话框状态
  try {
    await fetchActivationMode(); // 获取用户激活方式
    createProjectOptions.value = await ProjectGateway.getTenantProjectOptions(); // 加载项目选项
    createSelectedProjectIds.value = [];
    createDialog.visible = true;
  } catch {
    createProjectOptions.value = [];
    // showNotification("加载项目列表失败", { type: "error" });// 拦截器统一show了
  }
}

/**
 * 打开租户信息对话框
 * @param row 租户行数据
 */
async function handleOpenInfoDialog(row: TenantTableRowModel) {
  infoDialog.loading = true;
  infoDialog.tenantId = String(row.id);
  infoDialog.title = row.tenantName ? `【${row.tenantName}】${t("管理信息")}` : t("管理信息");
  infoDialog.visible = true;

  try {
    const detail = await TenantGateway.getDetailV2(String(row.id));
    Object.assign(infoTenantForm, detail.tenantForm); // 租户基本信息
    Object.assign(infoOwnerView, detail.ownerView); // 租户所有者信息
  } catch {
    infoDialog.visible = false;
    // showNotification("加载租户详情失败", { type: "error" });// 拦截器统一show了
  } finally {
    infoDialog.loading = false;
  }
}

/**
 * 打开项目管理对话框
 * @param row 租户行数据
 */
async function handleOpenProjectDialog(row: TenantTableRowModel) {
  projectDialog.loading = true;
  projectDialog.tenantId = String(row.id);
  projectDialog.tenantName = row.tenantName || "";
  projectDialog.title = row.tenantName ? `【${row.tenantName}】${t("管理项目")}` : t("管理项目");
  projectDialog.visible = true;

  try {
    const [options, tenantProjects, tenantDevicesRes] = await Promise.all([
      ProjectGateway.getTenantProjectOptions(), // 获取项目选项
      ProjectGateway.getTenantProjects(String(row.id)), // 获取租户已分配项目
      DeviceGateway.getBind(String(row.id)),
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

    projectDialogOptions.value = options; // 项目选项
    projectDialogSelectedIds.value = tenantProjects.selectedProjectIds; // 选中的项目ID
    projectDialogInitialBindings.value = tenantProjects.projectBindings; // 项目绑定信息
    projectDialogTenantDevices.value = tenantDevices;
  } catch {
    projectDialog.visible = false;
    projectDialogOptions.value = [];
    projectDialogSelectedIds.value = [];
    projectDialogInitialBindings.value = {};
    projectDialogTenantDevices.value = [];
    // showNotification("加载租户项目失败", { type: "error" });// 拦截器统一show了
  } finally {
    projectDialog.loading = false;
  }
}

/**
 * 加载租户已关联项目的资源列表，组织为项目资源绑定弹窗所需结构
 * @param projectIds 租户已关联项目 ID 列表
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
 * 根据绑定信息回填项目资源选择路径
 * @param tenantId 租户 ID
 * @param cascaderOptions 项目资源候选项
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
 * 打开项目资源绑定对话框
 * @param row 租户行数据
 */
async function handleOpenProjectResourceDialog(row: TenantTableRowModel) {
  if (!canBindResource.value) return;
  const tenantId = String(row.id || "");
  if (!tenantId) {
    showNotification(t("租户信息不存在"), { type: "warning" });
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
 * 项目资源绑定成功回调
 */
async function handleProjectResourceBindSuccess() {
  const tenantId = projectResourceFormData.deviceId;
  if (tenantId) {
    delete tenantProjectBindInfoCache.value[tenantId];
  }
  await fetchData();
}

/**
 * 重发激活链接
 * @param row 租户行数据
 */
async function handleResendActivation(row: TenantTableRowModel) {
  if (!row.ownerId) {
    showNotification(t("租户所有者信息不存在，无法重发激活链接"), { type: "warning" });
    return;
  }

  loading.value = true;
  try {
    const res = await UserGateway.resendActivation({ id: row.ownerId });

    if (res.activationUrl) {
      // 若是有Url，说明是链接激活
      openActivationDialog(res);
    } else {
      // 若是无Url，说明是邮箱激活
      showNotification(t(res.activationMsg), { type: "success" });
    }

    await fetchData(); // 重新获取数据
  } finally {
    loading.value = false;
  }
}

/**
 * 处理创建对话框关闭
 */
function handleCreateDialogClosed() {
  resetCreateFlowState(); // 重置创建流程状态
  createDialog.confirmLoading = false;
  createProjectOptions.value = [];
  createFormStepRef.value?.clearValidate?.();
}

/**
 * 处理租户信息对话框关闭
 */
function handleInfoDialogClosed() {
  infoDialog.loading = false;
  infoDialog.confirmLoading = false;
  resetInfoDialogData();
  infoFormStepRef.value?.clearValidate?.();
}

/**
 * 处理项目管理对话框关闭
 */
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
 * 处理创建步骤的下一步或提交
 */
async function handleCreateNextOrSubmit() {
  // 防止重复提交（防重入，参考user中的防抖）
  if (createDialog.confirmLoading) {
    return;
  }

  const { activeStep } = createDialog;

  // --- 步骤 1: 基础与所有者信息验证 ---
  if (activeStep === 0) {
    const [tRes, oRes] = await Promise.all([
      createFormStepRef.value?.validateTenant?.(), // 验证租户信息
      createFormStepRef.value?.validateOwner?.(), // 验证所有者信息
    ]);

    if (!tRes?.valid || !oRes?.valid) {
      createStepStatus[0] = "invalid";
      const firstError = [...(tRes?.errors ?? []), ...(oRes?.errors ?? [])][0];
      showNotification(firstError || t("请完善基础信息和所有者信息"), { type: "error" });
      return;
    }

    createStepStatus[0] = "valid";
    createDialog.activeStep = 1;
    return;
  }

  // --- 步骤 2: 项目配置验证 ---
  if (activeStep === 1) {
    createStepStatus[1] = "valid";
    createDialog.activeStep = 2;
    return;
  }

  // --- 步骤 3: 最终提交逻辑 ---
  createDialog.confirmLoading = true;
  try {
    // 1. 密码处理
    let ownerPassword;
    if (ownerFieldPolicy.value.requirePassword) {
      const ownerPasswordResult = await resolvePasswordByLoginSetting(createOwnerForm.password);
      if (ownerPasswordResult.ok) {
        ownerPassword = ownerPasswordResult.password;
      } else {
        console.error("加密失败", ownerPasswordResult.code);
        return;
      }
    }

    // 2. 调用网关方法（名称提交前规范化）
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

    // 3. 结果处理
    createStepStatus[2] = "valid";
    createDialog.visible = false;

    if (createActivationMethod.value === "link") {
      // 步骤4(可选)：新增租户成功，链接激活，createRes有属性activationUrl时，才visible
      openActivationDialog(createRes);
    } else {
      // 新增租户成功
      showNotification(t("新增租户成功"), { type: "success" });
    }

    await fetchData(); // 重新获取数据
  } catch (error) {
    // 后端校验失败（如手机邮箱重复），跳转到管理信息
    if ((error as { type?: string })?.type !== "business") return;
    createDialog.activeStep = 0;
    createStepStatus[0] = "invalid";
  } finally {
    createDialog.confirmLoading = false;
  }
}

/**
 * 提交租户信息
 */
async function handleSubmitInfo() {
  // 防止重复提交（防重入，参考user中的防抖）
  if (infoDialog.confirmLoading) {
    return;
  }

  const validation = await infoFormStepRef.value?.validateTenant?.();
  if (!validation?.valid || !infoDialog.tenantId) {
    showNotification(validation?.errors?.[0] || t("请完善租户基础信息"), { type: "error" });
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
    showNotification(t("租户信息更新成功"), { type: "success" });
    infoDialog.visible = false;
    await fetchData();
  } finally {
    infoDialog.confirmLoading = false;
  }
}

/**
 * 提交项目管理对话框
 */
async function handleSubmitProjectDialog() {
  // 防止重复提交（防重入，参考user中的防抖）
  if (projectDialog.confirmLoading) {
    return;
  }

  if (!projectDialog.tenantId) {
    showNotification(t("租户信息不存在"), { type: "warning" });
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
    showNotification(t("关联项目更新成功"), { type: "success" });
    projectDialog.visible = false;
    await fetchData();
  } finally {
    projectDialog.confirmLoading = false;
  }
}

/**
 * 删除租户
 * @param id
 */
async function handleDelete(id?: string) {
  const userIds = id !== undefined ? [id] : selectIds.value;
  if (!userIds || userIds.length === 0) {
    showNotification(t("请勾选删除项"), { type: "warning" });
    return;
  }

  ElMessageBox.confirm(t("删除租户的同时会解绑该租户的所有设备，确定删除租户?"), t("警告"), {
    confirmButtonText: t("确定"),
    cancelButtonText: t("取消"),
    type: "warning",
    buttonSize: "small",
    closeOnClickModal: false,
  }).then(function () {
    loading.value = true;
    Promise.all(userIds.map((item) => TenantGateway.deleteV2(String(item))))
      .then(() => {
        showNotification(t("删除成功"), { type: "success" });
        handleQuery();
      })
      .finally(() => (loading.value = false));
  });
}

/**
 * 打开绑定设备对话框
 * @param row
 */
function handleOpenBindDeviceDialog(row: TenantTableRowModel) {
  if (!canBindDevice.value) return;
  bindDeviceDialog.visible = true;
  bindDeviceDialog.currentTenant = row;
}

/************************* 表格列显示/隐藏 *************************/
const TENANT_TABLE_COLUMN_STORAGE_KEY = "tenant_manage_table_columns";

const TABLE_COLUMN_LABEL = {
  selection: "选择",
  tenantName: "租户名",
  contactName: "联系人",
  contactPhone: "手机号",
  contactEmail: "邮箱",
  status: "状态",
  expireAt: "到期时间",
  createdAt: "创建时间",
  actions: "操作",
} as const;

const buildTableColumns = () => {
  t("选择");
  t("租户名");
  t("联系人");
  t("手机号");
  t("邮箱");
  t("状态");
  t("到期时间");
  t("创建时间");
  t("操作");

  return [
    { prop: "selection", label: TABLE_COLUMN_LABEL.selection, required: true },
    { prop: "tenantName", label: TABLE_COLUMN_LABEL.tenantName, visible: true },
    { prop: "contactName", label: TABLE_COLUMN_LABEL.contactName, visible: false },
    { prop: "contactPhone", label: TABLE_COLUMN_LABEL.contactPhone, visible: true },
    { prop: "contactEmail", label: TABLE_COLUMN_LABEL.contactEmail, visible: true },
    { prop: "status", label: TABLE_COLUMN_LABEL.status, visible: true },
    { prop: "expireAt", label: TABLE_COLUMN_LABEL.expireAt, visible: true },
    { prop: "createdAt", label: TABLE_COLUMN_LABEL.createdAt, visible: false },
    { prop: "actions", label: TABLE_COLUMN_LABEL.actions, required: true },
  ];
};

const tableColumns = ref(buildTableColumns());
const selectedColumns = ref<string[]>([]);

const visibleColumns = computed(() => {
  return tableColumns.value.filter(
    (column) => selectedColumns.value.includes(column.prop) || column.required
  );
});

const getDefaultSelectedColumns = () => {
  return tableColumns.value
    .filter((column) => !column.required && column.visible !== false)
    .map((column) => column.prop);
};

const initSelectedColumns = () => {
  const savedColumns = localStorage.getItem(TENANT_TABLE_COLUMN_STORAGE_KEY);
  const validProps = new Set(tableColumns.value.map((column) => column.prop));

  if (savedColumns) {
    try {
      const parsed = JSON.parse(savedColumns) as string[];
      const filtered = parsed.filter((prop) => validProps.has(prop));
      selectedColumns.value = filtered.length > 0 ? filtered : getDefaultSelectedColumns();
      return;
    } catch {
      // 非法缓存回退默认列
    }
  }

  selectedColumns.value = getDefaultSelectedColumns();
};

watch(
  selectedColumns,
  (newVal) => {
    localStorage.setItem(TENANT_TABLE_COLUMN_STORAGE_KEY, JSON.stringify(newVal));
  },
  { deep: true }
);

onMounted(() => {
  initSelectedColumns();
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

.column-filter-wrap {
  display: inline-flex;
  align-items: center;
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

/* 已迁移到通用 `ActivationDialog`，保留此处仅用于历史 diff 对照 */
</style>
