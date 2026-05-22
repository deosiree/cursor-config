<template>
  <div class="operation-buttons operation-buttons--overflow" :style="{ gap: `${gap}px` }">
    <div ref="inlineEl" class="operation-buttons-inline" :style="inlineStyle">
      <slot />
    </div>
    <el-dropdown
      v-if="overflowNodes.length > 0"
      trigger="click"
      :teleported="true"
      class="operation-column-more"
      placement="bottom-end"
      popper-class="operation-column-more-popper"
    >
      <el-button
        type="primary"
        link
        size="small"
        icon="MoreFilled"
        class="operation-column-more-trigger"
      >
        {{ t("更多") }}
      </el-button>
      <template #dropdown>
        <el-dropdown-menu>
          <!-- 下拉菜单项 overflowEntries -->
          <el-dropdown-item
            v-for="entry in overflowEntries"
            :key="`${entry.meta.label}-${entry.meta.type}-${entry.meta.icon ?? ''}-${entry.meta.iconClass ?? ''}`"
            class="operation-column-more-item"
            @click="() => triggerAction(entry.el)"
          >
            <!-- 按钮布局壳，此处应用于：更多下拉菜单项 -->
            <OpItemContent
              :label="entry.meta.label"
              :icon="entry.meta.icon"
              :icon-class="entry.meta.iconClass"
              :type="entry.meta.type"
              variant="menu"
            />
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>
</template>

<script setup lang="ts">
/**
 * @file 表格操作列溢出区：行内/「更多」切分、下拉触发、行签名上报。
 * @module OperationColumn/OperationCellOverflow
 */

// ========== 依赖 ==========

import { useI18n } from "vue-i18n";
import OpItemContent from "./OpItemContent.vue";
import {
  OPERATION_COLUMN_WIDTH_KEY,
  readOpItemMetaFromEl,
  scanOpButtons,
  type OpItemMeta,
  type OperationColumnWidthContext,
} from "./operationWidth";

// ========== 类型 / Props / Emits ==========

interface OverflowEntry {
  el: HTMLElement;
  meta: OpItemMeta;
}

const props = withDefaults(
  defineProps<{
    inlineVisibleCount?: number;
    gap?: number;
    cellMaxHeight?: number;
    /** 列表数据代际，变化时重新切分溢出 */
    widthEpoch?: number;
  }>(),
  {
    inlineVisibleCount: 1,
    gap: 8,
    widthEpoch: 0,
  }
);

// ========== 注入 / 上下文 ==========

const { t } = useI18n();

const widthCtx = inject<OperationColumnWidthContext | null>(OPERATION_COLUMN_WIDTH_KEY, null); // 列宽协调器

// ========== 状态 ==========

const inlineEl = ref<HTMLElement | null>(null); // 行内元素
const overflowNodes = shallowRef<HTMLElement[]>([]); // 溢出项元素
const lastOpItemCount = ref(0); // 上一次行内 OpItem 数量

// ========== 计算属性 ==========

const gap = computed(() => props.gap ?? 8);

const overflowEntries = computed<OverflowEntry[]>(() =>
  overflowNodes.value.map((el) => ({
    el,
    meta: readOpItemMetaFromEl(el), // 元素的元数据字典(label，icon...)
  }))
);

const inlineStyle = computed(() => {
  const g = gap.value;
  const base: Record<string, string> = {
    gap: `${g}px`,
  };
  if (props.cellMaxHeight == null) return base;
  return {
    ...base,
    maxHeight: `${props.cellMaxHeight}px`,
    flexWrap: "wrap",
    overflow: "hidden",
  };
});

// ========== 方法 ==========

/**
 * 触发溢出项对应行内 OpItem 的点击（隐藏项需临时取消 hidden）。
 * @param node - 行内 OpItem 根元素
 */
function triggerAction(node: HTMLElement) {
  const wasHidden = node.classList.contains("operation-column-op-item--hidden");
  if (wasHidden) node.classList.remove("operation-column-op-item--hidden");
  node.click();
  if (wasHidden) node.classList.add("operation-column-op-item--hidden");
}

/**
 * 按 inlineVisibleCount 切分行内可见项与溢出项。
 */
function refreshOverflowSplit() {
  const inline = inlineEl.value;
  if (!inline) return;

  const items = Array.from(inline.querySelectorAll(".operation-column-op-item")) as HTMLElement[];
  const visible = Math.min(Math.max(props.inlineVisibleCount ?? 1, 0), items.length);

  items.forEach((el, i) => {
    if (i < visible) {
      el.classList.remove("operation-column-op-item--hidden"); // 显示项需取消 hidden
    } else {
      el.classList.add("operation-column-op-item--hidden"); // 隐藏项需 hidden
    }
  });

  const next = items.slice(visible);
  const prev = overflowNodes.value;
  if (prev.length === next.length && prev.every((el, i) => el === next[i])) {
    return;
  }
  overflowNodes.value = next;
}

/**
 * 测量溢出行内容区 DOM 宽度，供列宽与公式宽取 max。
 * @returns 根容器 scrollWidth；容器不存在时为 undefined
 */
function measureOverflowContentWidth(): number | undefined {
  const root = inlineEl.value?.parentElement as HTMLElement | null;
  if (!root) return undefined;
  return root.scrollWidth;
}

/**
 * 切分溢出并上报行签名给列宽协调器。
 */
function syncOverflowLayout() {
  refreshOverflowSplit(); // 按 inlineVisibleCount 切分行内可见项与溢出项
  const inline = inlineEl.value;
  const ctx = widthCtx;
  if (!inline || !ctx) return;

  const descs = scanOpButtons(inline); // 扫描行内按钮
  const domW = measureOverflowContentWidth();
  ctx.registerRowSignature(descs, domW);
}

/**
 * 在双 nextTick 后执行布局同步，确保「更多」dropdown 已挂载再测 DOM 宽。
 */
function scheduleSyncOverflowLayout() {
  nextTick(() => {
    nextTick(syncOverflowLayout);
  });
}

// ========== 生命周期 ==========

onMounted(scheduleSyncOverflowLayout);

onUpdated(() => {
  const count = inlineEl.value?.querySelectorAll(".operation-column-op-item").length ?? 0;
  if (count !== lastOpItemCount.value) {
    lastOpItemCount.value = count;
    scheduleSyncOverflowLayout();
  }
});

// ========== 侦听 ==========

watch(
  () => props.inlineVisibleCount,
  () => {
    scheduleSyncOverflowLayout();
  }
);

watch(
  () => props.widthEpoch,
  () => {
    scheduleSyncOverflowLayout();
  }
);
</script>

<style scoped lang="scss">
.operation-buttons--overflow {
  display: inline-flex;
  align-items: center;
  width: max-content;
  min-width: 0;
  height: 32px;
}

.operation-buttons-inline {
  display: inline-flex;
  flex-shrink: 0;
  flex-wrap: nowrap;
  align-items: center;
}

.operation-column-more {
  flex-shrink: 0;
}

.operation-column-more-trigger {
  min-width: 40px;
  height: 32px;
  padding-right: 4px;
  padding-left: 4px;
}
</style>

<style lang="scss">
.operation-column-more-popper {
  z-index: 3000;
  min-width: 135px;
  max-width: 200px;
  border: 1px solid #e6e6e6;
  border-radius: 4px;
  box-shadow: 0 2px 12px rgb(0 0 0 / 12%);

  .el-dropdown-menu__item.operation-column-more-item {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    padding: 4px 8px;
  }

  .el-dropdown-menu__item.operation-column-more-item:hover,
  .el-dropdown-menu__item.operation-column-more-item:focus {
    background-color: #ecf5ff;
  }
}
</style>
