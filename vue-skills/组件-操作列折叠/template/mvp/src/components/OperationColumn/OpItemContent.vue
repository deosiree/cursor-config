<template>
  <el-tooltip :content="label" placement="top" :show-after="300" :disabled="!showTooltip">
    <span class="operation-column-op-item__content" :class="contentClass">
      <!-- 带icon组件 -->
      <el-icon v-if="iconComponent" class="operation-column-op-item__icon">
        <component :is="iconComponent" />
      </el-icon>
      <!-- 带iconClass -->
      <span
        v-else-if="iconClass"
        class="operation-column-op-item__icon operation-column-op-item__icon--svg"
        :class="iconClass"
      />
      <!-- 纯文字 -->
      <span ref="labelEl" class="operation-column-op-item__label">{{ label }}</span>
    </span>
  </el-tooltip>
</template>

<script setup lang="ts">
/**
 * @file 操作槽视觉：icon + 文案；menu 变体支持省略号与溢出 tooltip。
 * - OpItem.vue:14 — variant="inline"，行内外露项
 * - OperationCellOverflow.vue:32 — variant="menu"，更多下拉菜单项
 * @module OperationColumn/OpItemContent
 */

// ========== 依赖 ==========

import type { Component } from "vue";
import { Delete, Edit } from "@element-plus/icons-vue";
import type { OpItemType } from "./operationWidth";

// ========== 类型 / Props / Emits ==========

const ICON_MAP: Record<string, Component> = {
  edit: Edit,
  delete: Delete,
};

const props = withDefaults(
  defineProps<{
    label: string;
    icon?: string;
    iconClass?: string;
    type?: OpItemType;
    variant?: "inline" | "menu"; // 行内外露项inline | 下拉菜单项menu
  }>(),
  {
    type: "primary",
    variant: "inline",
  }
);

// ========== 状态 ==========

const labelEl = ref<HTMLElement | null>(null);
const showTooltip = ref(false);

// ========== 计算属性 ==========

const iconComponent = computed(() => {
  if (!props.icon) return null;
  return ICON_MAP[props.icon] ?? null;
});

const contentClass = computed(() => [
  `operation-column-op-item__content--${props.type}`,
  `operation-column-op-item__content--${props.variant}`,
]);

// ========== 方法 ==========

/**
 * 更新 Tooltip 的显示状态。
 *
 * 该函数仅在组件 variant 为 "menu" 且标签元素存在文本溢出时显示 Tooltip。(下拉菜单项，显示不全就隐藏，悬浮显示tooltip)
 * 如果 variant 不为 "menu" 或标签元素不存在，则隐藏 Tooltip。
 *
 * @returns {void}
 */
function updateTooltipState() {
  // 非菜单模式下不显示 Tooltip
  if (props.variant !== "menu") {
    showTooltip.value = false;
    return;
  }
  const el = labelEl.value;

  // 标签元素不存在时隐藏 Tooltip
  if (!el) {
    showTooltip.value = false;
    return;
  }

  // 根据内容是否溢出决定 Tooltip 的显示状态
  showTooltip.value = el.scrollWidth > el.clientWidth;
}

// ========== 生命周期 ==========

onMounted(() => {
  nextTick(updateTooltipState);
});

// ========== 侦听 ==========

watch(
  () => [props.label, props.variant],
  () => nextTick(updateTooltipState)
);
</script>

<style scoped lang="scss">
.operation-column-op-item__content {
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  justify-content: flex-start;
  min-width: 0;
  max-width: 100%;
  height: 32px;
  padding: 0 4px;
  cursor: pointer;
  user-select: none;
}

.operation-column-op-item__content--primary {
  color: var(--el-color-primary);
}

.operation-column-op-item__content--danger {
  color: var(--el-color-danger);
}

.operation-column-op-item__content--menu {
  width: 100%;
}

.operation-column-op-item__icon {
  flex-shrink: 0;
  width: 14px;
  height: 14px;
  margin-right: 4px;
  font-size: 14px;
}

.operation-column-op-item__icon--svg {
  display: inline-block;
}

.operation-column-op-item__label {
  flex: 1;
  min-width: 0;
  font-size: 12px;
  line-height: 32px;
  white-space: nowrap;
}

.operation-column-op-item__content--menu .operation-column-op-item__label {
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
