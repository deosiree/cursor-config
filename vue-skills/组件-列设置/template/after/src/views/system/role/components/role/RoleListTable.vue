<template>
  <BaseListToolbar :title="$t('角色列表')">
    <template #filters>
      <el-input
        v-model="keywords"
        v-hasPerm="'sys:role:query'"
        suffix-icon="search"
        :placeholder="$t('请输入关键字搜索')"
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
        {{ $t("搜索") }}
      </el-button>
      <el-button
        v-hasPerm="'sys:role:add'"
        type="primary"
        size="small"
        icon="plus"
        plain
        @click="emit('add')"
      >
        {{ $t("新增") }}
      </el-button>
      <!-- 列过滤组件：v-hasPerm 须包在原生节点上，避免挂在 ColumnFilter 根组件 -->
      <span v-hasPerm="'sys:role:query'" class="column-filter-wrap">
        <ColumnFilter v-model="selectedColumns" :columns="tableColumns" />
      </span>
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
      <template v-for="column in visibleColumns" :key="column.prop">
        <el-table-column
          v-if="column.prop === 'roleName'"
          :label="$t(column.label)"
          prop="roleName"
          width="auto"
        />
        <el-table-column
          v-else-if="column.prop === 'description'"
          :label="$t(column.label)"
          prop="description"
          width="auto"
          min-width="150"
        />
        <el-table-column
          v-else-if="column.prop === 'userCount'"
          :label="$t(column.label)"
          prop="userCount"
          align="center"
          width="auto"
        />
        <OperationColumn
          v-else-if="column.prop === 'actions'"
          :label="$t(column.label)"
          fixed="right"
          align="left"
          :list-data-length="(list ?? []).length"
          :inline-visible-count="3"
        >
          <template #default="{ row }">
            <OpItem
              :label="$t('编辑')"
              icon="edit"
              perm="sys:role:edit"
              @click.stop="emit('edit', row)"
            />
            <OpItem
              :label="$t('删除')"
              icon="delete"
              type="danger"
              perm="sys:role:delete"
              @click.stop="emit('delete', row)"
            />
          </template>
        </OperationColumn>
      </template>
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
import { useI18n } from "vue-i18n";

const { t } = useI18n();

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

/************************* 表格列显示/隐藏 *************************/
const ROLE_TABLE_COLUMN_STORAGE_KEY = "role_manage_table_columns";

const TABLE_COLUMN_LABEL = {
  roleName: "角色名称",
  description: "角色描述",
  userCount: "用户数量",
  actions: "操作",
} as const;

const buildTableColumns = () => {
  t("角色名称");
  t("角色描述");
  t("用户数量");
  t("操作");

  return [
    { prop: "roleName", label: TABLE_COLUMN_LABEL.roleName, visible: true },
    { prop: "description", label: TABLE_COLUMN_LABEL.description, visible: true },
    { prop: "userCount", label: TABLE_COLUMN_LABEL.userCount, visible: true },
    { prop: "actions", label: TABLE_COLUMN_LABEL.actions, required: true },
  ];
};

const tableColumns = ref(buildTableColumns());
const selectedColumns = ref<string[]>([]);

const visibleColumns = computed(() => {
  return tableColumns.value.filter(
    (column) => selectedColumns.value.includes(column.prop) || column.required
  );
});

const getDefaultSelectedColumns = () => {
  return tableColumns.value
    .filter((column) => !column.required && column.visible !== false)
    .map((column) => column.prop);
};

const initSelectedColumns = () => {
  const savedColumns = localStorage.getItem(ROLE_TABLE_COLUMN_STORAGE_KEY);
  const validProps = new Set(tableColumns.value.map((column) => column.prop));

  if (savedColumns) {
    try {
      const parsed = JSON.parse(savedColumns) as string[];
      const filtered = parsed.filter((prop) => validProps.has(prop));
      selectedColumns.value = filtered.length > 0 ? filtered : getDefaultSelectedColumns();
      return;
    } catch {
      // 非法缓存回退默认列
    }
  }

  selectedColumns.value = getDefaultSelectedColumns();
};

watch(
  selectedColumns,
  (newVal) => {
    localStorage.setItem(ROLE_TABLE_COLUMN_STORAGE_KEY, JSON.stringify(newVal));
  },
  { deep: true }
);

onMounted(() => {
  initSelectedColumns();
});

function handleSelectionChange() {
  // 目前列表不需要将 selection 传递给上层，如后续需要可在此 emit。
}

function onPagination({ page, limit }: { page: number; limit: number }) {
  emit("page-change", { page, pageSize: limit });
}
</script>

<style scoped lang="scss">
.table-wrapper {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.role-list-table__pagination {
  flex-shrink: 0;
}

.column-filter-wrap {
  display: inline-flex;
  align-items: center;
}
</style>
