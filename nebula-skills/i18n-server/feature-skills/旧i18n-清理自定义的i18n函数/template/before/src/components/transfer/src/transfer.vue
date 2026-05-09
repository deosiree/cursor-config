<template>
  <div :class="ns.b()">
    <TransferPanel
      ref="leftPanel"
      :data="sourceData"
      :option-render="optionRender"
      :placeholder="panelFilterPlaceholder"
      :title="leftPanelTitle"
      :filterable="filterable"
      :format="format"
      :filter-method="filterMethod"
      :default-checked="leftDefaultChecked"
      :props="props.props"
      :virtual-scroll="virtualScroll"
      @checked-change="onSourceCheckedChange"
    >
      <!-- <template #empty>
        <slot name="left-empty" />
      </template> -->
      <slot name="left-footer" />
    </TransferPanel>
    <div :class="ns.e('buttons')">
      <ElButton
        type="primary"
        :class="[ns.e('button'), ns.is('with-texts', hasButtonTexts)]"
        :disabled="isEmpty(checkedState.rightChecked)"
        @click="addToLeft"
      >
        <ElIcon><ArrowLeft /></ElIcon>
        <span v-if="!isUndefined(buttonTexts[0])">{{ buttonTexts[0] }}</span>
      </ElButton>
      <ElButton
        type="primary"
        :class="[ns.e('button'), ns.is('with-texts', hasButtonTexts)]"
        :disabled="isEmpty(checkedState.leftChecked)"
        @click="addToRight"
      >
        <span v-if="!isUndefined(buttonTexts[1])">{{ buttonTexts[1] }}</span>
        <ElIcon><ArrowRight /></ElIcon>
      </ElButton>
    </div>
    <TransferPanel
      ref="rightPanel"
      :data="targetData"
      :option-render="optionRender"
      :placeholder="panelFilterPlaceholder"
      :filterable="filterable"
      :format="format"
      :filter-method="filterMethod"
      :title="rightPanelTitle"
      :default-checked="rightDefaultChecked"
      :props="props.props"
      :virtual-scroll="virtualScroll"
      @checked-change="onTargetCheckedChange"
    >
      <template #empty>
        <slot name="right-empty" />
      </template>
      <slot name="right-footer" />
    </TransferPanel>
  </div>
</template>

<script lang="ts" setup>
import { Comment, computed, h, reactive, ref, useSlots, watch } from "vue";
import { ElButton, ElIcon } from "element-plus";
import { ArrowLeft, ArrowRight } from "@element-plus/icons-vue";
import { transferEmits, transferProps } from "./transfer";
import { useCheckedChange, useComputedData, useMove, usePropsAlias } from "./composables";
import TransferPanel from "./transfer-panel.vue";

import type { TransferCheckedState, TransferDataItem, TransferDirection } from "./transfer";
import type { TransferPanelInstance } from "./transfer-panel";

defineOptions({
  name: "ElTransfer",
});

const props = defineProps(transferProps);
const emit = defineEmits(transferEmits);
const slots = useSlots();

// 工具函数
const isEmpty = (val: unknown): boolean => {
  if (val === null || val === undefined) return true;
  if (typeof val === "string") return val.trim().length === 0;
  if (Array.isArray(val)) return val.length === 0;
  if (typeof val === "object") return Object.keys(val).length === 0;
  return false;
};

const isUndefined = (val: unknown): val is undefined => val === undefined;

const debugWarn = (message: string) => {
  if (process.env.NODE_ENV !== "production") {
    console.warn(message);
  }
};

// 简单的国际化函数
const t = (key: string): string => {
  // 简单的翻译映射
  const translations: Record<string, string> = {
    "el.transfer.titles.0": "列表 1",
    "el.transfer.titles.1": "列表 2",
    "el.transfer.filterPlaceholder": "请输入搜索内容",
  };
  return translations[key] || key;
};

// 简单的命名空间函数
const useNamespace = (block: string) => {
  const b = (blockName?: string) => (blockName ? `el-${blockName}` : `el-${block}`);
  const e = (element: string) => `el-${block}__${element}`;
  const is = (name: string, condition?: boolean) => (condition ? `is-${name}` : "");
  return { b, e, is };
};

const ns = useNamespace("transfer");

// 简单的表单项 hook（简化版）
const useFormItem = () => {
  return {
    formItem: {
      validate: async () => {
        // 简化实现，实际应该调用表单验证
        return Promise.resolve();
      },
    },
  };
};

const { formItem } = useFormItem();

const checkedState = reactive<TransferCheckedState>({
  leftChecked: [],
  rightChecked: [],
});

const propsAlias = usePropsAlias(props);

// 虚拟滚动支持
const virtualScroll = computed(() => props.virtualScroll);

const { sourceData, targetData } = useComputedData(props);

const { onSourceCheckedChange, onTargetCheckedChange } = useCheckedChange(checkedState, emit);

const { addToLeft, addToRight } = useMove(props, checkedState, emit);

const leftPanel = ref<TransferPanelInstance>();
const rightPanel = ref<TransferPanelInstance>();

const clearQuery = (which: TransferDirection) => {
  switch (which) {
    case "left":
      leftPanel.value!.query = "";
      break;
    case "right":
      rightPanel.value!.query = "";
      break;
  }
};

const hasButtonTexts = computed(() => props.buttonTexts.length === 2);

const leftPanelTitle = computed(() => props.titles[0] || t("el.transfer.titles.0"));

const rightPanelTitle = computed(() => props.titles[1] || t("el.transfer.titles.1"));

const panelFilterPlaceholder = computed(
  () => props.filterPlaceholder || t("el.transfer.filterPlaceholder")
);

watch(
  () => props.modelValue,
  () => {
    if (props.validateEvent) {
      formItem?.validate?.().catch((err) => debugWarn(err));
    }
  }
);

const optionRender = computed(() => (option: TransferDataItem) => {
  if (props.renderContent) return props.renderContent(h, option);

  const defaultSlotVNodes = (slots.default?.({ option }) || []).filter(
    (node) => node.type !== Comment
  );
  if (defaultSlotVNodes.length) {
    return defaultSlotVNodes;
  }

  return h("span", option[propsAlias.value.label] || option[propsAlias.value.key]);
});

defineExpose({
  /** @description clear the filter keyword of a certain panel */
  clearQuery,
  /** @description left panel ref */
  leftPanel,
  /** @description right panel ref */
  rightPanel,
});
</script>
