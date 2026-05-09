<template>
  <div class="tenant-project-step">
    <div class="tenant-project-step__title">项目列表</div>
    <div v-if="treeData.length" class="project-tree-wrapper">
      <div class="project-tree-header">
        <span class="project-tree-header__checkbox">
          <el-checkbox
            :model-value="isAllChecked"
            :indeterminate="isIndeterminate"
            @change="handleCheckAllChange"
          />
        </span>
        <span class="project-tree-header__index">序号</span>
        <span class="project-tree-header__name">项目名称</span>
        <span class="project-tree-header__description">描述</span>
      </div>
      <el-tree
        ref="treeRef"
        :data="treeData"
        node-key="id"
        :indent="0"
        show-checkbox
        default-expand-all
        :check-strictly="false"
        @check="handleTreeCheck"
      >
        <template #default="{ data }">
          <div class="project-tree-node">
            <span class="project-tree-node__index">{{ data.seq }}</span>
            <span class="project-tree-node__name">{{ data.name }}</span>
            <span class="project-tree-node__description">{{ data.description || "-" }}</span>
          </div>
        </template>
      </el-tree>
    </div>
    <el-empty v-else :image-size="80" description="暂无可选项目" />
  </div>
</template>

<script setup lang="ts">
import { normalizeSelectedProjectIds } from "@/gateway/system/tenant/tenant-dialog.mapper";

interface Props {
  options?: ProjectOptionByTenant[];
  selectedIds?: string[];
}

const props = withDefaults(defineProps<Props>(), {
  options: () => [],
  selectedIds: () => [],
});

const emit = defineEmits<{
  "update:selectedIds": [value: string[]];
}>();

interface ProjectTreeNode {
  id: string;
  seq: string;
  name: string;
  description?: string;
}

const treeRef = ref<{
  setCheckedKeys: (keys: Array<string | number>) => void;
  getCheckedKeys: (leafOnly?: boolean) => Array<string | number>;
} | null>(null);
const treeData = computed<ProjectTreeNode[]>(() =>
  (props.options ?? []).map((item, index) => ({
    id: item.id,
    seq: String(index + 1).padStart(2, "0"),
    name: item.name,
    description: item.description?.trim() || "",
  }))
);
/**
 * 封装了一下el-tree的全选
 * - isAllChecked全选
 * - isIndeterminate半选
 * - normalizedSelectedIds、allProjectIds
 * 因为使用el-table时，反显需要加锁，否则存在回填 -> check -> emit -> 父更新 -> watch -> 再回填 的回环风险。
 * 项目其他地方的反显是用的el-tree，如角色管理-菜单管理，保持风格统一
 */
const allProjectIds = computed<string[]>(() => treeData.value.map((item) => item.id)); // 所有项目ID
const normalizedSelectedIds = computed<string[]>(() =>
  normalizeSelectedProjectIds(props.selectedIds).filter(Boolean)
); // 已选项目ID
const isAllChecked = computed<boolean>(() => {
  if (allProjectIds.value.length === 0) return false;
  return normalizedSelectedIds.value.length === allProjectIds.value.length;
}); // 全选
const isIndeterminate = computed<boolean>(() => {
  if (allProjectIds.value.length === 0) return false;
  return normalizedSelectedIds.value.length > 0 && !isAllChecked.value;
}); // 半选

/**
 * 将外部 selectedIds 同步到树勾选 UI。
 * @returns 同步完成 Promise
 */
async function applyModelSelectionToTree(): Promise<void> {
  await nextTick();
  const tree = treeRef.value;
  if (!tree) return;
  tree.setCheckedKeys(normalizeSelectedProjectIds(props.selectedIds)); // 同步勾选
}

/**
 * 处理树勾选变化并回写父组件。
 * 防止回环：当树勾选无变化时，不回填到父组件
 * @returns 无返回值
 */
function handleTreeCheck(): void {
  const nextSelectedIds = normalizeSelectedProjectIds(
    (treeRef.value?.getCheckedKeys(false) ?? []).map((id) => String(id))
  );
  const currentSelectedIds = normalizeSelectedProjectIds(props.selectedIds);
  if (nextSelectedIds.join(",") !== currentSelectedIds.join(",")) {
    emit("update:selectedIds", nextSelectedIds);
  }
}

/**
 * 处理列头全选框变更。
 * @param checked 是否全选
 * @returns 无返回值
 */
function handleCheckAllChange(checked: string | number | boolean): void {
  emit("update:selectedIds", checked ? [...allProjectIds.value] : []);
}

watch(
  [() => props.selectedIds, () => props.options],
  () => {
    void applyModelSelectionToTree();
  },
  { deep: false, immediate: true }
);

defineExpose({
  reset: () => emit("update:selectedIds", []),
  setSelected: (ids: string[]) => emit("update:selectedIds", normalizeSelectedProjectIds(ids)),
  getSelected: () => [...props.selectedIds],
});
</script>

<style scoped lang="scss">
.tenant-project-step {
  width: 100%;
  --project-left-padding: 12px;
  --project-check-col-width: 40px;
  --project-index-col-width: 60px;
  --project-name-col-width: 220px;
}

.tenant-project-step__title {
  padding-bottom: 12px;
  margin-bottom: 16px;
  font-size: 16px;
  font-weight: 500;
  color: #303133;
  border-bottom: 1px solid #ebeef5;
}

.project-tree-wrapper {
  width: 100%;
  max-height: 360px;
  overflow-y: auto;
}

.project-tree-header {
  display: flex;
  align-items: center;
  height: 40px;
  padding-left: var(--project-left-padding);
  font-size: 14px;
  font-weight: 500;
  color: #606266;
  background: #f5f7fa;
  border: 1px solid #ebeef5;
  border-bottom: none;
}

.project-tree-header__checkbox {
  display: inline-flex;
  flex: 0 0 var(--project-check-col-width);
  align-items: center;
  justify-content: center;
}

.project-tree-header__checkbox :deep(.el-checkbox) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-right: 0;
}

.project-tree-header__index {
  flex: 0 0 var(--project-index-col-width);
  text-align: center;
}

.project-tree-header__name {
  flex: 0 0 var(--project-name-col-width);
  text-align: center;
}

.project-tree-header__description {
  flex: 1;
  min-width: 0;
  text-align: center;
}

.project-tree-node {
  display: flex;
  gap: 0;
  align-items: center;
  width: 100%;
  min-width: 0;
}

.project-tree-node__index {
  display: inline-flex;
  flex: 0 0 var(--project-index-col-width);
  justify-content: center;
  color: #606266;
  text-align: center;
}

.project-tree-node__name {
  flex: 0 0 var(--project-name-col-width);
  font-weight: 500;
}

.project-tree-node__description {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #606266;
  white-space: nowrap;
}

:deep(.el-tree) {
  border: 1px solid #ebeef5;
  border-top: none;
}

:deep(.el-tree-node__content) {
  height: 42px;
  padding-left: var(--project-left-padding) !important;
  border-bottom: 1px solid #ebeef5;
}

:deep(.el-tree-node__content:hover) {
  background-color: #f5f7fa;
}

:deep(.el-tree-node__expand-icon) {
  display: none;
}

:deep(.el-tree-node__label) {
  width: 100%;
}

:deep(.el-tree-node__content > .el-checkbox) {
  display: inline-flex;
  flex: 0 0 var(--project-check-col-width);
  align-items: center;
  justify-content: center;
  margin-right: 0;
}
</style>
