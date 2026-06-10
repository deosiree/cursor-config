<!-- 用户管理 -->
<template>
  <div class="app-container user-manage">
    <el-card shadow="hover" class="bg-white bottom-container data-table h-full">
      <!-- 用户搜索 -->
      <UserSearchBar
        :query="queryParams"
        :role-options="roleOptions"
        :perms="toolbarPerms"
        :disable-delete="selectIds.length === 0"
        @search="handleQuery"
        @add="handleOpenDialog()"
        @delete-selected="handleDelete()"
      >
        <!-- 列过滤组件：v-hasPerm 须包在原生节点上，避免挂在 ColumnFilter 根组件 -->
        <template #actions-extra>
          <span v-if="toolbarPerms.query" class="column-filter-wrap">
            <ColumnFilter v-model="selectedColumns" :columns="tableColumns" />
          </span>
        </template>
      </UserSearchBar>

      <div class="user-list-page__body">
        <!-- 用户表格 -->
        <UserTable
          :data="pageData"
          :loading="loading"
          :visible-columns="visibleColumns"
          :current-user-id="currentUserId"
          @selection-change="handleSelectionChange"
          @edit="handleOpenDialog"
          @delete="(row) => handleDelete(row.id)"
          @disable="handleDisableUser"
          @enable="handleEnableUser"
          @unlock="handleUnlockUser"
          @resend-activation="handleOpenActivateDialog"
          @reset-password="handleOpenResetDialog"
        />
      </div>

      <div class="user-list-page__pagination">
        <Pagination
          v-if="total > 0"
          v-model:total="total"
          v-model:page="queryParams.page"
          v-model:limit="queryParams.pageSize"
          @pagination="fetchData"
        />
      </div>
    </el-card>
    <!-- 用户编辑 -->
    <UserEditDialog
      ref="userFormRef"
      v-model="dialog.visible"
      :title="dialog.title"
      :model="formData"
      :rules="rules"
      :role-options="roleOptions"
      :activation-method="createActivationMethod"
      :show-password-fields="createFieldPolicy.showPasswordFields"
      @update:activation-method="createActivationMethod = $event"
      @submit="handleSubmit"
      @role-change="handleRoleChange"
      @closed="handleDialogClosed"
    />
    <!-- 用户重置密码 -->
    <UserResetPasswordDialog
      ref="resetFormRef"
      v-model="resetDialog.visible"
      :title="resetDialog.title"
      :model="resetForm"
      @submit="handleResetSubmit"
      @closed="handleResetDialogClosed"
    />
    <!-- 激活页面 -->
    <ActivationDialog
      :model-value="activationDialogVisible"
      :result="activationDialogResult"
      @update:model-value="activationDialogVisible = $event"
      @closed="resetActivationDialog"
    />
  </div>
</template>

<script setup lang="ts">
import UserGateway from "@/gateway/system/user.gateway";
import type { ActivationDialogResult } from "@/types/activation";
import type {
  UserEditForm,
  UserListItem,
  UserListQuery,
  UserResetPasswordForm,
} from "@/types/user";
import {
  createEmailRules,
  createPhoneRequiredRules,
  createRoleIdRules,
  createUserNameRules,
  NAME_MAX_LENGTH,
  normName,
} from "@/utils/formRules";
import RoleGateway from "@/gateway/system/role/role.gateway";
import Pagination from "@/components/Pagination/index.vue";
import UserSearchBar from "@/views/system/user/components/UserSearchBar.vue";
import UserTable from "@/views/system/user/components/UserTable.vue";
import UserEditDialog from "@/views/system/user/components/UserEditDialog.vue";
import UserResetPasswordDialog from "@/views/system/user/components/UserResetPasswordDialog.vue";
import ActivationDialog from "@/views/components/Activation/ActivationDialog.vue";
import { resolvePasswordByLoginSetting } from "@/gateway/auth/password-transit.gateway";
import type { ActivationMethodStable } from "@/types/security-config";
import { mapUserToListItem, type UserInfo, type UserOptionItem } from "./user.models";
import { getUserActivationFieldPolicy } from "./user-activation";

defineOptions({
  name: "User",
  inheritAttrs: false,
});
import { showNotification } from "@/utils/notification";

import { Storage } from "@/utils/storage";
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { checkHasPerm } from "@/directive/permission";

const userFormRef = ref<InstanceType<typeof UserEditDialog> | null>(null);
const { t } = useI18n();

const toolbarPerms = computed(() => ({
  query: checkHasPerm("sys:user:query"),
  add: checkHasPerm("sys:user:add"),
  delete: checkHasPerm("sys:user:delete"),
}));

const queryParams = reactive<UserListQuery>({
  page: 1,
  pageSize: 20,
});

const pageData = ref<UserListItem[]>();
const total = ref(0);
const loading = ref(false);

const dialog = reactive({
  visible: false,
  title: t("新增用户"),
});

const formData = reactive<UserEditForm>({
  tenantId: undefined,
  roleId: undefined,
  confirmPassword: "",
});

// 重置密码相关状态与方法
const resetDialog = reactive({
  visible: false,
  title: t("重置密码"),
});
const resetFormRef = ref<InstanceType<typeof UserResetPasswordDialog> | null>(null);
const resetForm = reactive<UserResetPasswordForm>({
  id: undefined,
  password: undefined,
  confirmPassword: undefined,
});
const createActivationMethod = ref<ActivationMethodStable>("email");
const activationDialogVisible = ref(false);
const activationDialogResult = ref<ActivationDialogResult | null>(null);

/**
 * 打开激活对话框
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

/**
 * 打开重置密码对话框
 * @param row 用户信息
 */
function handleOpenResetDialog(row: UserListItem) {
  if (!row?.id) return;
  if (isCurrentUser(row.id)) {
    showNotification(t("不能重置自己的密码"), { type: "warning" });
    return;
  }
  resetForm.id = row.id;
  resetForm.password = undefined;
  resetForm.confirmPassword = undefined;
  resetDialog.title = `【${row.userName}】${t("重置密码")}`;
  resetDialog.visible = true;
  nextTick(() => {
    resetFormRef.value?.clearValidate();
  });
}

/**
 * 提交“重置密码”（防抖）。
 *
 * 关键点：密码是否需要“传输加密”由服务端 loginSetting 决策，统一通过网关层解析，避免页面散落加密逻辑。
 *
 * @returns Promise<void>
 */
const handleResetSubmit = useDebounceFn(async () => {
  const validatePromise = resetFormRef.value?.validate?.();
  if (!validatePromise) return;
  const valid = await validatePromise.catch(() => false);
  if (!valid) return;
  if (!resetForm.id) return;

  if (!resetForm.password) {
    showNotification(t("密码不能为空"), { type: "warning" });
    return;
  }

  const payload: { id: string; password?: string } = { id: resetForm.id };
  // 统一按服务端策略处理“密码传输加密”，并将错误码直接反馈给用户
  const passwordResult = await resolvePasswordByLoginSetting(resetForm.password);
  if (!passwordResult.ok) {
    // showNotification(passwordResult.code, { type: "error" });// 由统一拦截器showNotification处理
    return;
  }
  payload.password = passwordResult.password;

  loading.value = true;
  try {
    await UserGateway.resetPassword({
      id: resetForm.id,
      password: payload.password,
    });
    showNotification(t("重置密码成功"), { type: "success" });
    resetDialog.visible = false;
    await fetchData();
  } catch (error) {
    console.error("重置密码失败:", error);
  } finally {
    loading.value = false;
  }
}, 1000);

/**
 * 关闭重置密码对话框
 */
function handleResetDialogClosed() {
  resetFormRef.value?.resetFields();
  resetForm.id = undefined;
  resetForm.password = undefined;
  resetForm.confirmPassword = undefined;
}

/**
 * 打开重发激活链接对话框
 * @param row 用户信息
 */
async function handleOpenActivateDialog(row: UserListItem) {
  if (!row?.id) return;
  await resendActivationForCurrentUser(row.id);
}

const createFieldPolicy = computed(() =>
  getUserActivationFieldPolicy(createActivationMethod.value, Boolean(formData.id))
);

const rules = computed(() => ({
  userName: createUserNameRules(),
  email: [{ required: true, message: t("邮箱不能为空"), trigger: "blur" }, ...createEmailRules()],
  phone: createPhoneRequiredRules(),
  roleId: createRoleIdRules(),
}));

// 选中的用户ID
const selectIds = ref<Array<string | number>>([]);
// 角色下拉数据源

const roleOptions = ref<UserOptionItem[]>();

// 当前登录用户ID
const currentUserId = ref<string | undefined>();

// 判断是否是当前用户
function isCurrentUser(userId: string | undefined): boolean {
  if (!userId) return false;
  const userInfo = Storage.sessionGet<UserInfo>("userInfo");
  if (!userInfo) return false;
  return userId === userInfo.id;
}

// 获取数据
async function fetchData() {
  if (!toolbarPerms.value.query) {
    pageData.value = [];
    total.value = 0;
    return;
  }
  loading.value = true;
  try {
    const data = await UserGateway.getPage({
      page: queryParams.page,
      pageSize: queryParams.pageSize,
      keywords: queryParams.userName?.trim() || undefined,
      status: queryParams.status,
      roleId: queryParams.roleId,
    });
    pageData.value = (data?.list ?? []).map(mapUserToListItem);
    total.value = data?.totalCount ?? data?.total ?? 0;
  } finally {
    loading.value = false;
  }
}

// 查询（重置页码后获取数据）
function handleQuery() {
  queryParams.page = 1;
  fetchData();
}

// 选中项发生变化
function handleSelectionChange(selection: UserListItem[]) {
  selectIds.value = selection.map((item) => item.id);
}

// 角色变化处理
function handleRoleChange() {
  formData.tenantId = undefined;
}

// 停用用户
function handleDisableUser(row: UserListItem) {
  if (isCurrentUser(row.id)) {
    showNotification(t("不能停用自己的账户"), { type: "warning" });
    return;
  }
  if (row.isOwner) {
    showNotification(t("不能停用租户所有者"), { type: "warning" });
    return;
  }
  ElMessageBox.confirm(t("确认停用该用户?停用之后无法登录"), t("警告"), {
    confirmButtonText: t("确定"),
    cancelButtonText: t("取消"),
    type: "warning",
    buttonSize: "small",
    closeOnClickModal: false,
  }).then(() => {
    UserGateway.disableUser({ id: row.id }).then(() => {
      showNotification(t("停用成功"), { type: "success" });
      fetchData();
    });
  });
}

// 启用用户
function handleEnableUser(row: UserListItem) {
  if (isCurrentUser(row.id)) {
    showNotification(t("不能启用自己的账户"), { type: "warning" });
    return;
  }
  if (row.isOwner) {
    showNotification(t("不能启用租户所有者"), { type: "warning" });
    return;
  }
  UserGateway.enableUser({ id: row.id }).then(() => {
    showNotification(t("启用成功"), { type: "success" });
    fetchData();
  });
}

// 解锁用户
function handleUnlockUser(row: UserListItem) {
  if (isCurrentUser(row.id)) {
    showNotification(t("不能解锁自己的账户"), { type: "warning" });
    return;
  }
  if (row.isOwner) {
    showNotification(t("不能操作租户所有者"), { type: "warning" });
    return;
  }
  ElMessageBox.confirm(t("确认解锁该用户？解锁后用户可重新尝试登录"), t("提示"), {
    confirmButtonText: t("确定"),
    cancelButtonText: t("取消"),
    type: "warning",
    buttonSize: "small",
    closeOnClickModal: false,
  }).then(() => {
    UserGateway.unlockUser({ id: row.id }).then(() => {
      showNotification(t("解锁成功"), { type: "success" });
      fetchData();
    });
  });
}

/**
 * 重发用户激活链接并复用统一激活反馈弹窗。
 *
 * @param userId 用户 ID
 */
async function resendActivationForCurrentUser(userId?: string) {
  if (!userId) return;

  loading.value = true;
  try {
    const res = await UserGateway.resendActivation({ id: userId });

    if (res.activationUrl) {
      openActivationDialog(res);
    } else {
      showNotification(t(res.activationMsg), { type: "success" });
    }

    await fetchData();
  } catch (error) {
    console.error("重发激活链接失败:", error);
  } finally {
    loading.value = false;
  }
}

/**
 * 获取角色下拉数据源
 */
async function fetchRoleOptions() {
  try {
    roleOptions.value = await RoleGateway.getOptions();
  } catch (error) {
    console.error("获取角色数据失败:", error);
  }
}

/**
 * 打开弹窗
 *
 * @param id 用户ID
 */
async function handleOpenDialog(row?: UserEditForm) {
  // 如果是编辑模式且是租户所有者但不是当前用户，则不允许编辑
  if (row && row.id) {
    // 需要从 pageData 中找到对应的行数据来检查角色
    const rowData = pageData.value?.find((item) => item.id === row.id);
    if (rowData?.isOwner && !isCurrentUser(rowData.id)) {
      showNotification(t("不能编辑租户所有者"), { type: "warning" });
      return;
    }
    // 当前用户可以编辑自己（包括租户所有者自己）
  }

  // 打开弹窗时获取最新角色配置
  await fetchRoleOptions();

  dialog.visible = true;
  if (row && row.id) {
    dialog.title = `【${row.userName}】${t("编辑用户")}`;
    // 编辑时回填数据
    // 处理 tenantId：如果是 "0" 或无效值，设置为 undefined
    const tenantId = row.tenantId && row.tenantId !== "0" ? row.tenantId : undefined;

    Object.assign(formData, {
      id: row.id,
      isOwner: row.isOwner,
      userName: row.userName,
      phone: row.phone,
      email: row.email,
      roleId: row.roleId?.toString(), // 转换为字符串以匹配下拉框的value类型
      tenantId, // 处理 0 值，避免显示 "0"
      // 编辑时不回填密码
      password: undefined,
      confirmPassword: undefined,
    });
  } else {
    dialog.title = t("新增用户");
    createActivationMethod.value = "email";
    // 新增时重置表单
    Object.assign(formData, {
      id: undefined,
      isOwner: undefined,
      userName: undefined,
      phone: undefined,
      email: undefined,
      roleId: undefined,
      tenantId: undefined,
      password: undefined,
      confirmPassword: undefined,
    });
  }
}

// 对话框完全关闭后清空表单（用户看不到清空过程）
function handleDialogClosed() {
  userFormRef.value?.resetFields();
  userFormRef.value?.clearValidate();
  formData.id = undefined;
  formData.isOwner = undefined;
  createActivationMethod.value = "email";
}

/**
 * 提交用户表单（新增/编辑，防抖）。
 *
 * @returns Promise<void>
 */
const handleSubmit = useDebounceFn(async () => {
  const isValid = await userFormRef.value?.validate().catch(() => false);
  if (!isValid) return;

  const isEditMode = !!formData.id;
  const submitData = { ...formData };

  const normalizedUserName = normName(submitData.userName, NAME_MAX_LENGTH.username);
  submitData.userName = normalizedUserName;

  // 删除确认密码字段，不传给后端
  delete submitData.confirmPassword;

  if (createFieldPolicy.value.requirePassword && submitData.password) {
    // 新增/编辑时的密码同样走“传输加密”统一策略，避免与登录/改密逻辑分叉
    const passwordResult = await resolvePasswordByLoginSetting(submitData.password);
    if (!passwordResult.ok) {
      showNotification(passwordResult.code, { type: "error" });
      return;
    }
    submitData.password = passwordResult.password;
  }

  // 新增模式下，如果激活方式为密码直设，密码为空则提示错误
  if (!isEditMode && createFieldPolicy.value.requirePassword && !submitData.password) {
    showNotification(t("新增用户时密码不能为空"), { type: "warning" });
    return;
  }

  loading.value = true;
  try {
    if (isEditMode) {
      await UserGateway.update({
        id: String(submitData.id),
        userName: submitData.userName ?? "",
        email: submitData.email,
        phone: submitData.phone,
        roleId: submitData.roleId ? String(submitData.roleId) : undefined,
      });
    } else {
      const createUserName = submitData.userName?.trim();
      if (!createUserName) {
        showNotification(t("用户名不能为空"), { type: "warning" });
        loading.value = false;
        return;
      }
      const createRes = await UserGateway.create({
        userName: createUserName,
        password: createFieldPolicy.value.requirePassword ? (submitData.password ?? "") : undefined,
        email: submitData.email,
        phone: submitData.phone,
        roleId: submitData.roleId ? String(submitData.roleId) : undefined,
        activationMethod: createActivationMethod.value,
      });

      if (createRes.activationUrl) {
        openActivationDialog(createRes);
      }
    }

    showNotification(isEditMode ? t("修改用户成功") : t("新增用户成功"), {
      type: "success",
    });
    dialog.visible = false;
    await fetchData();
  } catch (error) {
    console.error("提交用户失败:", error);
  } finally {
    loading.value = false;
  }
}, 1000);

/**
 * 删除用户
 *
 * @param id  用户ID
 */
function handleDelete(id?: string | number) {
  const userIds = id !== undefined ? [id] : selectIds.value;
  if (!userIds) {
    showNotification(t("请勾选删除项"), { type: "warning" });
    return;
  }

  // 检查是否包含当前用户
  const hasCurrentUser = userIds.some((userId) => isCurrentUser(userId?.toString()));
  if (hasCurrentUser) {
    showNotification(t("不能删除自己的账户"), { type: "warning" });
    return;
  }

  // 检查是否包含租户所有者
  const hasSuperAdmin = userIds.some((userId) => {
    const row = pageData.value?.find((item) => item.id === userId?.toString());
    return row?.isOwner === true;
  });
  if (hasSuperAdmin) {
    showNotification(t("不能删除租户所有者"), { type: "warning" });
    return;
  }

  ElMessageBox.confirm(t("确认删除用户?"), t("警告"), {
    confirmButtonText: t("确定"),
    cancelButtonText: t("取消"),
    type: "warning",
    buttonSize: "small",
    closeOnClickModal: false,
  }).then(function () {
    loading.value = true;
    UserGateway.deleteByIds(userIds.map((userId) => String(userId)))
      .then(() => {
        showNotification(t("删除成功"), { type: "success" });
        fetchData();
      })
      .finally(() => (loading.value = false));
  });
}

/************************* 表格列显示/隐藏 *************************/
const USER_TABLE_COLUMN_STORAGE_KEY = "user_manage_table_columns";

const TABLE_COLUMN_LABEL = {
  selection: "选择",
  userName: "用户名",
  roleName: "角色",
  phone: "手机号",
  email: "邮箱",
  createdAt: "创建时间",
  status: "状态",
  actions: "操作",
} as const;

const buildTableColumns = () => {
  t("选择");
  t("用户名");
  t("角色");
  t("手机号");
  t("邮箱");
  t("创建时间");
  t("状态");
  t("操作");

  return [
    { prop: "selection", label: TABLE_COLUMN_LABEL.selection, required: true },
    { prop: "userName", label: TABLE_COLUMN_LABEL.userName, visible: true },
    { prop: "roleName", label: TABLE_COLUMN_LABEL.roleName, visible: true },
    { prop: "phone", label: TABLE_COLUMN_LABEL.phone, visible: true },
    { prop: "email", label: TABLE_COLUMN_LABEL.email, visible: true },
    { prop: "createdAt", label: TABLE_COLUMN_LABEL.createdAt, visible: false },
    { prop: "status", label: TABLE_COLUMN_LABEL.status, visible: true },
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
  const savedColumns = localStorage.getItem(USER_TABLE_COLUMN_STORAGE_KEY);
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
    localStorage.setItem(USER_TABLE_COLUMN_STORAGE_KEY, JSON.stringify(newVal));
  },
  { deep: true }
);

onMounted(async () => {
  initSelectedColumns();

  // 获取当前用户信息
  try {
    currentUserId.value = Storage.sessionGet<UserInfo>("userInfo")?.id;
  } catch (error) {
    console.error("获取当前用户信息失败:", error);
  }

  // 加载角色下拉数据源
  await fetchRoleOptions();

  handleQuery();
});
</script>

<style lang="scss" scoped>
.h-full {
  width: 100%;
  height: 100%;
}

/* 搜索区域响应式布局 */
.app-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.user-manage {
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

.user-manage :deep(.base-list-toolbar) {
  flex-shrink: 0;
}

.column-filter-wrap {
  display: inline-flex;
  align-items: center;
}

.user-list-page__body {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.user-list-page__pagination {
  flex-shrink: 0;
}
</style>
