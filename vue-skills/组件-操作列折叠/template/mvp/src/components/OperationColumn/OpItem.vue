<template>
  <span
    v-if="visible"
    class="operation-column-op-item"
    role="button"
    tabindex="0"
    :data-op-label="label"
    :data-op-icon="icon || undefined"
    :data-op-icon-class="iconClass || undefined"
    :data-op-type="type"
    @click="handleClick"
    @keydown.enter.prevent="handleKeyActivate"
    @keydown.space.prevent="handleKeyActivate"
  >
    <!-- 按钮布局壳，此处应用于：行内外露项 -->
    <OpItemContent
      :label="label"
      :icon="icon"
      :icon-class="iconClass"
      :type="type"
      variant="inline"
    />
  </span>
</template>

<script setup lang="ts">
/**
 * @file 声明式操作槽：权限、data-op-* 元数据、点击与键盘可达性。
 * @module OperationColumn/OpItem
 */

// ========== 依赖 ==========

import { checkHasPerm } from "@/directive/permission";
import OpItemContent from "./OpItemContent.vue";
import { type OpItemType } from "./operationWidth";

// ========== 类型 / Props / Emits ==========

const props = withDefaults(
  defineProps<{
    label: string;
    icon?: string;
    iconClass?: string;
    type?: OpItemType;
    perm?: string | string[];
  }>(),
  {
    type: "primary",
  }
);

const emit = defineEmits<{
  click: [event: MouseEvent];
}>();

// ========== 状态 ==========

const visible = ref(true);

// ========== 生命周期 ==========

onBeforeMount(() => {
  if (!resolveVisible(props.perm)) {
    visible.value = false;
    return;
  }
});

// ========== 方法 ==========

/**
 * 根据 perm 判断本操作槽是否应渲染。
 * @param perm - 权限码；未传则始终展示
 * @returns 是否通过权限校验
 */
function resolveVisible(perm?: string | string[]): boolean {
  if (perm === undefined) return true;
  if (typeof perm !== "string" && !Array.isArray(perm)) {
    console.warn("[OpItem] perm 须为 string 或 string[]");
    return true;
  }
  return checkHasPerm(perm);
}

/**
 * 向业务侧派发点击事件。
 * @param event - 原生鼠标事件
 */
function handleClick(event: MouseEvent) {
  emit("click", event);
}

/**
 * 键盘 Enter/Space 激活时派发点击（与鼠标点击语义一致）。
 * @param event - 键盘事件
 */
function handleKeyActivate(event: KeyboardEvent) {
  emit("click", event as unknown as MouseEvent);
}
</script>

<style scoped lang="scss">
.operation-column-op-item {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  height: 32px;
  vertical-align: middle;
  outline: none;
  border-radius: var(--el-border-radius-base);
}

/* hover / focus / active 挂在外层 span，保证整格 32px 热区与「更多」link 按钮一致 */
.operation-column-op-item:hover:not(.operation-column-op-item--hidden)
  :deep(.operation-column-op-item__content--inline.operation-column-op-item__content--primary),
.operation-column-op-item:focus-visible
  :deep(.operation-column-op-item__content--inline.operation-column-op-item__content--primary) {
  color: var(--el-color-primary-light-5);
}

.operation-column-op-item:active:not(.operation-column-op-item--hidden)
  :deep(.operation-column-op-item__content--inline.operation-column-op-item__content--primary) {
  color: var(--el-color-primary-dark-2);
}

.operation-column-op-item:hover:not(.operation-column-op-item--hidden)
  :deep(.operation-column-op-item__content--inline.operation-column-op-item__content--danger),
.operation-column-op-item:focus-visible
  :deep(.operation-column-op-item__content--inline.operation-column-op-item__content--danger) {
  color: var(--el-color-danger-light-5);
}

.operation-column-op-item:active:not(.operation-column-op-item--hidden)
  :deep(.operation-column-op-item__content--inline.operation-column-op-item__content--danger) {
  color: var(--el-color-danger-dark-2);
}

.operation-column-op-item.operation-column-op-item--hidden {
  display: none !important;
}
</style>
