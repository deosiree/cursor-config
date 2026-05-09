<!-- 租户管理 -->
<template>
  <div class="app-container tenant-manage">
    <el-card shadow="hover" class="bg-white bottom-container data-table h-full">
      <BaseListToolbar title="租户列表">
        <template #filters>
          <el-input
            v-model="queryParams.keyword"
            suffix-icon="search"
            placeholder="请输入租户名、联系人、手机号（关键词）"
            clearable
            class="search-input"
            maxlength="20"
            @keyup.enter="handleQuery"
            @clear="handleQuery"
          />
        </template>
        <template #actions>
          <!-- 搜索按钮 -->
          <el-button type="primary" plain icon="search" size="small" @click="handleQuery">
            搜索
          </el-button>
          <el-button
            v-hasPerm="'sys:tenant:add'"
            size="small"
            icon="plus"
            type="primary"
            plain
            @click="handleOpenCreateDialog"
          >
            新建
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
            删除
          </el-button>
        </template>
      </BaseListToolbar>
      <!-- 租户表格 -->
      <TenantTable
        :data="pageData"
        :loading="loading"
        @selection-change="handleSelectionChange"
        @manage-info="handleOpenInfoDialog"
        @manage-project="handleOpenProjectDialog"
        @manage-bind-device="handleOpenBindDeviceDialog"
        @resend-activation="handleResendActivation"
        @delete="(row) => handleDelete(row.id)"
      />
      <!-- 分页 -->
      <Pagination
        v-model:total="total"
        v-model:page="queryParams.page"
        v-model:limit="queryParams.pageSize"
        @pagination="fetchData"
      />
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
      />
      <!-- 步骤3：角色预览 -->
      <TenantRolePreviewStep v-else />

      <template #footer>
        <div class="dialog-footer">
          <el-button size="small" @click="createDialog.visible = false">取消</el-button>
          <el-button
            v-if="createDialog.activeStep > 0"
            size="small"
            @click="createDialog.activeStep -= 1"
          >
            上一步
          </el-button>
          <el-button
            type="primary"
            size="small"
            :loading="createDialog.confirmLoading"
            @click="handleCreateNextOrSubmit"
          >
            {{ createDialog.activeStep < stepConfig.length - 1 ? "下一步" : "确定" }}
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
      :loading="infoDialog.loading"
      :confirm-loading="infoDialog.confirmLoading"
      confirm-text="保存"
      @confirm="handleSubmitInfo"
      @closed="handleInfoDialogClosed"
    >
      <TenantFormStep
        ref="infoFormStepRef"
        :tenant-model="infoTenantForm"
        :owner-model="infoOwnerView"
        tenant-access="write"
        owner-access="read"
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
      confirm-text="保存关联项目"
      @confirm="handleSubmitProjectDialog"
      @closed="handleProjectDialogClosed"
    >
      <TenantProjectSelectStep
        ref="projectSelectRef"
        v-model:selected-ids="projectDialogSelectedIds"
        :options="projectDialogOptions"
      />
    </SinglePaneDialog>
    <!-- 管理边端设备 -->
    <BindDeviceDialog
      v-model:visible="bindDeviceDialog.visible"
      :tenant-id="bindDeviceDialog.currentTenant?.id"
      :tenant-name="bindDeviceDialog.currentTenant?.tenantName"
      @success="fetchData"
    />
  </div>
</template>

<script setup lang="ts">
import type {
  OwnerViewModel,
  TenantInfoFormModel,
  TenantOwnerFormModel,
  TenantTableRowModel,
} from "@/types/tenant";
import type { ActivationDialogResult } from "@/types/activation";
import TenantGateway, { type TenantListV2Request } from "@/gateway/system/tenant/tenant.gateway";
import ConfigGateway from "@/gateway/system/config.gateway";
import BindDeviceDialog from "@/views/tenant/components/BindDeviceDialog.vue";
import TenantTable from "@/views/tenant/components/TenantTable.vue";
import BaseListToolbar from "@/components/ListToolbar/BaseListToolbar.vue";
import Pagination from "@/components/Pagination/index.vue";
import { resolvePasswordByLoginSetting } from "@/gateway/auth/password-transit.gateway";
import { t } from "@/i18n";
import { ElMessageBox } from "element-plus";
import { showNotification } from "@/utils/notification";
import ProjectGateway from "@/gateway/resource/project/project.gateway";
import SinglePaneDialog from "@/components/Dialog/SinglePaneDialog.vue";
import TenantFormStep from "@/views/tenant/components/TenantFormStep.vue";
import TenantProjectSelectStep from "@/views/tenant/components/TenantProjectSelectStep.vue";
import TenantRolePreviewStep from "@/views/tenant/components/TenantRolePreviewStep.vue";
import ActivationDialog from "@/views/components/Activation/ActivationDialog.vue";
import UserGateway from "@/gateway/system/user.gateway";
import { resolveTenantDefaultLocale, resolveTenantDefaultTimezone } from "@/constants/tenant";
import {
  createConfirmPasswordRules,
  passwordRules,
  emailRules,
  phoneRules,
  userNameRules,
} from "@/utils/formRules";
import { getUserActivationFieldPolicy } from "@/views/system/user/user-activation";
import type { ActivationMethodStable } from "@/types/security-config";
import { PLATFORM_PROJECT_ID } from "@/enums";

defineOptions({
  name: "Tenant",
  inheritAttrs: false,
});

type CreateStepStatus = "idle" | "valid" | "invalid";

const stepConfig = [
  { title: "基本信息", description: "填写租户基本信息并设置所有者账号" },
  { title: "关联项目", description: "选择关联的项目" },
  { title: "角色确认", description: "查看默认角色权限" },
];

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
  title: "新增租户",
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
  title: "管理信息",
  tenantId: "",
  loading: false,
  confirmLoading: false, // 防重入的锁
});

const projectDialog = reactive({
  visible: false,
  title: "管理项目",
  tenantId: "",
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

const createFormStepRef = ref<InstanceType<typeof TenantFormStep> | null>(null);
const infoFormStepRef = ref<InstanceType<typeof TenantFormStep> | null>(null);
const bindDeviceDialog = reactive({
  visible: false,
  currentTenant: null as TenantTableRowModel | null,
});
const ownerFieldPolicy = computed(() =>
  getUserActivationFieldPolicy(createActivationMethod.value, false)
);
const ownerRules = computed(() => ({
  userName: userNameRules,
  password: ownerFieldPolicy.value.requirePassword ? passwordRules : [],
  confirmPassword: ownerFieldPolicy.value.requirePassword
    ? createConfirmPasswordRules(() => createOwnerForm.password)
    : [],
  email: [{ required: true, message: "邮箱不能为空", trigger: "blur" }, ...emailRules],
  phone: phoneRules,
}));

/**
 * 获取用户激活方式
 */
async function fetchActivationMode() {
  try {
    const res = await ConfigGateway.detail({});
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
  createDialog.title = t("tenant.addTenant");
  resetCreateFlowState(); // 重置创建流程状态
  resetActivationDialog(); // 重置激活对话框状态
  try {
    await fetchActivationMode(); // 获取用户激活方式
    createProjectOptions.value = await ProjectGateway.getTenantProjectOptionsFilterPt(); // 加载项目选项
    createSelectedProjectIds.value = [PLATFORM_PROJECT_ID]; // 默认必选平台项目
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
  infoDialog.title = row.tenantName ? `【${row.tenantName}】管理信息` : "管理信息";
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
  projectDialog.title = row.tenantName ? `【${row.tenantName}】管理项目` : "管理项目";
  projectDialog.visible = true;

  try {
    const [options, projectsRes] = await Promise.all([
      ProjectGateway.getTenantProjectOptionsFilterPt(), // 获取项目选项
      TenantGateway.getProjectsV2(String(row.id)), // 获取租户项目
    ]);
    projectDialogOptions.value = options; // 项目选项
    projectDialogSelectedIds.value = projectsRes.projectIds ?? []; // 选中的项目ID
  } catch {
    projectDialog.visible = false;
    projectDialogOptions.value = [];
    projectDialogSelectedIds.value = [];
    // showNotification("加载租户项目失败", { type: "error" });// 拦截器统一show了
  } finally {
    projectDialog.loading = false;
  }
}

/**
 * 重发激活链接
 * @param row 租户行数据
 */
async function handleResendActivation(row: TenantTableRowModel) {
  if (!row.ownerId) {
    showNotification("租户所有者信息不存在，无法重发激活链接", { type: "warning" });
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
      showNotification(res.activationMsg, { type: "success" });
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
  projectDialogOptions.value = [];
  projectDialogSelectedIds.value = [];
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
      showNotification(firstError || "请完善基础信息和所有者信息", { type: "error" });
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

    // 2. 调用网关方法
    const createRes = await TenantGateway.createV2({
      tenantForm: createTenantForm,
      ownerForm: createOwnerForm,
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
      showNotification("新增租户成功", { type: "success" });
    }

    await fetchData(); // 重新获取数据
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
    showNotification(validation?.errors?.[0] || "请完善租户基础信息", { type: "error" });
    return;
  }

  infoDialog.confirmLoading = true;
  try {
    await TenantGateway.updateV2({
      tenantId: infoDialog.tenantId,
      tenantForm: infoTenantForm,
    });
    showNotification("租户信息更新成功", { type: "success" });
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
    showNotification("租户信息不存在", { type: "warning" });
    return;
  }

  projectDialog.confirmLoading = true;
  try {
    await TenantGateway.assignProjectsV2({
      tenantId: projectDialog.tenantId,
      projectIds: projectDialogSelectedIds.value,
    });
    showNotification("关联项目更新成功", { type: "success" });
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
    showNotification("请勾选删除项", { type: "warning" });
    return;
  }

  ElMessageBox.confirm("确认删除租户?", "警告", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
    buttonSize: "small",
    closeOnClickModal: false,
  }).then(function () {
    loading.value = true;
    Promise.all(userIds.map((item) => TenantGateway.deleteV2(String(item))))
      .then(() => {
        showNotification("删除成功", { type: "success" });
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
  bindDeviceDialog.visible = true;
  bindDeviceDialog.currentTenant = row;
}

onMounted(() => {
  fetchActivationMode(); // 重新获取激活模式
  handleQuery(); // 重新获取数据
});
</script>

<style lang="scss" scoped>
.search-input {
  flex-shrink: 0;
  width: 150px;
  min-width: 250px;
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
