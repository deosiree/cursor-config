<template>
  <div class="tenant-table h-full">
    <div ref="tableWrapperRef" class="table-wrapper">
      <el-table
        v-loading="loading"
        :data="data"
        :height="tableBodyHeight"
        border
        stripe
        highlight-current-row
        class="data-table__content"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="50" align="center" />
        <el-table-column :label="$t('租户名')" prop="tenantName" width="auto" />
        <el-table-column :label="$t('联系人')" prop="contactName" width="auto" />
        <el-table-column :label="$t('手机号码')" align="center" prop="contactPhone" width="auto" />
        <el-table-column :label="$t('邮箱')" align="center" prop="contactEmail" min-width="170" />
        <el-table-column :label="$t('状态')" align="center" prop="status" width="90">
          <template #default="{ row }">
            <el-tag :type="getTenantStatusMeta(row).type">
              {{ $t(getTenantStatusMeta(row).label) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column :label="$t('到期时间')" align="center" prop="expireAt" min-width="160">
          <template #default="{ row }">
            <span :class="$t(getExpireTextClass(row))">
              {{ row.expireAt ? formatDateTime(row.expireAt) : $t("永久") }}
            </span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('创建时间')" align="center" prop="createdAt" min-width="160">
          <template #default="{ row }">
            {{ formatDateTime(row.createdAt) }}
          </template>
        </el-table-column>
        <OperationColumn
          :label="$t('操作')"
          :list-data-length="data.length"
          :inline-visible-count="6"
        >
          <template #default="{ row }">
            <OpItem
              :label="$t('管理信息')"
              icon-class="i-svg:table-manage"
              perm="sys:tenant:edit"
              @click="$emit('manageInfo', row)"
            />
            <OpItem
              :label="$t('管理项目')"
              icon="edit"
              perm="sys:tenant:edit"
              @click="$emit('manageProject', row)"
            />
            <OpItem
              :label="$t('项目资源绑定')"
              icon-class="i-svg:tenant-bind-source"
              perm="sys:tenant:edit"
              @click="$emit('manageBindProjectResource', row)"
            />
            <OpItem
              :label="$t('管理边端设备')"
              icon-class="i-svg:bind-device"
              perm="sys:tenant:edit"
              @click="$emit('manageBindDevice', row)"
            />
            <OpItem
              v-if="row.showResendActivation"
              :label="$t('重发激活链接')"
              perm="sys:tenant:edit"
              @click="emit('resendActivation', row)"
            />
            <OpItem
              :label="$t('删除')"
              icon="delete"
              type="danger"
              perm="sys:tenant:delete"
              @click="$emit('delete', row)"
            />
          </template>
        </OperationColumn>
      </el-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import OperationColumn from "@/components/OperationColumn/index.vue";
import OpItem from "@/components/OperationColumn/OpItem.vue";
import { useTableBodyHeight } from "@/composables/useTableBodyHeight";
import { formatDateTime } from "@/utils/format";
import { TENANT_STATUS_VO_CONFIG } from "@/enums";
import type { TenantTableRowModel } from "@/types/tenant";

const EXPIRE_TEXT_CLASS = {
  success: "tenant-expire--success",
  info: "tenant-expire--info",
  warning: "tenant-expire--warning",
  danger: "tenant-expire--danger",
  primary: "tenant-expire--primary",
} as const;

interface Props {
  data?: TenantTableRowModel[];
  loading?: boolean;
}

withDefaults(defineProps<Props>(), {
  data: () => [],
  loading: false,
});

const emit = defineEmits<{
  selectionChange: [selection: TenantTableRowModel[]];
  manageInfo: [row: TenantTableRowModel];
  manageProject: [row: TenantTableRowModel];
  manageBindProjectResource: [row: TenantTableRowModel];
  manageBindDevice: [row: TenantTableRowModel];
  resendActivation: [row: TenantTableRowModel];
  delete: [row: TenantTableRowModel];
}>();

const tableWrapperRef = ref<HTMLElement | null>(null);
const { tableBodyHeight } = useTableBodyHeight(tableWrapperRef);

/**
 * 处理选中项变化
 * @param selection 选中的租户列表
 */
function handleSelectionChange(selection: TenantTableRowModel[]) {
  emit("selectionChange", selection);
}

/**
 * 获取租户状态元信息
 * @param row 租户信息
 */
function getTenantStatusMeta(row: TenantTableRowModel) {
  return TENANT_STATUS_VO_CONFIG[row.statusVO ?? "unspecified"];
}

/**
 * 获取租户到期时间文本类名
 * @param row 租户信息
 */
function getExpireTextClass(row: TenantTableRowModel) {
  return EXPIRE_TEXT_CLASS[getTenantStatusMeta(row).type];
}
</script>

<style scoped lang="scss">
.tenant-table {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  overflow: hidden;
}

.table-wrapper {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.tenant-expire--success {
  color: var(--el-color-success);
}

.tenant-expire--info {
  color: var(--el-color-info);
}

.tenant-expire--warning {
  color: var(--el-color-warning);
}

.tenant-expire--danger {
  color: var(--el-color-danger);
}

.tenant-expire--primary {
  color: var(--el-color-primary);
}
</style>
