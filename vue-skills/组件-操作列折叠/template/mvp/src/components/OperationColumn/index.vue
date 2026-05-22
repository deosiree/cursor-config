<template>
  <el-table-column
    :label="label"
    :fixed="fixed"
    :align="align"
    class-name="operation-column-cell"
    :show-overflow-tooltip="showOverflowTooltip"
    :width="resolvedWidth"
  >
    <template #default="{ row }">
      <OperationCellOverflow
        :inline-visible-count="normalizedInlineCount"
        :gap="actionGap"
        :cell-max-height="effectiveCellMaxHeight"
        :width-epoch="rowWidthEpoch"
      >
        <slot :row="row"></slot>
      </OperationCellOverflow>
    </template>
  </el-table-column>
</template>

<script setup lang="ts">
/**
 * @file 操作列表格列：固定槽位 + 更多溢出。
 * @module OperationColumn/index
 */

// ========== 依赖 ==========

import {
  h,
  render,
  inject,
  getCurrentInstance,
  type ComponentInternalInstance,
  type VNode,
  type VNodeChild,
} from "vue";
import { TABLE_INJECTION_KEY } from "element-plus/es/components/table/src/tokens";
import { useI18n } from "vue-i18n";
import { useUserStore } from "@/store";
import { handleApiError } from "@/utils/notification";
import OperationCellOverflow from "./OperationCellOverflow.vue";
import {
  collectProbeRowsFromTableData,
  createOperationColumnWidthCoordinator,
  dedupeDescsByLabel,
  FIXED_RIGHT_GUTTER,
  OPERATION_COLUMN_WIDTH_KEY,
  scanOpButtons,
  type OpButtonDesc,
} from "./operationWidth";

// ========== 类型 / Props / Emits ==========

interface Props {
  listDataLength: number;
  prop?: string;
  label?: string;
  fixed?: string;
  align?: string;
  width?: number;
  showOverflowTooltip?: boolean;
  minWidth?: number;
  /** 行内外露操作个数；负数按 0 处理 */
  inlineVisibleCount?: number;
  /** 操作格内槽间距（px） */
  actionGap?: number;
  /** 列宽补偿的 cell 左右 padding（px） */
  cellPadding?: number;
  /** 操作区内最大高度（px）；默认 32 */
  cellMaxHeight?: number;
}

/** cell 内边距外的渲染缓冲（px） */
const CELL_RENDER_BUFFER = 2;

/** 探针失败时操作列内容区兜底宽度（px） */
const FALLBACK_CONTENT_WIDTH = 150;

const props = withDefaults(defineProps<Props>(), {
  label: "操作",
  fixed: "right",
  align: "center",
  minWidth: 80,
  inlineVisibleCount: 1,
  actionGap: 8,
  cellPadding: 16,
});

// ========== 注入 / 上下文 ==========

type InjectedElTable = ComponentInternalInstance & {
  store?: { states: { data: { value: unknown[] } } };
  props?: { data?: unknown[]; treeProps?: { children?: string } };
};

const elTable = inject(TABLE_INJECTION_KEY, null) as InjectedElTable | null;

const { t } = useI18n();
const userStore = useUserStore();
const slots = useSlots();

// ========== 状态 ==========

const moreLabel = computed(() => t("更多"));
const compactWidthMax = ref(0);
const rowWidthEpoch = ref(0);
const widthReady = ref(false);

/** inlineVisibleCount 归一化：负数按 0 处理 */
const normalizedInlineCount = computed(() => Math.max(props.inlineVisibleCount, 0));

const widthCoordinator = createOperationColumnWidthCoordinator({
  getInlineVisibleCount: () => normalizedInlineCount.value,
  getActionGap: () => props.actionGap,
  compactWidthMax,
  getMoreLabel: () => moreLabel.value,
});

provide(OPERATION_COLUMN_WIDTH_KEY, widthCoordinator);

// ========== 计算属性 ==========

const effectiveCellMaxHeight = computed(() => {
  if (props.cellMaxHeight != null) return props.cellMaxHeight;
  return 32;
});

const overflowContentWidth = computed(() => {
  const gutter = props.fixed === "right" ? FIXED_RIGHT_GUTTER : 0;
  return Math.ceil(compactWidthMax.value + props.cellPadding + CELL_RENDER_BUFFER + gutter);
});

const resolvedWidth = computed(() => {
  if (!widthReady.value) return props.minWidth;
  return overflowContentWidth.value;
});

// ========== 方法 ==========

function isVNode(value: unknown): value is VNode {
  return typeof value === "object" && value !== null && "type" in value;
}

/** 将 slot 返回值规范为 VNode 子节点列表，供离屏 render 使用 */
function normalizeSlotVnodes(content: unknown): VNodeChild[] {
  if (content == null) return [];
  if (Array.isArray(content)) return content.filter(isVNode);
  if (isVNode(content)) return [content];
  return [];
}

/**
 * 读取与 el-table :data 同源的原始行（store 优先；挂载早期 store 可能仍为空，回退 props.data）。
 */
function resolveRawTableRows(): unknown[] {
  if (!elTable) {
    console.error("[OperationColumn] 未注入 ElTable，无法读取表数据作离屏探针");
    return [];
  }

  const storeRows = elTable.store?.states?.data?.value;
  if (Array.isArray(storeRows) && storeRows.length > 0) return storeRows;

  const propRows = elTable.props?.data;
  if (Array.isArray(propRows) && propRows.length > 0) return propRows;

  return Array.isArray(storeRows) ? storeRows : Array.isArray(propRows) ? propRows : [];
}

/** 从表数据选取离屏探针代表行 */
function resolveProbeRows(): unknown[] {
  const tableRows = resolveRawTableRows();
  const childrenKey = elTable?.props?.treeProps?.children ?? "children";
  return collectProbeRowsFromTableData(tableRows, childrenKey);
}

const probeSourceLength = computed(() => resolveRawTableRows().length);

/**
 * 离屏渲染 slot → 扫描最终可见 OpItem DOM → 按 label 去重，作为列宽公式输入。
 */
async function probeSlotScenariosViaDom(): Promise<OpButtonDesc[][]> {
  const probeRows = resolveProbeRows();
  if (probeRows.length === 0) return [];

  const instance = getCurrentInstance();
  const container = document.createElement("div");
  container.className = "operation-column-probe-host";
  container.style.cssText =
    "position:fixed;left:-9999px;top:0;visibility:hidden;pointer-events:none;";
  document.body.appendChild(container);

  const scenarios: OpButtonDesc[][] = [];

  try {
    for (const row of probeRows) {
      const children = normalizeSlotVnodes(slots.default?.({ row }));
      if (children.length === 0) continue;

      const vnode = h("div", { class: "operation-column-probe-row" }, children);
      if (instance?.appContext) {
        vnode.appContext = instance.appContext;
      }

      render(vnode, container);
      await nextTick();
      await nextTick();

      const descs = dedupeDescsByLabel(scanOpButtons(container));
      if (descs.length > 0) {
        scenarios.push(descs);
      }

      render(null, container);
    }
  } finally {
    document.body.removeChild(container);
  }

  return scenarios;
}

/**
 * 从 default slot 离屏探针采集可见 OpItem 场景并写入协调器；失败则报错。
 */
async function initWidthFromSlot() {
  const probeRowCount = resolveProbeRows().length;
  const scenarios = await probeSlotScenariosViaDom();

  if (scenarios.length === 0) {
    if (probeRowCount === 0) {
      widthReady.value = false;
      return;
    }

    console.error("[OperationColumn] 离屏探针未扫描到可见 OpItem，将回退到固定列宽", {
      probeRowCount,
      listDataLength: props.listDataLength,
      hasElTable: !!elTable,
    });
    compactWidthMax.value = FALLBACK_CONTENT_WIDTH;
    widthReady.value = true;
    handleApiError(
      new Error("OperationColumn: 离屏探针未扫描到 OpItem，请检查 #default 是否使用 OpItem"),
      "操作列宽度计算失败"
    );
    return;
  }

  widthCoordinator.setSlotScenarios(scenarios);
  widthReady.value = true;
}

// ========== 生命周期 ==========

onMounted(() => {
  nextTick(() => void initWidthFromSlot());
});

// ========== 侦听 ==========

function scheduleWidthReprobe() {
  widthCoordinator.resetSignatures();
  rowWidthEpoch.value++;
  nextTick(() => {
    void initWidthFromSlot().then(() => {
      rowWidthEpoch.value++;
    });
  });
}

watch(() => props.listDataLength, scheduleWidthReprobe);

watch(probeSourceLength, (len, prev) => {
  if (len === 0 && prev === 0) return;
  if (len === prev) return;
  scheduleWidthReprobe();
});

watch(normalizedInlineCount, () => {
  nextTick(() => void initWidthFromSlot());
});

watch(moreLabel, () => {
  nextTick(() => void initWidthFromSlot());
});

watch(
  () => userStore.userInfo?.perms,
  () => {
    if (!widthReady.value) return;
    widthCoordinator.resetSignatures();
    nextTick(() => {
      void initWidthFromSlot().then(() => {
        rowWidthEpoch.value++;
      });
    });
  },
  { deep: true }
);
</script>

<script lang="ts">
export { default as OpItem } from "./OpItem.vue";
</script>

<style lang="scss">
.operation-column-cell .cell {
  padding-right: 8px;
  padding-left: 8px;
  overflow: visible;
}
</style>
