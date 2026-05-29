<template>
  <div
    ref="hostRef"
    class="device-transfer-host"
    :class="{ 'device-transfer-host--prevent-label-toggle': preventLabelToggle }"
    :style="hostStyle"
  >
    <Transfer
      ref="transferRef"
      v-model="modelValue"
      class="device-transfer-host__inner"
      :data="data"
      :titles="titles"
      :button-texts="buttonTexts"
      :filterable="filterable"
      :filter-placeholder="filterPlaceholder"
      :filter-method="resolvedFilterMethod"
      :validate-event="validateEvent"
      :virtual-scroll="virtualScroll"
      v-bind="extraTransferAttrs"
    >
      <template #left-footer>
        <slot name="left-footer">
          <div class="device-transfer-header" :style="columnGridStyle">
            <SpanByTipsFill
              v-for="(col, index) in columns"
              :key="`header-${index}`"
              class="device-transfer-header__cell"
              :content="col.label"
              tag="div"
            />
          </div>
        </slot>
      </template>

      <template #right-footer>
        <slot name="right-footer">
          <div class="device-transfer-header" :style="columnGridStyle">
            <SpanByTipsFill
              v-for="(col, index) in columns"
              :key="`header-${index}`"
              class="device-transfer-header__cell"
              :content="col.label"
              tag="div"
            />
          </div>
        </slot>
      </template>

      <template #default="slotProps">
        <slot name="default" v-bind="slotProps">
          <div class="device-transfer-row" :style="columnGridStyle">
            <SpanByTipsFill
              v-for="(col, index) in columns"
              :key="`cell-${index}`"
              class="device-transfer-row__cell"
              :content="col.getValue(slotProps.option)"
            />
          </div>
        </slot>
      </template>
    </Transfer>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, useAttrs, watch } from "vue";
import Transfer from "../transfer.vue";
import SpanByTipsFill from "@/components/SpanByTips/SpanByTipsFill/index.vue";
import type { TransferDataItem, TransferKey } from "../transfer";
import {
  buildEqualColumnGrid,
  createDefaultFilterMethod,
  DEVICE_TRANSFER_HOST_HEIGHT_DEFAULT,
  type DeviceTransferColumn,
} from "./device-transfer";

defineOptions({
  name: "DeviceTransfer",
  inheritAttrs: false,
});

const modelValue = defineModel<TransferKey[]>({ default: () => [] });

const props = withDefaults(
  defineProps<{
    data?: TransferDataItem[];
    /** 列定义：长度决定等分列数，并驱动表头与行渲染 */
    columns?: DeviceTransferColumn[];
    hostHeight?: string;
    titles?: [string, string];
    buttonTexts?: [string, string];
    filterable?: boolean;
    filterPlaceholder?: string;
    /** 自定义过滤；未传时按 columns 各列 getValue 默认匹配 */
    filterMethod?: (query: string, item: TransferDataItem) => boolean;
    virtualScroll?: boolean;
    /** 阻止点击行内文案切换 checkbox */
    preventLabelToggle?: boolean;
    /** 勾选变化是否触发表单校验（设备场景通常不需要） */
    validateEvent?: boolean;
  }>(),
  {
    data: () => [],
    columns: () => [],
    hostHeight: DEVICE_TRANSFER_HOST_HEIGHT_DEFAULT,
    filterable: true,
    virtualScroll: true,
    preventLabelToggle: false,
    validateEvent: false,
  }
);

const attrs = useAttrs();

/** 低频 v1 Transfer props（如 targetOrder）仍可通过 attrs 透传 */
const extraTransferAttrs = computed(() => attrs);

const hostRef = ref<HTMLElement | null>(null);
const transferRef = ref<InstanceType<typeof Transfer> | null>(null);

/** 外壳高度 */
const hostStyle = computed(() => ({
  height: props.hostHeight,
}));

/** 按列数等分 grid 列宽 */
const columnGridStyle = computed(() => ({
  gridTemplateColumns: buildEqualColumnGrid(props.columns.length),
}));

/** 未传 filterMethod 时，按 columns 生成默认过滤 */
const resolvedFilterMethod = computed(() => {
  if (props.filterMethod) {
    return props.filterMethod;
  }
  if (!props.columns.length) {
    return undefined;
  }
  return createDefaultFilterMethod(props.columns);
});

let labelClickHandler: ((e: Event) => void) | null = null;

/**
 * 在捕获阶段拦截 label 区域点击，避免误切换 checkbox。
 */
function setupLabelClickPrevention(): void {
  teardownLabelClickPrevention();
  if (!props.preventLabelToggle || !hostRef.value) return;

  labelClickHandler = (e: Event) => {
    const mouseEvent = e as MouseEvent;
    const target = mouseEvent.target as HTMLElement;
    if (target.closest(".el-checkbox__label") && !target.closest(".el-checkbox__input")) {
      mouseEvent.preventDefault();
      mouseEvent.stopPropagation();
      mouseEvent.stopImmediatePropagation();
    }
  };

  hostRef.value.addEventListener("click", labelClickHandler, true);
}

/** 移除 label 点击拦截监听 */
function teardownLabelClickPrevention(): void {
  if (labelClickHandler && hostRef.value) {
    hostRef.value.removeEventListener("click", labelClickHandler, true);
  }
  labelClickHandler = null;
}

watch(
  () => props.preventLabelToggle,
  () => setupLabelClickPrevention(),
  { immediate: true }
);

onBeforeUnmount(() => {
  teardownLabelClickPrevention();
});

defineExpose({
  clearQuery: (which: "left" | "right") => transferRef.value?.clearQuery(which),
  get leftPanel() {
    return transferRef.value?.leftPanel;
  },
  get rightPanel() {
    return transferRef.value?.rightPanel;
  },
  transferRef,
});
</script>

<style scoped lang="scss">
.device-transfer-host {
  --device-transfer-checkbox-gutter: 36px;
  --device-transfer-buttons-min-width: 100px;
  --device-transfer-gap: 8px;

  display: flex;
  flex-direction: column;
  width: 100%;
  min-height: 0;

  .device-transfer-header,
  .device-transfer-row {
    box-sizing: border-box;
    display: grid;
    gap: 10px;
    align-items: center;
    width: 100%;
    font-size: 13px;
    line-height: 1.4;
    -webkit-user-select: text;
    -moz-user-select: text;
    user-select: text;
  }

  .device-transfer-header {
    padding: 4px 12px 4px var(--device-transfer-checkbox-gutter);
    font-weight: 600;
    line-height: 1.2;
    color: #606266;
    background: #f5f7fa;

    .device-transfer-header__cell {
      min-width: 0;
      text-align: left;
    }
  }

  .device-transfer-row {
    .device-transfer-row__cell {
      min-width: 0;
      color: var(--el-text-color-regular);
      text-align: left;
    }
  }

  .device-transfer-host__inner {
    display: flex;
    flex: 1;
    width: 100%;
    min-height: 0;
    overflow: hidden;

    :deep(.el-transfer) {
      display: flex;
      gap: var(--device-transfer-gap);
      align-items: stretch;
      width: 100%;
      min-width: 0;
      height: 100%;
    }

    :deep(.el-panel) {
      display: flex;
      flex: 1 1 0;
      flex-direction: column;
      width: auto !important;
      min-width: 0;
      height: 100%;
      margin: 0;
      overflow: hidden;

      .el-panel__header {
        flex-shrink: 0;
        order: 1;
        padding-right: 15px;
        padding-bottom: 10px;
        margin: 0;
        --el-transfer-header-height: 40px;

        .el-checkbox__label {
          font-size: 16px !important;
          font-weight: 550;
        }
      }

      .el-panel__filter {
        box-sizing: border-box !important;
        flex-shrink: 0;
        order: 2;
        padding-bottom: 15px !important;
        --el-transfer-filter-height: 40px;

        .el-input {
          width: 100%;
        }
      }

      .el-panel__footer {
        flex-shrink: 0;
        order: 3;
        height: auto !important;
        min-height: 28px;
        padding: 0;
        margin: 0;
        border-top: none;
        --el-transfer-footer-height: 28px;
      }

      .el-panel__body {
        display: flex;
        flex: 1;
        flex-direction: column;
        order: 4;
        height: auto !important;
        min-height: 0;
        overflow: hidden;
      }

      .el-transfer-panel__list {
        display: flex;
        flex: 1;
        flex-direction: column;
        width: 100%;
        min-width: 0;
        height: auto !important;
        min-height: 0;
        max-height: 100%;
        overflow: hidden;
        -webkit-user-select: text;
        -moz-user-select: text;
        user-select: text;

        > div {
          width: 100%;
          height: 100% !important;
          min-height: 0;
          overflow-y: auto !important;
        }
      }

      .el-transfer-panel__list.is-filterable {
        height: 100% !important;
        padding-top: 0;
      }

      .el-transfer-panel__item.el-checkbox,
      .el-panel__item {
        display: flex !important;
        align-items: center;
        width: 100%;
        min-width: 0;
        height: auto;
        min-height: 32px;
        padding: 6px 8px 6px 0;
        margin-right: 0;

        .el-checkbox__input {
          position: static;
          top: auto;
          flex-shrink: 0;
          align-self: center;
          margin: 0;
        }

        .el-checkbox__label {
          display: flex;
          flex: 1;
          min-width: 0;
          padding-left: 14px;
          overflow: hidden;
          line-height: 1.4;
          -webkit-user-select: text !important;
          -moz-user-select: text !important;
          user-select: text !important;
        }
      }
    }

    :deep(.el-transfer__buttons) {
      display: flex;
      flex: 0 0 auto;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      width: auto !important;
      min-width: var(--device-transfer-buttons-min-width);
      padding: 0 10px;

      .el-button {
        width: 84px;
        height: 32px;
        padding: 7px 12px;
        margin: 0;
        font-size: 13px;
        line-height: 1;

        + .el-button {
          padding: 0 !important;
          margin: 10px !important;
        }
      }
    }

    :deep(.el-panel .el-checkbox__inner::after) {
      left: 6px;
    }
  }

  &.device-transfer-host--prevent-label-toggle {
    .device-transfer-host__inner {
      :deep(.el-transfer-panel__item) {
        .el-checkbox__label {
          pointer-events: all !important;
          cursor: default;
          -webkit-user-select: text !important;
          -moz-user-select: text !important;
          user-select: text !important;
        }

        .el-checkbox__input {
          pointer-events: all !important;
          -webkit-user-select: none !important;
          -moz-user-select: none !important;
          user-select: none !important;
        }
      }
    }
  }
}
</style>
