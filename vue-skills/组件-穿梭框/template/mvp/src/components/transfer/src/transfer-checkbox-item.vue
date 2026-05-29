<template>
  <el-checkbox
    class="el-transfer-panel__item"
    :value="source[keyProp]"
    :disabled="source[disabledProp]"
  >
    <OptionContent :option="source" />
  </el-checkbox>
</template>

<script setup lang="ts">
import { h, getCurrentInstance } from "vue";
import type { TransferDataItem } from "./transfer";

defineOptions({
  name: "TransferCheckboxItem",
});

interface Props {
  /** index of current item */
  index?: number;
  /** here is: {uid: 'unique_1', text: 'abc'} */
  source: TransferDataItem;
  keyProp?: string;
  disabledProp?: string;
}

withDefaults(defineProps<Props>(), {
  keyProp: "key",
  disabledProp: "disabled",
});

// OptionContent 组件：用于渲染选项内容
const OptionContent = ({ option }: { option: TransferDataItem }) => {
  const instance = getCurrentInstance();

  if (!instance) {
    return h("span", option.label || option.key || "");
  }

  // 获取父组件（TransferPanel）
  const getParent = (vm: any): any => {
    if (!vm) return null;
    // Vue 3 中通过 type.name 或 __name 获取组件名
    const componentName = vm.type?.name || vm.type?.__name || vm.$options?.name;
    if (componentName === "ElTransferPanel") {
      return vm;
    } else if (vm.parent) {
      return getParent(vm.parent);
    } else {
      return vm;
    }
  };

  const panel = getParent(instance);
  const transfer = panel?.parent || panel;

  // 优先使用 panel 的 optionRender
  if (panel?.exposed?.optionRender) {
    const renderContent = panel.exposed.optionRender;
    if (typeof renderContent === "function") {
      return renderContent(option);
    }
  }

  // 其次使用 transfer 的 default slot
  if (transfer?.slots?.default) {
    const defaultSlot = transfer.slots.default({ option });
    if (defaultSlot && defaultSlot.length > 0) {
      return defaultSlot;
    }
  }

  // 最后使用默认渲染
  const labelProp = panel?.exposed?.propsAlias?.value?.label || "label";
  const keyProp = panel?.exposed?.propsAlias?.value?.key || "key";
  return h("span", option[labelProp] || option[keyProp] || "");
};
</script>

<style scoped lang="scss">
.el-transfer-panel__item {
  .el-checkbox {
    margin-right: 0 !important;
  }
}
</style>
