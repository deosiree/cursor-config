<template>
  <div class="user-table h-full">
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
            :selectable="(row) => !isCurrentUser(row.id)"
          />
          <el-table-column
            v-else-if="column.prop === 'userName'"
            :label="$t(column.label)"
            prop="userName"
          />
          <el-table-column
            v-else-if="column.prop === 'roleName'"
            :label="$t(column.label)"
            prop="roleName"
          />
          <el-table-column
            v-else-if="column.prop === 'phone'"
            :label="$t(column.label)"
            align="center"
            prop="phone"
            width="120"
          />
          <el-table-column
            v-else-if="column.prop === 'email'"
            :label="$t(column.label)"
            align="center"
            prop="email"
            min-width="180"
          />
          <el-table-column
            v-else-if="column.prop === 'createdAt'"
            :label="$t(column.label)"
            align="center"
            prop="createdAt"
            min-width="180"
          >
            <template #default="{ row }">
              {{ formatDateTime(row.createdAt) }}
            </template>
          </el-table-column>
          <el-table-column
            v-else-if="column.prop === 'status'"
            :label="$t(column.label)"
            align="center"
            prop="status"
            width="100"
          >
            <template #default="{ row }">
              <el-tag
                :type="USER_STATUS_CONFIG[(row.status as UserStableStatus) ?? 'unspecified'].type"
              >
                {{ $t(USER_STATUS_CONFIG[(row.status as UserStableStatus) ?? "unspecified"].label) }}
              </el-tag>
            </template>
          </el-table-column>
          <OperationColumn
            v-else-if="column.prop === 'actions'"
            :label="$t(column.label)"
            fixed="right"
            :list-data-length="data.length"
            :inline-visible-count="2"
          >
            <template #default="{ row }">
              <OpItem
                :label="$t('编辑')"
                icon="edit"
                perm="sys:user:edit"
                @click="emit('edit', row)"
              />
              <OpItem
                v-if="row.status === 'active' && !isCurrentUser(row.id)"
                :label="$t('停用用户')"
                icon-class="i-svg:unlock-user"
                perm="sys:user:lock"
                type="danger"
                @click="emit('disable', row)"
              />
              <OpItem
                v-if="row.status === 'disabled' && !isCurrentUser(row.id)"
                :label="$t('启用用户')"
                icon-class="i-svg:lock-user"
                perm="sys:user:unlock"
                @click="emit('enable', row)"
              />
              <OpItem
                v-if="row.status === 'locked' && !isCurrentUser(row.id)"
                :label="$t('解锁用户')"
                icon-class="i-svg:unlock-user"
                perm="sys:user:unlock"
                @click="emit('unlock', row)"
              />
              <OpItem
                v-if="row.showResendActivation && !isCurrentUser(row.id)"
                :label="$t('重发激活链接')"
                icon-class="i-svg:reset-password"
                perm="sys:user:resendActivation"
                @click="emit('resendActivation', row)"
              />
              <OpItem
                v-if="!isCurrentUser(row.id)"
                :label="$t('重置密码')"
                icon-class="i-svg:reset-password"
                perm="sys:user:resetPassword"
                @click="emit('resetPassword', row)"
              />
              <OpItem
                v-if="!isCurrentUser(row.id)"
                :label="$t('删除')"
                icon="delete"
                type="danger"
                perm="sys:user:delete"
                @click="emit('delete', row)"
              />
            </template>
          </OperationColumn>
        </template>
      </el-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import OperationColumn from "@/components/OperationColumn/index.vue";
import OpItem from "@/components/OperationColumn/OpItem.vue";
import { useTableBodyHeight } from "@/composables/useTableBodyHeight";
import type { UserListItem, UserStableStatus } from "@/types/user";
import { formatDateTime } from "@/utils/format";
import { USER_STATUS_CONFIG } from "../user-status";

export interface UserTableColumn {
  prop: string;
  label: string;
  required?: boolean;
  visible?: boolean;
}

interface Props {
  data?: UserListItem[];
  loading?: boolean;
  visibleColumns?: UserTableColumn[];
  currentUserId?: string;
}

const props = withDefaults(defineProps<Props>(), {
  data: () => [],
  loading: false,
  visibleColumns: () => [],
  currentUserId: undefined,
});

const emit = defineEmits<{
  selectionChange: [selection: UserListItem[]];
  edit: [row: UserListItem];
  delete: [row: UserListItem];
  disable: [row: UserListItem];
  enable: [row: UserListItem];
  unlock: [row: UserListItem];
  resendActivation: [row: UserListItem];
  resetPassword: [row: UserListItem];
}>();

const tableWrapperRef = ref<HTMLElement | null>(null);
const { tableBodyHeight } = useTableBodyHeight(tableWrapperRef);

function handleSelectionChange(selection: UserListItem[]) {
  emit("selectionChange", selection);
}

function isCurrentUser(userId?: string) {
  return !!userId && userId === props.currentUserId;
}
</script>

<style scoped lang="scss">
.user-table {
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
</style>
