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
        <template v-for="column in visibleColumns" :key="column.prop">
          <el-table-column
            v-if="column.prop === 'selection'"
            type="selection"
            width="50"
            align="center"
          />
          <el-table-column
            v-else-if="column.prop === 'tenantName'"
            :label="$t(column.label)"
            prop="tenantName"
            width="auto"
          />
          <el-table-column
            v-else-if="column.prop === 'contactName'"
            :label="$t(column.label)"
            prop="contactName"
            width="auto"
          />
          <el-table-column
            v-else-if="column.prop === 'contactPhone'"
            :label="$t(column.label)"
            align="center"
            prop="contactPhone"
            width="auto"
          />
          <el-table-column
            v-else-if="column.prop === 'contactEmail'"
            :label="$t(column.label)"
            align="center"
            prop="contactEmail"
            min-width="170"
          />
          <el-table-column
            v-else-if="column.prop === 'status'"
            :label="$t(column.label)"
            align="center"
            prop="status"
            width="90"
          >
            <template #default="{ row }">
              <el-tag :type="getTenantStatusMeta(row).type">
                {{ $t(getTenantStatusMeta(row).label) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column
            v-else-if="column.prop === 'expireAt'"
            :label="$t(column.label)"
            align="center"
            prop="expireAt"
            width="170"
          >
            <template #default="{ row }">
              <span :class="$t(getExpireTextClass(row))">
                {{ row.expireAt ? formatDateTime(row.expireAt) : $t("永久") }}
              </span>
            </template>
          </el-table-column>
          <el-table-column
            v-else-if="column.prop === 'createdAt'"
            :label="$t(column.label)"
            align="center"
            prop="createdAt"
            width="170"
          >
            <template #default="{ row }">
              {{ formatDateTime(row.createdAt) }}
            </template>
          </el-table-column>
          <OperationColumn
            v-else-if="column.prop === 'actions'"
            :label="$t(column.label)"
            :list-data-length="data.length"
            :inline-visible-count="2"
          >
            <template #default="{ row }">
              <OpItem
                :label="$t('管理信息')"
                icon-class="i-svg:table-manage"
                :perm="actionPerms.edit"
                @click="$emit('manageInfo', row)"
              />
              <OpItem
                :label="$t('管理项目')"
                icon="edit"
                :perm="actionPerms.edit"
                @click="$emit('manageProject', row)"
              />
              <OpItem
                :label="$t('项目资源绑定')"
                icon-class="i-svg:tenant-bind-source"
                :perm="actionPerms.bindResource"
                @click="$emit('manageBindProjectResource', row)"
              />
              <OpItem
                :label="$t('管理边端设备')"
                icon-class="i-svg:bind-device"
                :perm="actionPerms.bindDevice"
                @click="$emit('manageBindDevice', row)"
              />
              <OpItem
                v-if="row.showResendActivation"
                :label="$t('重发激活链接')"
                :perm="actionPerms.edit"
                @click="emit('resendActivation', row)"
              />
              <OpItem
                :label="$t('删除')"
                icon="delete"
                type="danger"
                :perm="actionPerms.delete"
                @click="$emit('delete', row)"
              />
            </template>
          </OperationColumn>
        </template>
      </el-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import OperationColumn from "@/components/OperationColumn/index.vue";
import OpItem from "@/components/OperationColumn/OpItem.vue";
import { useTableBodyHeight } from "@/composables/useTableBodyHeight";
import { formatDateTime } from "@/utils/format";
import { TENANT_STATUS_VO_CONFIG } from "@/enums";
import type { TenantTableRowModel } from "@/types/tenant";

export interface TenantTableColumn {
  prop: string;
  label: string;
  required?: boolean;
  visible?: boolean;
}

export interface TenantTableActionPerms {
  edit: string;
  bindDevice: string;
  bindResource: string;
  delete: string;
}

const DEFAULT_ACTION_PERMS: TenantTableActionPerms = {
  edit: "sys:tenant:edit",
  bindDevice: "sys:tenant:bindDevice",
  bindResource: "sys:tenant:bindResource",
  delete: "sys:tenant:delete",
};

interface Props {
  data?: TenantTableRowModel[];
  loading?: boolean;
  visibleColumns?: TenantTableColumn[];
  actionPerms?: TenantTableActionPerms;
}

const props = withDefaults(defineProps<Props>(), {
  data: () => [],
  loading: false,
  visibleColumns: () => [],
});

const actionPerms = computed(() => props.actionPerms ?? DEFAULT_ACTION_PERMS);

const EXPIRE_TEXT_CLASS = {
  success: "tenant-expire--success",
  info: "tenant-expire--info",
  warning: "tenant-expire--warning",
  danger: "tenant-expire--danger",
  primary: "tenant-expire--primary",
} as const;

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
