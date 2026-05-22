<template>
  <div class="user-table h-full">
    <div ref="tableWrapperRef" class="table-wrapper">
      <!-- 用户表格 -->
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
        <el-table-column
          type="selection"
          width="50"
          align="center"
          :selectable="(row) => !isCurrentUser(row.id)"
        />
        <el-table-column label="用户名" prop="userName" />
        <el-table-column label="角色" prop="roleName" />
        <el-table-column label="手机号码" align="center" prop="phone" width="120" />
        <el-table-column label="邮箱" align="center" prop="email" min-width="180" />
        <el-table-column label="创建时间" align="center" prop="createdAt" min-width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="状态" align="center" prop="status" width="90">
          <template #default="{ row }">
            <el-tag
              :type="USER_STATUS_CONFIG[(row.status as UserStableStatus) ?? 'unspecified'].type"
            >
              {{ USER_STATUS_CONFIG[(row.status as UserStableStatus) ?? "unspecified"].label }}
            </el-tag>
          </template>
        </el-table-column>
        <OperationColumn
          label="操作"
          fixed="right"
          :list-data-length="data.length"
          :inline-visible-count="1"
        >
          <template #default="{ row }">
            <OpItem
              v-if="row.status === 'active' && !isCurrentUser(row.id)"
              label="停用用户"
              icon-class="i-svg:unlock-user"
              perm="sys:user:lock"
              @click="emit('disable', row)"
            />
            <OpItem
              v-if="row.status === 'disabled' && !isCurrentUser(row.id)"
              label="启用用户"
              icon-class="i-svg:lock-user"
              perm="sys:user:unlock"
              @click="emit('enable', row)"
            />
            <OpItem
              v-if="row.status === 'locked' && !isCurrentUser(row.id)"
              label="解锁用户"
              icon-class="i-svg:unlock-user"
              perm="sys:user:unlock"
              @click="emit('unlock', row)"
            />
            <OpItem
              v-if="row.showResendActivation && !isCurrentUser(row.id)"
              label="重发激活链接"
              icon-class="i-svg:reset-password"
              perm="sys:user:resendActivation"
              @click="emit('resendActivation', row)"
            />
            <OpItem
              label="编辑"
              icon="edit"
              perm="sys:user:edit"
              @click="emit('edit', row)"
            />
            <OpItem
              v-if="!isCurrentUser(row.id)"
              label="重置密码"
              icon-class="i-svg:reset-password"
              perm="sys:user:resetPassword"
              @click="emit('resetPassword', row)"
            />
            <OpItem
              v-if="!isCurrentUser(row.id)"
              label="删除"
              icon="delete"
              type="danger"
              perm="sys:user:delete"
              @click="emit('delete', row)"
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
import type { UserListItem, UserStableStatus } from "@/types/user";
import { formatDateTime } from "@/utils/format";
import { USER_STATUS_CONFIG } from "../user-status";

interface Props {
  data?: UserListItem[];
  loading?: boolean;
  currentUserId?: string;
}

const props = withDefaults(defineProps<Props>(), {
  data: () => [],
  loading: false,
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
  subscribe: [row: UserListItem];
}>();

const tableWrapperRef = ref<HTMLElement | null>(null);
const { tableBodyHeight } = useTableBodyHeight(tableWrapperRef);

/**
 * 处理用户选择变化
 * @param selection 选中的用户列表
 */
function handleSelectionChange(selection: UserListItem[]) {
  emit("selectionChange", selection);
}

/**
 * 判断是否为当前用户
 * @param userId 用户ID
 */
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
