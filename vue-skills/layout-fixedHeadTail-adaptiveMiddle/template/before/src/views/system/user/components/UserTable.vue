<template>
  <div class="table-wrapper">
    <!-- 用户表格 -->
    <el-table
      v-loading="loading"
      :data="data"
      border
      stripe
      highlight-current-row
      class="data-table__content"
      style="max-height: 100%"
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
      <el-table-column label="操作" fixed="right" min-width="220">
        <template #default="{ row }">
          <el-button
            v-if="row.status === 'active' && !isCurrentUser(row.id)"
            v-hasPerm="'sys:user:lock'"
            type="primary"
            size="small"
            link
            @click="emit('disable', row)"
          >
            <div class="i-svg:unlock-user w-[14px] h-[14px] mr-[4px]" color="#369fff"></div>
            <span>停用用户</span>
          </el-button>
          <el-button
            v-if="row.status === 'disabled' && !isCurrentUser(row.id)"
            v-hasPerm="'sys:user:unlock'"
            type="primary"
            size="small"
            link
            @click="emit('enable', row)"
          >
            <div class="i-svg:lock-user w-[14px] h-[14px] mr-[4px]"></div>
            <span>启用用户</span>
          </el-button>
          <el-button
            v-if="row.status === 'locked' && !isCurrentUser(row.id)"
            v-hasPerm="'sys:user:unlock'"
            type="primary"
            size="small"
            link
            @click="emit('unlock', row)"
          >
            <div class="i-svg:unlock-user w-[14px] h-[14px] mr-[4px]"></div>
            <span>解锁用户</span>
          </el-button>
          <el-button
            v-if="row.showResendActivation && !isCurrentUser(row.id)"
            v-hasPerm="'sys:user:resendActivation'"
            type="primary"
            size="small"
            link
            @click="emit('resendActivation', row)"
          >
            <div class="i-svg:reset-password w-[14px] h-[14px] mr-[4px]" color="#369fff"></div>
            <span>重发激活链接</span>
          </el-button>
          <el-button
            v-hasPerm="'sys:user:edit'"
            type="primary"
            icon="edit"
            link
            size="small"
            @click="emit('edit', row)"
          >
            编辑
          </el-button>
          <!-- <el-button type="primary" icon="bell" link size="small" @click="emit('subscribe', row)">
            告警订阅
          </el-button> -->
          <el-button
            v-if="!isCurrentUser(row.id)"
            v-hasPerm="'sys:user:resetPassword'"
            type="primary"
            link
            size="small"
            @click="emit('resetPassword', row)"
          >
            <div class="i-svg:reset-password w-[14px] h-[14px] mr-[4px]" color="#369fff"></div>
            重置密码
          </el-button>
          <el-button
            v-if="!isCurrentUser(row.id)"
            v-hasPerm="'sys:user:delete'"
            type="danger"
            icon="delete"
            link
            size="small"
            @click="emit('delete', row)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
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
.table-wrapper {
  display: flex;
  flex: 1;
  flex-direction: column;
  height: calc(100% - 106px);
}
</style>
