<template>
  <div class="role-list-table">
    <div class="data-table__toolbar flex flex-justify-between mb-[10px]">
      <div class="data-table__toolbar--actions">
        <div class="roleList">角色列表</div>
      </div>
      <div class="data-table__toolbar--actions">
        <el-button
          v-hasPerm="'sys:role:add'"
          type="primary"
          size="small"
          icon="plus"
          plain
          @click="emit('add')"
        >
          新增角色
        </el-button>
      </div>
    </div>

    <div ref="tableWrapperRef" class="table-wrapper">
      <el-table
        ref="tableRef"
        v-loading="loading"
        :data="list"
        :height="tableBodyHeight"
        highlight-current-row
        border
        stripe
        class="data-table__content"
        @selection-change="handleSelectionChange"
      >
        <el-table-column label="角色名称" prop="roleName" width="auto" />
        <el-table-column label="角色描述" prop="description" width="auto" min-width="150" />
        <el-table-column label="用户数量" prop="userCount" align="center" width="auto" />

        <el-table-column fixed="right" label="操作" min-width="220" width="auto" align="left">
          <template #default="scope">
            <el-button
              v-if="scope.row.roleName !== '超级管理员'"
              v-hasPerm="'sys:role:edit'"
              type="primary"
              size="small"
              link
              icon="edit"
              @click.stop="emit('edit', scope.row)"
            >
              编辑
            </el-button>
            <!-- <el-button
              v-if="scope.row.roleName !== '超级管理员'"
              type="primary"
              icon="bell"
              link
              size="small"
              @click.stop="emit('subscribe', scope.row)"
            >
              告警订阅
            </el-button> -->
            <el-button
              v-if="!isSpecialRoleName(scope.row.roleName)"
              v-hasPerm="'sys:role:delete'"
              type="danger"
              size="small"
              link
              icon="delete"
              @click.stop="emit('delete', scope.row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div class="role-list-table__pagination">
      <Pagination
        v-if="total > 0"
        v-model:total="innerTotal"
        v-model:page="innerPage"
        v-model:limit="innerPageSize"
        @pagination="onPagination"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import Pagination from "@/components/Pagination/index.vue";
import { useTableBodyHeight } from "@/composables/useTableBodyHeight";
import { specialRoles } from "@/constants";

interface RoleRow {
  id?: string;
  roleName?: string;
  description?: string;
  userCount?: number;
  status?: number;
}

interface Props {
  loading: boolean;
  list: RoleRow[] | undefined;
  page: number;
  pageSize: number;
  total: number;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: "add"): void;
  (e: "edit", row: RoleRow): void;
  (e: "delete", row: RoleRow): void;
  (e: "subscribe", row: RoleRow): void;
  (e: "page-change", payload: { page: number; pageSize: number }): void;
}>();

const tableRef = ref();
const tableWrapperRef = ref<HTMLElement | null>(null);
const { tableBodyHeight } = useTableBodyHeight(tableWrapperRef);

const innerPage = ref(props.page);
const innerPageSize = ref(props.pageSize);
const innerTotal = ref(props.total);

watch(
  () => [props.page, props.pageSize, props.total],
  () => {
    innerPage.value = props.page;
    innerPageSize.value = props.pageSize;
    innerTotal.value = props.total;
  }
);

function isSpecialRoleName(roleName: string): boolean {
  return !!roleName && specialRoles.includes(roleName);
}

function handleSelectionChange() {
  // 目前列表不需要将 selection 传递给上层，如后续需要可在此 emit。
}

function onPagination({ page, limit }: { page: number; limit: number }) {
  emit("page-change", { page, pageSize: limit });
}
</script>

<style scoped lang="scss">
.role-list-table {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  overflow: hidden;
}
/** 固定首尾、中间自适应的弹性布局 */
.data-table__toolbar {
  flex-shrink: 0; // 防止工具栏占用空间
}

.table-wrapper {
  flex: 1; // 表格主体区域占用剩余空间
  min-height: 0; // 内容溢出时正确滚动
  overflow: hidden; // 内容溢出时正确滚动
}

.role-list-table__pagination {
  flex-shrink: 0; // 防止分页组件占用空间
}
</style>
