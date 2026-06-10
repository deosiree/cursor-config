<template>
  <el-popover placement="bottom" :width="180" trigger="click">
    <template #reference>
      <el-button size="small" type="primary" plain icon="setting">{{ $t("列设置") }}</el-button>
    </template>

    <div class="column-filter-popover">
      <div class="column-filter-header">
        <span>{{ $t("显示/隐藏列") }}</span>
        <el-button type="default" size="small" @click="handleReset">{{ $t("重置") }}</el-button>
      </div>

      <div class="column-filter-list">
        <el-checkbox-group v-model="selectedColumns">
          <div v-for="column in allColumns" :key="column.prop" class="column-filter-item">
            <el-checkbox :value="column.prop" :disabled="column.required">
              {{ $t(column.label) }}
            </el-checkbox>
          </div>
        </el-checkbox-group>
      </div>
    </div>
  </el-popover>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";

useI18n();

interface ColumnItem {
  prop: string;
  label: string;
  required?: boolean;
  visible?: boolean;
}

const props = defineProps<{
  columns: ColumnItem[];
  modelValue: string[]; // 选中的列prop数组
}>();

const emit = defineEmits<{
  "update:modelValue": [value: string[]];
}>();

const selectedColumns = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value),
});

const allColumns = computed(() => props.columns);

const handleReset = () => {
  const defaultColumns = props.columns
    .filter((col) => col.required || col.visible !== false)
    .map((col) => col.prop);
  emit("update:modelValue", defaultColumns);
};
</script>

<style scoped lang="scss">
.column-filter-popover {
  .column-filter-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-bottom: 8px;
    margin-bottom: 8px;
    border-bottom: 1px solid var(--el-border-color-lighter);

    span {
      font-size: 14px;
      font-weight: 500;
      color: var(--el-text-color-primary);
    }
  }

  .column-filter-list {
    max-height: 300px;
    overflow-y: auto;

    .column-filter-item {
      display: flex;
      align-items: center;
      padding: 4px 0;

      :deep(.el-checkbox) {
        width: 100%;
        margin-right: 0;

        .el-checkbox__label {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }
    }
  }
}
</style>
