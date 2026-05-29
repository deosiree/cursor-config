import { computed, watch } from "vue";
import { CHECKED_CHANGE_EVENT } from "../transfer-panel";
import { usePropsAlias } from "./use-props-alias";

import type { SetupContext } from "vue";
import type { TransferKey } from "../transfer";
import type { TransferPanelEmits, TransferPanelProps, TransferPanelState } from "../transfer-panel";

// 工具函数
// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
const isFunction = (val: unknown): val is Function => typeof val === "function";

// CheckboxValueType 类型定义
type CheckboxValueType = string | number | boolean;

export const useCheck = (
  props: TransferPanelProps,
  panelState: TransferPanelState,
  emit: SetupContext<TransferPanelEmits>["emit"]
) => {
  const propsAlias = usePropsAlias(props);

  const filteredData = computed(() => {
    return props.data.filter((item: any) => {
      if (isFunction(props.filterMethod)) {
        return props.filterMethod(panelState.query, item);
      } else {
        const label = String(item[propsAlias.value.label] || item[propsAlias.value.key]);
        return label.toLowerCase().includes(panelState.query.toLowerCase());
      }
    });
  });

  const checkableData = computed(() =>
    filteredData.value.filter((item: any) => !item[propsAlias.value.disabled])
  );

  const checkedSummary = computed(() => {
    const checkedLength = panelState.checked.length;
    const dataLength = props.data.length;
    const { noChecked, hasChecked } = props.format;

    if (noChecked && hasChecked) {
      return checkedLength > 0
        ? hasChecked
            .replace(/\${checked}/g, checkedLength.toString())
            .replace(/\${total}/g, dataLength.toString())
        : noChecked.replace(/\${total}/g, dataLength.toString());
    } else {
      return `${checkedLength}/${dataLength}`;
    }
  });

  const isIndeterminate = computed(() => {
    const checkedLength = panelState.checked.length;
    return checkedLength > 0 && checkedLength < checkableData.value.length;
  });

  const updateAllChecked = () => {
    const checkableDataKeys = checkableData.value.map((item: any) => item[propsAlias.value.key]);
    panelState.allChecked =
      checkableDataKeys.length > 0 &&
      checkableDataKeys.every((item: TransferKey) => panelState.checked.includes(item));
  };

  const handleAllCheckedChange = (value: CheckboxValueType) => {
    panelState.checked = value
      ? checkableData.value.map((item: any) => item[propsAlias.value.key])
      : [];
  };

  watch(
    () => panelState.checked,
    (val, oldVal) => {
      updateAllChecked();

      if (panelState.checkChangeByUser) {
        const movedKeys = val
          .concat(oldVal)
          .filter((v: TransferKey) => !val.includes(v) || !oldVal.includes(v));
        emit(CHECKED_CHANGE_EVENT, val, movedKeys);
      } else {
        emit(CHECKED_CHANGE_EVENT, val);
        panelState.checkChangeByUser = true;
      }
    }
  );

  watch(checkableData, () => {
    updateAllChecked();
  });

  watch(
    () => props.data,
    () => {
      const checked: TransferKey[] = [];
      const filteredDataKeys = filteredData.value.map((item: any) => item[propsAlias.value.key]);
      panelState.checked.forEach((item: TransferKey) => {
        if (filteredDataKeys.includes(item)) {
          checked.push(item);
        }
      });
      panelState.checkChangeByUser = false;
      panelState.checked = checked;
    }
  );

  watch(
    () => props.defaultChecked,
    (val, oldVal) => {
      if (
        oldVal &&
        val.length === oldVal.length &&
        val.every((item: TransferKey) => oldVal.includes(item))
      )
        return;

      const checked: TransferKey[] = [];
      const checkableDataKeys = checkableData.value.map((item: any) => item[propsAlias.value.key]);

      val.forEach((item: TransferKey) => {
        if (checkableDataKeys.includes(item as any)) {
          checked.push(item);
        }
      });
      panelState.checkChangeByUser = false;
      panelState.checked = checked;
    },
    {
      immediate: true,
    }
  );

  return {
    filteredData,
    checkableData,
    checkedSummary,
    isIndeterminate,
    updateAllChecked,
    handleAllCheckedChange,
  };
};
