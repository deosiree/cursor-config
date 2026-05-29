import { computed } from "vue";

import type { TransferPropsAlias } from "../transfer";
import type { TransferPanelProps } from "../transfer-panel";

export const usePropsAlias = (props: TransferPanelProps | { props: TransferPropsAlias }) => {
  const initProps: Required<TransferPropsAlias> = {
    label: "label",
    key: "key",
    disabled: "disabled",
  };

  // 兼容两种 props 结构
  const propsAlias =
    "props" in props ? props.props : (props as TransferPanelProps).props || initProps;

  return computed(() => ({
    ...initProps,
    ...propsAlias,
  }));
};
