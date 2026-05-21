<template>
  <!-- 角色列表 -->
  <RoleListTable
    :loading="loading"
    :list="roleList"
    :page="queryParams.page"
    :page-size="queryParams.pageSize"
    :total="total"
    @add="openRoleEditCreate"
    @edit="openRoleEditEdit"
    @delete="(row) => handleDelete(row.id)"
    @page-change="onRolePageChange"
  />

  <!-- 角色编辑弹窗：基础信息 | 菜单权限 | 关联设备 -->
  <RoleEditDialog
    v-if="roleEditVisible"
    v-model="roleEditVisible"
    v-bind="roleEditDialogProps"
    @closed="resetRoleEditDialog"
    @submit="handleRoleFormSubmit"
  />
</template>

<script setup lang="ts">
import { computed, reactive, ref } from "vue";
import MenuGateway from "@/gateway/system/menu/menu.gateway";
import RoleGateway from "@/gateway/system/role/role.gateway";
import type {
  CheckedRoleModel,
  RoleDialogSubmitPayload,
  RoleEditDialogPropsModel,
  RolePageRowModel,
} from "@/types/role";
import { roleRequiredMenus, specialRoles } from "@/constants";
import { showNotification } from "@/utils/notification";
import type { PermNode } from "../types";
import {
  buildEditDeviceIds,
  buildEditPermissionSnapshot,
  createGetRequiredMenuIds,
} from "../../composables/role-permission.utils";
import { useRoleList } from "../../composables/useRoleList";
import RoleEditDialog from "./RoleEditDialog.vue";
import RoleListTable from "./RoleListTable.vue";

defineOptions({
  name: "RoleIndex", // 角色列表组件名称
  inheritAttrs: false, // 继承属性
});

type RoleEditMode = "create" | "edit"; // 角色编辑模式：新增 | 编辑

// --- 列表 ---
const {
  loading,
  total,
  queryParams,
  roleList,
  fetchData,
  handleQuery,
  onRolePageChange,
  handleDelete,
} = useRoleList();

// --- 编辑弹窗（壳层）---
const roleEditVisible = ref(false);
const roleEditTitle = ref("");
const roleEditMode = ref<RoleEditMode>("create");
const roleEditLoading = ref(false);
const roleEditDisableName = ref(false);
const roleEditCheckedRole = ref<CheckedRoleModel>({});

const roleEditDialogProps = computed(
  (): Omit<RoleEditDialogPropsModel, "modelValue"> => ({
    title: roleEditTitle.value,
    role: {
      id: roleEditBasic.id,
      roleName: roleEditBasic.roleName,
      description: roleEditBasic.description,
    },
    disableName: roleEditDisableName.value,
    menuOptions: menuPermOptions.value,
    requiredMenuIds: roleDialogRequiredMenuIds.value,
    initialMenuIds: roleEditMenuIds.value,
    initialFunctionIds: roleEditFunctionIds.value,
    initialDeviceIds: roleEditDeviceIds.value,
    mode: roleEditMode.value,
    loading: roleEditLoading.value,
  })
);

// --- 基础信息 ---
const roleEditBasic = reactive({
  id: "",
  roleName: "",
  status: 1,
  description: "",
});

/**
 * 重置角色编辑基础信息表单数据至默认初始状态
 */
function resetRoleEditBasic(): void {
  roleEditBasic.id = "";
  roleEditBasic.roleName = "";
  roleEditBasic.status = 1;
  roleEditBasic.description = "";
}

// --- 菜单权限 ---
const menuPermOptions = ref<PermNode[]>([]);
const getRequiredMenuIds = createGetRequiredMenuIds(menuPermOptions);

/** 暂不向菜单树展示必选/禁用；恢复时改为按角色名计算 getRequiredMenuIds */
const roleDialogRequiredMenuIds = computed(() => []);

const roleEditMenuIds = ref<string[]>([]);
const roleEditFunctionIds = ref<string[]>([]);
const roleEditSelectedMenuIds = ref<string[]>([]);

/**
 * 保存角色的菜单权限配置。
 *
 * @param roleId - 需要保存权限的角色ID
 * @returns 无返回值
 */
async function saveRoleMenuPermissions(roleId: string): Promise<void> {
  const roleName = roleEditCheckedRole.value.roleName || roleEditBasic.roleName || "";
  const requiredMenuIds = getRequiredMenuIds(roleName);

  let finalMenuIds = roleEditSelectedMenuIds.value.map((id) => parseInt(id, 10));

  // 检查并自动补充缺失的必选菜单ID
  if (requiredMenuIds.length > 0) {
    const selectedIds = finalMenuIds.map((id) => String(id));
    const missingRequiredMenuIds = requiredMenuIds
      .map((id) => parseInt(id, 10))
      .filter((id) => !selectedIds.includes(String(id)));

    // 如果存在缺失的必选菜单，则合并到最终列表并显示提示通知
    if (missingRequiredMenuIds.length > 0) {
      finalMenuIds = [...finalMenuIds, ...missingRequiredMenuIds];
      const requiredMenuNames = roleRequiredMenus[roleName] || [];
      showNotification(`已自动添加必选菜单：${requiredMenuNames.join("、")}`, {
        type: "info",
      });
    }
  }

  await RoleGateway.assignMenuPermissions(
    roleId,
    finalMenuIds.map((id) => String(id))
  );
}

// --- 关联设备 ---
const roleEditDeviceIds = ref<string[]>([]);

// --- 编辑弹窗（编排：打开 / 重置 / 提交）---
function clearRoleEditPermissionSnapshot(): void {
  roleEditMenuIds.value = [];
  roleEditFunctionIds.value = [];
  roleEditDeviceIds.value = [];
}

/**
 * 打开角色新增对话框并初始化相关状态
 * @returns {Promise<void>} 无返回值
 */
async function openRoleEditCreate(): Promise<void> {
  // 设置编辑模式为创建，并配置标题和名称字段的可编辑状态
  roleEditMode.value = "create";
  roleEditTitle.value = "新增角色";
  roleEditDisableName.value = false;

  resetRoleEditBasic(); // 重置基础信息表单数据至默认初始状态
  roleEditCheckedRole.value = {}; // 重置选中角色数据
  clearRoleEditPermissionSnapshot(); // 重置权限快照
  roleEditLoading.value = false; // 关闭加载状态

  menuPermOptions.value = await MenuGateway.getTreeByPage(); // 获得当前租户的菜单权限树，粒度至页面
  roleEditVisible.value = true; // 显示对话框
}

async function openRoleEditEdit(row: RolePageRowModel): Promise<void> {
  roleEditMode.value = "edit";
  roleEditTitle.value = `【${row.roleName}】修改角色`;
  roleEditDisableName.value = specialRoles.includes(row.roleName || "");
  roleEditBasic.id = String(row.id ?? "");
  roleEditBasic.roleName = row.roleName ?? "";
  roleEditBasic.status = row.status ?? 1;
  roleEditBasic.description = row.description ?? "";
  roleEditCheckedRole.value = {
    roleId: row.id,
    roleName: row.roleName,
  };

  clearRoleEditPermissionSnapshot();
  roleEditVisible.value = true;
  roleEditLoading.value = true;

  try {
    menuPermOptions.value = await MenuGateway.getTreeByPage(); // 获得当前租户的菜单权限树，粒度至页面
    const detail = await RoleGateway.getDetail(row.id!);
    const permission = buildEditPermissionSnapshot(
      detail,
      menuPermOptions.value,
      row.roleName || "",
      getRequiredMenuIds
    );
    roleEditMenuIds.value = permission.menuIds;
    roleEditFunctionIds.value = permission.functionIds;
    roleEditDeviceIds.value = buildEditDeviceIds(detail);
  } catch (error) {
    clearRoleEditPermissionSnapshot();
    console.error("角色详情加载失败:", error);
  } finally {
    roleEditLoading.value = false;
  }
}

function resetRoleEditDialog(): void {
  roleEditVisible.value = false;
  roleEditLoading.value = false;
  resetRoleEditBasic();
  clearRoleEditPermissionSnapshot();
  roleEditCheckedRole.value = {};
  roleEditDisableName.value = false;
  roleEditMode.value = "create";
  roleEditTitle.value = "";
}

async function handleRoleFormSubmit(payload: RoleDialogSubmitPayload): Promise<void> {
  const { roleBasic, menuIds, deviceIds } = payload;
  loading.value = true;
  try {
    let roleId = roleBasic.id ? String(roleBasic.id) : "";
    if (roleId) {
      await RoleGateway.update({
        id: roleId,
        roleName: roleBasic.roleName ?? "",
        description: roleBasic.description ?? "",
      });
    } else {
      const res: any = await RoleGateway.create({
        roleName: roleBasic.roleName ?? "",
        description: roleBasic.description ?? "",
      });
      roleId = String(res?.id ?? res?.roleId ?? res?.role?.id ?? res?.data?.role?.id ?? "");
    }

    if (roleId) {
      roleEditSelectedMenuIds.value = menuIds;
      await saveRoleMenuPermissions(roleId);
      await RoleGateway.assignDevices(roleId, deviceIds);
    }

    showNotification(roleBasic.id ? "修改成功" : "新增成功", { type: "success" });
    roleEditVisible.value = false;
    await fetchData();
  } catch (error) {
    const actionText = roleBasic.id ? "修改" : "新增";
    console.error(`${actionText}角色失败:`, error);
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  handleQuery();
});
</script>
