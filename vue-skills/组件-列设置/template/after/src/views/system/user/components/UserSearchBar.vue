<template>
  <BaseListToolbar :title="$t('用户列表')">
    <template #filters>
      <el-input
        v-model="query.userName"
        :placeholder="$t('请输入关键字搜索')"
        clearable
        class="search-select"
        :style="{ width: $localeLayout.queryField.md }"
        @keyup.enter="emit('search')"
        @clear="emit('search')"
      />
      <el-select
        v-model="query.roleId"
        :placeholder="$t('请选择角色')"
        clearable
        class="search-select"
        @change="emit('search')"
        @clear="emit('search')"
      >
        <el-option
          v-for="item in roleOptions"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
      <el-select
        v-model="query.status"
        :placeholder="$t('请选择状态')"
        clearable
        class="search-select"
        @change="emit('search')"
        @clear="emit('search')"
      >
        <el-option
          v-for="item in USER_STATUS_OPTIONS"
          :key="item.value"
          :label="$t(item.label)"
          :value="item.value"
        />
      </el-select>
    </template>
    <template #actions>
      <el-button
        v-if="perms.query"
        type="primary"
        icon="search"
        size="small"
        plain
        @click="emit('search')"
      >
        {{ $t("搜索") }}
      </el-button>
      <el-button
        v-if="perms.add"
        type="primary"
        icon="plus"
        size="small"
        plain
        @click="emit('add')"
      >
        {{ $t("新增") }}
      </el-button>
      <el-button
        v-if="perms.delete"
        type="danger"
        size="small"
        icon="delete"
        :disabled="disableDelete"
        plain
        @click="emit('deleteSelected')"
      >
        {{ $t("删除") }}
      </el-button>
      <slot name="actions-extra" />
    </template>
  </BaseListToolbar>
</template>

<script setup lang="ts">
import BaseListToolbar from "@/components/ListToolbar/BaseListToolbar.vue";
import type { UserListQuery, UserOptionItem } from "@/types/user";
import { USER_STATUS_OPTIONS } from "../user-status";

export interface UserToolbarPerms {
  query: boolean;
  add: boolean;
  delete: boolean;
}

interface Props {
  query: UserListQuery;
  roleOptions?: UserOptionItem[];
  perms?: UserToolbarPerms;
  disableDelete?: boolean;
}

withDefaults(defineProps<Props>(), {
  roleOptions: () => [],
  perms: () => ({ query: false, add: false, delete: false }),
  disableDelete: false,
});

const emit = defineEmits<{
  search: [];
  add: [];
  deleteSelected: [];
}>();
</script>

<style scoped lang="scss">
.search-select {
  width: 150px;
}

@media (max-width: 768px) {
  .search-select {
    width: 100%;
    min-width: auto;
  }
}
</style>
