<template>
  <BaseListToolbar :title="$t('瑙掕壊鍒楄〃')">
    <template #filters>
      <el-input
        v-model="keywords"
        v-hasPerm="'sys:role:query'"
        suffix-icon="search"
        :placeholder="$t('璇疯緭鍏ュ叧閿瓧鎼滅储')"
        clearable
        :style="{ width: $localeLayout.queryField.md }"
        @keyup.enter="emit('search')"
        @clear="emit('search')"
      />
    </template>
    <template #actions>
      <el-button
        v-hasPerm="'sys:role:query'"
        type="primary"
        plain
        icon="search"
        size="small"
        @click="emit('search')"
      >
        {{ $t("鎼滅储") }}
      </el-button>
      <el-button
        v-hasPerm="'sys:role:add'"
        type="primary"
        size="small"
        icon="plus"
        plain
        @click="emit('add')"
      >
        {{ $t("鏂板瑙掕壊") }}
      </el-button>
    </template>
  </BaseListToolbar>

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
      <el-table-column :label="$t('瑙掕壊鍚嶇О')" prop="roleName" width="auto" />
      <el-table-column :label="$t('瑙掕壊鎻忚堪')" prop="description" width="auto" min-width="150" />
      <el-table-column :label="$t('鐢ㄦ埛鏁伴噺')" prop="userCount" align="center" width="auto" />

      <OperationColumn
        :label="$t('鎿嶄綔')"
        fixed="right"
        align="left"
        :list-data-length="(list ?? []).length"
        :inline-visible-count="3"
      >
        <template #default="{ row }">
          <!-- v-if="row.roleName !== '瓒呯骇绠＄悊鍛?" -->
          <OpItem
            :label="$t('缂栬緫')"
            icon="edit"
            perm="sys:role:edit"
            @click.stop="emit('edit', row)"
          />
          <!-- v-if="!isSpecialRoleName(row.roleName)" -->
          <OpItem
            :label="$t('鍒犻櫎')"
            icon="delete"
            type="danger"
            perm="sys:role:delete"
            @click.stop="emit('delete', row)"
          />
        </template>
      </OperationColumn>
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
</template>

<script setup lang="ts">
import OperationColumn from "@/components/OperationColumn/index.vue";
import OpItem from "@/components/OperationColumn/OpItem.vue";
import Pagination from "@/components/Pagination/index.vue";
import { useTableBodyHeight } from "@/composables/useTableBodyHeight";
// import { specialRoles } from "@/constants";

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

const keywords = defineModel<string>("keywords", { default: "" });

const emit = defineEmits<{
  (e: "add"): void;
  (e: "edit", row: RoleRow): void;
  (e: "delete", row: RoleRow): void;
  (e: "subscribe", row: RoleRow): void;
  (e: "search"): void;
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

// function isSpecialRoleName(roleName: string): boolean {
//   return !!roleName && specialRoles.includes(roleName);
// }

function handleSelectionChange() {
  // 鐩墠鍒楄〃涓嶉渶瑕佸皢 selection 浼犻€掔粰涓婂眰锛屽鍚庣画闇€瑕佸彲鍦ㄦ emit銆?}

function onPagination({ page, limit }: { page: number; limit: number }) {
  emit("page-change", { page, pageSize: limit });
}
</script>

<style scoped lang="scss">
.table-wrapper {
  flex: 1; // 琛ㄦ牸涓讳綋鍖哄煙鍗犵敤鍓╀綑绌洪棿
  min-height: 0; // 鍐呭婧㈠嚭鏃舵纭粴鍔?  overflow: hidden; // 鍐呭婧㈠嚭鏃舵纭粴鍔?}

.role-list-table__pagination {
  flex-shrink: 0; // 闃叉鍒嗛〉缁勪欢鍗犵敤绌洪棿
}
</style>
