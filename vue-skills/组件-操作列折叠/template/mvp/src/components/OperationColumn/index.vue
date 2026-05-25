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
        :inline-visible-count="normSlotCnt"
        :gap="actionGap"
        :cell-max-height="cellMaxH"
        :width-epoch="rowWidthEpoch"
      >
        <slot :row="row"></slot>
      </OperationCellOverflow>
    </template>
  </el-table-column>
</template>

<script setup lang="ts">
/**
 * @file 操作列表格列：行内固定槽位 +「更多」溢出；列宽由离屏探针与估宽公式决定。
 * @module OperationColumn/index
 */

import { h, render, inject, getCurrentInstance, type ComponentInternalInstance } from "vue";
import { TABLE_INJECTION_KEY } from "element-plus/es/components/table/src/tokens";
import { useI18n } from "vue-i18n";
import { useUserStore } from "@/store";
import { handleApiError } from "@/utils/notification";
import OperationCellOverflow from "./OperationCellOverflow.vue";
import {
  tblProbeFp,
  pickProbeRows,
  mkWidthCoord,
  dedupeByLbl,
  RIGHT_GUT,
  normProbeVn,
  scanOpButtons,
  type OpButtonDesc,
} from "./operationWidth";

interface Props {
  /** 与 el-table :data 行数同步的变更信号（必填） */
  listDataLength: number;
  label?: string;
  fixed?: string;
  align?: string;
  showOverflowTooltip?: boolean;
  minWidth?: number;
  /** 行内条总槽位数（含「更多」占 1 槽）；小于 1 按 1 处理 */
  inlineVisibleCount?: number;
  actionGap?: number;
  cellPadding?: number;
  cellMaxHeight?: number;
}

const CELL_BUF = 2;
const FB_COL_W = 150;
/** 批量触发的离屏重探针 trailing 合并窗口（ms） */
const REPROBE_MS = 32;

const props = withDefaults(defineProps<Props>(), {
  label: "操作",
  fixed: "right",
  align: "center",
  minWidth: 80,
  inlineVisibleCount: 1,
  actionGap: 8,
  cellPadding: 16,
});

type InjectedElTable = ComponentInternalInstance & {
  store?: { states: { data: { value: unknown[] } } };
  props?: { data?: unknown[]; treeProps?: { children?: string } };
};

const elTable = inject(TABLE_INJECTION_KEY, null) as InjectedElTable | null;

const { t } = useI18n();
const userStore = useUserStore();
const slots = useSlots();

const moreLabel = computed(() => t("更多"));
const colWMax = ref(0);
const rowWidthEpoch = ref(0);
const widthReady = ref(false);

const normSlotCnt = computed(() => Math.max(props.inlineVisibleCount, 1));

const wCoord = mkWidthCoord({
  getSlotCnt: () => normSlotCnt.value,
  getActionGap: () => props.actionGap,
  colWMax,
  getMoreLabel: () => moreLabel.value,
});

const cellMaxH = computed(() => props.cellMaxHeight ?? 32);

const ovrContentW = computed(() => {
  const gutter = props.fixed === "right" ? RIGHT_GUT : 0;
  return Math.ceil(colWMax.value + props.cellPadding + CELL_BUF + gutter);
});

const resolvedWidth = computed(() => {
  if (!widthReady.value) return props.minWidth;
  return ovrContentW.value;
});

const childKey = computed(() => elTable?.props?.treeProps?.children ?? "children");

/** 读取与 el-table :data 同源的行（store 优先，早期回退 props.data）。 */
function rawTblRows(): unknown[] {
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

/** 离屏探针代表行（复用 childKey，避免与指纹选取漂移）。 */
function probeRows(): unknown[] {
  return pickProbeRows(rawTblRows(), childKey.value);
}

const reprobeTrig = computed(
  () => `${props.listDataLength}\x1f${tblProbeFp(rawTblRows(), childKey.value)}`
);

let reprobeTmr: ReturnType<typeof setTimeout> | null = null;

/** 离屏 render 各代表行 slot，扫描可见 OpItem DOM 作为列宽公式输入。 */
async function probeDomSlots(): Promise<OpButtonDesc[][]> {
  const rows = probeRows();
  if (rows.length === 0) return [];

  const instance = getCurrentInstance();
  const container = document.createElement("div");
  container.className = "operation-column-probe-host";
  container.style.cssText =
    "position:fixed;left:-9999px;top:0;visibility:hidden;pointer-events:none;";
  document.body.appendChild(container);

  const scenarios: OpButtonDesc[][] = [];

  try {
    for (const row of rows) {
      const children = normProbeVn(slots.default?.({ row }));
      if (children.length === 0) continue;

      const vnode = h("div", { class: "operation-column-probe-row" }, children);
      if (instance?.appContext) {
        vnode.appContext = instance.appContext;
      }

      render(vnode, container);
      await nextTick();
      await nextTick();

      const descs = dedupeByLbl(scanOpButtons(container));
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

/** 离屏探针写入协调器；无可见 OpItem 时回退固定列宽并提示。 */
async function initColW() {
  const probeRowCount = probeRows().length;
  const scenarios = await probeDomSlots();

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
    colWMax.value = FB_COL_W;
    widthReady.value = true;
    handleApiError(
      new Error("OperationColumn: 离屏探针未扫描到 OpItem，请检查 #default 是否使用 OpItem"),
      "操作列宽度计算失败"
    );
    return;
  }

  wCoord.setSlotScn(scenarios);
  widthReady.value = true;
}

/** 立即离屏重探针并 bump rowWidthEpoch（探针前/后各一次）。 */
function runReprobe() {
  rowWidthEpoch.value++;
  nextTick(() => {
    void initColW().then(() => {
      rowWidthEpoch.value++;
    });
  });
}

/** 32ms trailing 合并：短时间多次触发只吃最后一次离屏探针。 */
function schedReprobe() {
  if (reprobeTmr != null) clearTimeout(reprobeTmr);
  reprobeTmr = setTimeout(() => {
    reprobeTmr = null;
    runReprobe();
  }, REPROBE_MS);
}

/** 仅按已存场景重算列宽公式并 bump epoch，不跑离屏 DOM。 */
function bumpStored() {
  wCoord.recalcStored();
  rowWidthEpoch.value++;
}

onMounted(() => {
  schedReprobe();
});

onUnmounted(() => {
  if (reprobeTmr != null) {
    clearTimeout(reprobeTmr);
    reprobeTmr = null;
  }
});

watch(reprobeTrig, schedReprobe);

watch(normSlotCnt, bumpStored);
watch(moreLabel, bumpStored);

watch(
  () => userStore.userInfo?.perms,
  () => {
    if (!widthReady.value) return;
    schedReprobe();
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
