<template>
  <div :class="ns.b('panel')">
    <p :class="ns.be('panel', 'header')">
      <ElCheckbox
        v-model="allChecked"
        :indeterminate="isIndeterminate"
        :validate-event="false"
        @change="handleAllCheckedChange"
      >
        {{ title }}
        <!--        <span>{{ checkedSummary }}</span>-->
      </ElCheckbox>
    </p>
    <ElInput
      v-if="filterable"
      v-model="query"
      :class="ns.be('panel', 'filter')"
      size="default"
      :placeholder="placeholder"
      :prefix-icon="Search"
      clearable
      :validate-event="false"
    />

    <p v-if="hasFooter" :class="ns.be('panel', 'footer')">
      <slot />
    </p>
    <div :class="[ns.be('panel', 'body'), ns.is('with-footer', !!hasFooter)]">
      <ElCheckboxGroup
        v-show="!hasNoMatch && data.length > 0"
        v-model="checked"
        :class="{ 'is-filterable': filterable }"
        class="el-transfer-panel__list"
        style="display: flex; flex-direction: column; height: 100%; overflow: hidden"
      >
        <VirtualList
          v-if="virtualScroll && filteredData.length > 0"
          style="flex: 1; height: 400px; overflow-y: auto"
          :data-key="propsAlias.key"
          :data-sources="filteredData"
          :data-component="TransferCheckboxItem"
          :estimate-size="40"
        />
        <template v-else>
          <ElCheckbox
            v-for="item in filteredData"
            :key="item[propsAlias.key]"
            :class="ns.be('panel', 'item')"
            :value="item[propsAlias.key]"
            :disabled="item[propsAlias.disabled]"
            :validate-event="false"
          >
            <OptionContent :option="optionRender?.(item)" />
          </ElCheckbox>
        </template>
      </ElCheckboxGroup>

      <!-- <div v-show="hasNoMatch || isEmpty(data)" :class="ns.be('panel', 'empty')">
        <slot name="empty">
          {{ hasNoMatch ? t("el.transfer.noMatch") : t("el.transfer.noData") }}
        </slot>
      </div> -->
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, reactive, toRefs, useSlots } from "vue";
import { ElCheckbox, ElCheckboxGroup } from "element-plus";
import { ElInput } from "element-plus";
import { Search } from "@element-plus/icons-vue";
import { transferPanelEmits, transferPanelProps } from "./transfer-panel";
import { useCheck, usePropsAlias } from "./composables";
import VirtualList from "vue3-virtual-scroll-list";
import TransferCheckboxItem from "./transfer-checkbox-item.vue";

import type { VNode } from "vue";
import type { TransferPanelState } from "./transfer-panel";
defineOptions({
  name: "ElTransferPanel",
});

const props = defineProps(transferPanelProps) as any;
const emit = defineEmits(transferPanelEmits);
const slots = useSlots();

const OptionContent = ({ option }: { option?: VNode | VNode[] }) => option;

// 工具函数
const isEmpty = (val: unknown): boolean => {
  if (val === null || val === undefined) return true;
  if (typeof val === "string") return val.trim().length === 0;
  if (Array.isArray(val)) return val.length === 0;
  if (typeof val === "object") return Object.keys(val).length === 0;
  return false;
};

// 简单的国际化函数
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const t = (key: string): string => {
  // 简单的翻译映射
  const translations: Record<string, string> = {
    "el.transfer.noMatch": "无匹配数据",
    "el.transfer.noData": "无数据",
  };
  return translations[key] || key;
};

// 简单的命名空间函数
const useNamespace = () => {
  const b = (blockName: string) => `el-${blockName}`;
  const be = (blockName: string, element: string) => `el-${blockName}__${element}`;
  const is = (name: string, condition?: boolean) => (condition ? `is-${name}` : "");
  return { b, be, is };
};

const ns = useNamespace();

const panelState = reactive<TransferPanelState>({
  checked: [],
  allChecked: false,
  query: "",
  checkChangeByUser: true,
});

const propsAlias = usePropsAlias(props);

const { filteredData, isIndeterminate, handleAllCheckedChange } = useCheck(props, panelState, emit);

// 是否启用虚拟滚动（如果 prop 指定则使用 prop，否则根据数据量自动判断）
const virtualScroll = computed(() => {
  if (props.virtualScroll !== undefined && props.virtualScroll !== false) {
    return props.virtualScroll && filteredData.value.length > 0;
  }
  return filteredData.value.length > 50;
});

const hasNoMatch = computed(() => !isEmpty(panelState.query) && isEmpty(filteredData.value));

const hasFooter = computed(() => {
  const defaultSlot = slots.default?.();
  return (
    defaultSlot &&
    defaultSlot.length > 0 &&
    defaultSlot[0].children &&
    !isEmpty(defaultSlot[0].children)
  );
});

const { checked, allChecked, query } = toRefs(panelState);

defineExpose({
  /** @description filter keyword */
  query,
});
</script>
