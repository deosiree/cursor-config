<template>
  <div class="operation-buttons operation-buttons--overflow" :style="{ gap: `${props.gap}px` }">
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
          <el-dropdown-item
            v-for="entry in oflowItems"
            :key="`${entry.meta.label}-${entry.meta.type}-${entry.meta.icon ?? ''}-${entry.meta.iconClass ?? ''}`"
            class="operation-column-more-item"
            @click="() => triggerAction(entry.el)"
          >
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
 * @file 表格操作列溢出区：按 inlineVisibleCount 切分行内/「更多」。
 * @module OperationColumn/OperationCellOverflow
 */

import { useI18n } from "vue-i18n";
import OpItemContent from "./OpItemContent.vue";
import { calcOpStrip, readOpMeta, type OpItemMeta } from "./operationWidth";

interface OverflowEntry {
  el: HTMLElement;
  meta: OpItemMeta;
}

const props = withDefaults(
  defineProps<{
    /** 行内条总槽位数（含「更多」占 1 槽），最小 1 */
    inlineVisibleCount?: number;
    gap?: number;
    cellMaxHeight?: number;
    /** 列宽探针代际；变化时重新切分各行溢出 */
    widthEpoch?: number;
  }>(),
  {
    inlineVisibleCount: 1,
    gap: 8,
    widthEpoch: 0,
  }
);

const { t } = useI18n();

const inlineEl = ref<HTMLElement | null>(null);
const overflowNodes = shallowRef<HTMLElement[]>([]);
const lastOpSig = ref("");

const oflowItems = computed<OverflowEntry[]>(() =>
  overflowNodes.value.map((el) => ({
    el,
    meta: readOpMeta(el),
  }))
);

const inlineStyle = computed(() => {
  const base: Record<string, string> = {
    gap: `${props.gap}px`,
  };
  if (props.cellMaxHeight == null) return base;
  return {
    ...base,
    maxHeight: `${props.cellMaxHeight}px`,
    flexWrap: "wrap",
    overflow: "hidden",
  };
});

/** 行内槽位 DOM 列表。 */
function getInlineOps(inline: HTMLElement): HTMLElement[] {
  return Array.from(inline.querySelectorAll(".operation-column-op-item"));
}

/**
 * 行内 OpItem 签名（label + hidden）。
 * v-if 同位数替换（如启用↔停用）时数量不变，靠签名触发重切分。
 */
function inlineOpSig(inline: HTMLElement): string {
  return getInlineOps(inline)
    .map(
      (el) =>
        `${el.dataset.opLabel ?? ""}|${el.classList.contains("operation-column-op-item--hidden") ? 1 : 0}`
    )
    .join("\x1f");
}

/** 按 calcOpStrip 切分行内/「更多」。 */
function refreshSplit() {
  const inline = inlineEl.value;
  if (!inline) return;

  const items = getInlineOps(inline);
  const { inlineOpCount, showMore } = calcOpStrip(items.length, props.inlineVisibleCount ?? 1);

  items.forEach((el, i) => {
    if (i < inlineOpCount) {
      el.classList.remove("operation-column-op-item--hidden");
    } else {
      el.classList.add("operation-column-op-item--hidden");
    }
  });

  const next = showMore ? items.slice(inlineOpCount) : [];
  const prev = overflowNodes.value;
  if (prev.length === next.length && prev.every((el, i) => el === next[i])) {
    return;
  }
  overflowNodes.value = next;
}

/** 切分溢出并回写签名（切分后的稳定态）。 */
function applyOverflowLayout() {
  refreshSplit();
  const inline = inlineEl.value;
  if (inline) {
    lastOpSig.value = inlineOpSig(inline);
  }
}

/** 双 nextTick 后切分：等待「更多」dropdown 挂载完成再读 DOM。 */
function schedOvSync() {
  nextTick(() => {
    nextTick(applyOverflowLayout);
  });
}

/**
 * 触发隐藏项点击：临时去掉 hidden，派发 click 后恢复。
 */
function triggerAction(node: HTMLElement) {
  const wasHidden = node.classList.contains("operation-column-op-item--hidden");
  if (wasHidden) node.classList.remove("operation-column-op-item--hidden");
  node.click();
  if (wasHidden) node.classList.add("operation-column-op-item--hidden");
}

onMounted(schedOvSync);

onUpdated(() => {
  const inline = inlineEl.value;
  if (!inline) return;
  if (inlineOpSig(inline) === lastOpSig.value) return;
  schedOvSync();
});

watch(() => props.inlineVisibleCount, schedOvSync);
watch(() => props.widthEpoch, schedOvSync);
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
