<!-- 鐢ㄦ埛绠＄悊 -->
<template>
  <div class="app-container user-manage">
    <el-card shadow="hover" class="bg-white bottom-container data-table h-full">
      <!-- 鐢ㄦ埛鎼滅储 -->
      <UserSearchBar
        :query="queryParams"
        :role-options="roleOptions"
        :perms="toolbarPerms"
        :disable-delete="selectIds.length === 0"
        @search="handleQuery"
        @add="handleOpenDialog()"
        @delete-selected="handleDelete()"
      />

      <div class="user-list-page__body">
        <!-- 鐢ㄦ埛琛ㄦ牸 -->
        <UserTable
          :data="pageData"
          :loading="loading"
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
    <!-- 鐢ㄦ埛缂栬緫 -->
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
    <!-- 鐢ㄦ埛閲嶇疆瀵嗙爜 -->
    <UserResetPasswordDialog
      ref="resetFormRef"
      v-model="resetDialog.visible"
      :title="resetDialog.title"
      :model="resetForm"
      @submit="handleResetSubmit"
      @closed="handleResetDialogClosed"
    />
    <!-- 婵€娲婚〉闈?-->
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
  title: t("鏂板鐢ㄦ埛"),
});

const formData = reactive<UserEditForm>({
  tenantId: undefined,
  roleId: undefined,
  confirmPassword: "",
});

// 閲嶇疆瀵嗙爜鐩稿叧鐘舵€佷笌鏂规硶
const resetDialog = reactive({
  visible: false,
  title: t("閲嶇疆瀵嗙爜"),
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
 * 鎵撳紑婵€娲诲璇濇
 */
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

/**
 * 鎵撳紑閲嶇疆瀵嗙爜瀵硅瘽妗? * @param row 鐢ㄦ埛淇℃伅
 */
function handleOpenResetDialog(row: UserListItem) {
  if (!row?.id) return;
  if (isCurrentUser(row.id)) {
    showNotification(t("涓嶈兘閲嶇疆鑷繁鐨勫瘑鐮?), { type: "warning" });
    return;
  }
  resetForm.id = row.id;
  resetForm.password = undefined;
  resetForm.confirmPassword = undefined;
  resetDialog.title = `銆?{row.userName}銆?{t("閲嶇疆瀵嗙爜")}`;
  resetDialog.visible = true;
  nextTick(() => {
    resetFormRef.value?.clearValidate();
  });
}

/**
 * 鎻愪氦鈥滈噸缃瘑鐮佲€濓紙闃叉姈锛夈€? *
 * 鍏抽敭鐐癸細瀵嗙爜鏄惁闇€瑕佲€滀紶杈撳姞瀵嗏€濈敱鏈嶅姟绔?loginSetting 鍐崇瓥锛岀粺涓€閫氳繃缃戝叧灞傝В鏋愶紝閬垮厤椤甸潰鏁ｈ惤鍔犲瘑閫昏緫銆? *
 * @returns Promise<void>
 */
const handleResetSubmit = useDebounceFn(async () => {
  const validatePromise = resetFormRef.value?.validate?.();
  if (!validatePromise) return;
  const valid = await validatePromise.catch(() => false);
  if (!valid) return;
  if (!resetForm.id) return;

  if (!resetForm.password) {
    showNotification(t("瀵嗙爜涓嶈兘涓虹┖"), { type: "warning" });
    return;
  }

  const payload: { id: string; password?: string } = { id: resetForm.id };
  // 缁熶竴鎸夋湇鍔＄绛栫暐澶勭悊鈥滃瘑鐮佷紶杈撳姞瀵嗏€濓紝骞跺皢閿欒鐮佺洿鎺ュ弽棣堢粰鐢ㄦ埛
  const passwordResult = await resolvePasswordByLoginSetting(resetForm.password);
  if (!passwordResult.ok) {
    // showNotification(passwordResult.code, { type: "error" });// 鐢辩粺涓€鎷︽埅鍣╯howNotification澶勭悊
    return;
  }
  payload.password = passwordResult.password;

  loading.value = true;
  try {
    await UserGateway.resetPassword({
      id: resetForm.id,
      password: payload.password,
    });
    showNotification(t("閲嶇疆瀵嗙爜鎴愬姛"), { type: "success" });
    resetDialog.visible = false;
    await fetchData();
  } catch (error) {
    console.error("閲嶇疆瀵嗙爜澶辫触:", error);
  } finally {
    loading.value = false;
  }
}, 1000);

/**
 * 鍏抽棴閲嶇疆瀵嗙爜瀵硅瘽妗? */
function handleResetDialogClosed() {
  resetFormRef.value?.resetFields();
  resetForm.id = undefined;
  resetForm.password = undefined;
  resetForm.confirmPassword = undefined;
}

/**
 * 鎵撳紑閲嶅彂婵€娲婚摼鎺ュ璇濇
 * @param row 鐢ㄦ埛淇℃伅
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
  email: [{ required: true, message: t("閭涓嶈兘涓虹┖"), trigger: "blur" }, ...createEmailRules()],
  phone: createPhoneRequiredRules(),
  roleId: createRoleIdRules(),
}));

// 閫変腑鐨勭敤鎴稩D
const selectIds = ref<Array<string | number>>([]);
// 瑙掕壊涓嬫媺鏁版嵁婧?
const roleOptions = ref<UserOptionItem[]>();

// 褰撳墠鐧诲綍鐢ㄦ埛ID
const currentUserId = ref<string | undefined>();

// 鍒ゆ柇鏄惁鏄綋鍓嶇敤鎴?function isCurrentUser(userId: string | undefined): boolean {
  if (!userId) return false;
  const userInfo = Storage.sessionGet<UserInfo>("userInfo");
  if (!userInfo) return false;
  return userId === userInfo.id;
}

// 鑾峰彇鏁版嵁
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

// 鏌ヨ锛堥噸缃〉鐮佸悗鑾峰彇鏁版嵁锛?function handleQuery() {
  queryParams.page = 1;
  fetchData();
}

// 閫変腑椤瑰彂鐢熷彉鍖?function handleSelectionChange(selection: UserListItem[]) {
  selectIds.value = selection.map((item) => item.id);
}

// 瑙掕壊鍙樺寲澶勭悊
function handleRoleChange() {
  formData.tenantId = undefined;
}

// 鍋滅敤鐢ㄦ埛
function handleDisableUser(row: UserListItem) {
  if (isCurrentUser(row.id)) {
    showNotification(t("涓嶈兘鍋滅敤鑷繁鐨勮处鎴?), { type: "warning" });
    return;
  }
  if (row.isOwner) {
    showNotification(t("涓嶈兘鍋滅敤绉熸埛鎵€鏈夎€?), { type: "warning" });
    return;
  }
  ElMessageBox.confirm(t("纭鍋滅敤璇ョ敤鎴?鍋滅敤涔嬪悗鏃犳硶鐧诲綍"), t("璀﹀憡"), {
    confirmButtonText: t("纭畾"),
    cancelButtonText: t("鍙栨秷"),
    type: "warning",
    buttonSize: "small",
    closeOnClickModal: false,
  }).then(() => {
    UserGateway.disableUser({ id: row.id }).then(() => {
      showNotification(t("鍋滅敤鎴愬姛"), { type: "success" });
      fetchData();
    });
  });
}

// 鍚敤鐢ㄦ埛
function handleEnableUser(row: UserListItem) {
  if (isCurrentUser(row.id)) {
    showNotification(t("涓嶈兘鍚敤鑷繁鐨勮处鎴?), { type: "warning" });
    return;
  }
  if (row.isOwner) {
    showNotification(t("涓嶈兘鍚敤绉熸埛鎵€鏈夎€?), { type: "warning" });
    return;
  }
  UserGateway.enableUser({ id: row.id }).then(() => {
    showNotification(t("鍚敤鎴愬姛"), { type: "success" });
    fetchData();
  });
}

// 瑙ｉ攣鐢ㄦ埛
function handleUnlockUser(row: UserListItem) {
  if (isCurrentUser(row.id)) {
    showNotification(t("涓嶈兘瑙ｉ攣鑷繁鐨勮处鎴?), { type: "warning" });
    return;
  }
  if (row.isOwner) {
    showNotification(t("涓嶈兘鎿嶄綔绉熸埛鎵€鏈夎€?), { type: "warning" });
    return;
  }
  ElMessageBox.confirm(t("纭瑙ｉ攣璇ョ敤鎴凤紵瑙ｉ攣鍚庣敤鎴峰彲閲嶆柊灏濊瘯鐧诲綍"), t("鎻愮ず"), {
    confirmButtonText: t("纭畾"),
    cancelButtonText: t("鍙栨秷"),
    type: "warning",
    buttonSize: "small",
    closeOnClickModal: false,
  }).then(() => {
    UserGateway.unlockUser({ id: row.id }).then(() => {
      showNotification(t("瑙ｉ攣鎴愬姛"), { type: "success" });
      fetchData();
    });
  });
}

/**
 * 閲嶅彂鐢ㄦ埛婵€娲婚摼鎺ュ苟澶嶇敤缁熶竴婵€娲诲弽棣堝脊绐椼€? *
 * @param userId 鐢ㄦ埛 ID
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
    console.error("閲嶅彂婵€娲婚摼鎺ュけ璐?", error);
  } finally {
    loading.value = false;
  }
}

/**
 * 鑾峰彇瑙掕壊涓嬫媺鏁版嵁婧? */
async function fetchRoleOptions() {
  try {
    roleOptions.value = await RoleGateway.getOptions();
  } catch (error) {
    console.error("鑾峰彇瑙掕壊鏁版嵁澶辫触:", error);
  }
}

/**
 * 鎵撳紑寮圭獥
 *
 * @param id 鐢ㄦ埛ID
 */
async function handleOpenDialog(row?: UserEditForm) {
  // 濡傛灉鏄紪杈戞ā寮忎笖鏄鎴锋墍鏈夎€呬絾涓嶆槸褰撳墠鐢ㄦ埛锛屽垯涓嶅厑璁哥紪杈?  if (row && row.id) {
    // 闇€瑕佷粠 pageData 涓壘鍒板搴旂殑琛屾暟鎹潵妫€鏌ヨ鑹?    const rowData = pageData.value?.find((item) => item.id === row.id);
    if (rowData?.isOwner && !isCurrentUser(rowData.id)) {
      showNotification(t("涓嶈兘缂栬緫绉熸埛鎵€鏈夎€?), { type: "warning" });
      return;
    }
    // 褰撳墠鐢ㄦ埛鍙互缂栬緫鑷繁锛堝寘鎷鎴锋墍鏈夎€呰嚜宸憋級
  }

  // 鎵撳紑寮圭獥鏃惰幏鍙栨渶鏂拌鑹查厤缃?  await fetchRoleOptions();

  dialog.visible = true;
  if (row && row.id) {
    dialog.title = `銆?{row.userName}銆?{t("缂栬緫鐢ㄦ埛")}`;
    // 缂栬緫鏃跺洖濉暟鎹?    // 澶勭悊 tenantId锛氬鏋滄槸 "0" 鎴栨棤鏁堝€硷紝璁剧疆涓?undefined
    const tenantId = row.tenantId && row.tenantId !== "0" ? row.tenantId : undefined;

    Object.assign(formData, {
      id: row.id,
      isOwner: row.isOwner,
      userName: row.userName,
      phone: row.phone,
      email: row.email,
      roleId: row.roleId?.toString(), // 杞崲涓哄瓧绗︿覆浠ュ尮閰嶄笅鎷夋鐨剉alue绫诲瀷
      tenantId, // 澶勭悊 0 鍊硷紝閬垮厤鏄剧ず "0"
      // 缂栬緫鏃朵笉鍥炲～瀵嗙爜
      password: undefined,
      confirmPassword: undefined,
    });
  } else {
    dialog.title = t("娣诲姞鐢ㄦ埛");
    createActivationMethod.value = "email";
    // 鏂板鏃堕噸缃〃鍗?    Object.assign(formData, {
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

// 瀵硅瘽妗嗗畬鍏ㄥ叧闂悗娓呯┖琛ㄥ崟锛堢敤鎴风湅涓嶅埌娓呯┖杩囩▼锛?function handleDialogClosed() {
  userFormRef.value?.resetFields();
  userFormRef.value?.clearValidate();
  formData.id = undefined;
  formData.isOwner = undefined;
  createActivationMethod.value = "email";
}

/**
 * 鎻愪氦鐢ㄦ埛琛ㄥ崟锛堟柊澧?缂栬緫锛岄槻鎶栵級銆? *
 * @returns Promise<void>
 */
const handleSubmit = useDebounceFn(async () => {
  const isValid = await userFormRef.value?.validate().catch(() => false);
  if (!isValid) return;

  const isEditMode = !!formData.id;
  const submitData = { ...formData };

  const normalizedUserName = normName(submitData.userName, NAME_MAX_LENGTH.username);
  submitData.userName = normalizedUserName;

  // 鍒犻櫎纭瀵嗙爜瀛楁锛屼笉浼犵粰鍚庣
  delete submitData.confirmPassword;

  if (createFieldPolicy.value.requirePassword && submitData.password) {
    // 鏂板/缂栬緫鏃剁殑瀵嗙爜鍚屾牱璧扳€滀紶杈撳姞瀵嗏€濈粺涓€绛栫暐锛岄伩鍏嶄笌鐧诲綍/鏀瑰瘑閫昏緫鍒嗗弶
    const passwordResult = await resolvePasswordByLoginSetting(submitData.password);
    if (!passwordResult.ok) {
      showNotification(passwordResult.code, { type: "error" });
      return;
    }
    submitData.password = passwordResult.password;
  }

  // 鏂板妯″紡涓嬶紝濡傛灉婵€娲绘柟寮忎负瀵嗙爜鐩磋锛屽瘑鐮佷负绌哄垯鎻愮ず閿欒
  if (!isEditMode && createFieldPolicy.value.requirePassword && !submitData.password) {
    showNotification(t("鏂板鐢ㄦ埛鏃跺瘑鐮佷笉鑳戒负绌?), { type: "warning" });
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
        showNotification(t("鐢ㄦ埛鍚嶄笉鑳戒负绌?), { type: "warning" });
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

    showNotification(isEditMode ? t("淇敼鐢ㄦ埛鎴愬姛") : t("鏂板鐢ㄦ埛鎴愬姛"), {
      type: "success",
    });
    dialog.visible = false;
    await fetchData();
  } catch (error) {
    console.error("鎻愪氦鐢ㄦ埛澶辫触:", error);
  } finally {
    loading.value = false;
  }
}, 1000);

/**
 * 鍒犻櫎鐢ㄦ埛
 *
 * @param id  鐢ㄦ埛ID
 */
function handleDelete(id?: string | number) {
  const userIds = id !== undefined ? [id] : selectIds.value;
  if (!userIds) {
    showNotification(t("璇峰嬀閫夊垹闄ら」"), { type: "warning" });
    return;
  }

  // 妫€鏌ユ槸鍚﹀寘鍚綋鍓嶇敤鎴?  const hasCurrentUser = userIds.some((userId) => isCurrentUser(userId?.toString()));
  if (hasCurrentUser) {
    showNotification(t("涓嶈兘鍒犻櫎鑷繁鐨勮处鎴?), { type: "warning" });
    return;
  }

  // 妫€鏌ユ槸鍚﹀寘鍚鎴锋墍鏈夎€?  const hasSuperAdmin = userIds.some((userId) => {
    const row = pageData.value?.find((item) => item.id === userId?.toString());
    return row?.isOwner === true;
  });
  if (hasSuperAdmin) {
    showNotification(t("涓嶈兘鍒犻櫎绉熸埛鎵€鏈夎€?), { type: "warning" });
    return;
  }

  ElMessageBox.confirm(t("纭鍒犻櫎鐢ㄦ埛?"), t("璀﹀憡"), {
    confirmButtonText: t("纭畾"),
    cancelButtonText: t("鍙栨秷"),
    type: "warning",
    buttonSize: "small",
    closeOnClickModal: false,
  }).then(function () {
    loading.value = true;
    UserGateway.deleteByIds(userIds.map((userId) => String(userId)))
      .then(() => {
        showNotification(t("鍒犻櫎鎴愬姛"), { type: "success" });
        fetchData();
      })
      .finally(() => (loading.value = false));
  });
}

onMounted(async () => {
  // 鑾峰彇褰撳墠鐢ㄦ埛淇℃伅
  try {
    currentUserId.value = Storage.sessionGet<UserInfo>("userInfo")?.id;
  } catch (error) {
    console.error("鑾峰彇褰撳墠鐢ㄦ埛淇℃伅澶辫触:", error);
  }

  // 鍔犺浇瑙掕壊涓嬫媺鏁版嵁婧?  await fetchRoleOptions();

  handleQuery();
});
</script>

<style lang="scss" scoped>
.h-full {
  width: 100%;
  height: 100%;
}

/* 鎼滅储鍖哄煙鍝嶅簲寮忓竷灞€ */
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

.user-list-page__body {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.user-list-page__pagination {
  flex-shrink: 0;
}
</style>
