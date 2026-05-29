import { transferCheckedChangeFn, transferProps } from "./transfer";

import type { ExtractPropTypes, VNode, PropType } from "vue";

// 类型工具：提取公共 props 类型（简化版）
type __ExtractPublicPropTypes<T> = ExtractPropTypes<T>;
import type { TransferDataItem, TransferKey } from "./transfer";
import type TransferPanel from "./transfer-panel.vue";

// 工具函数：定义属性类型
const definePropType = <T>(val: any): PropType<T> => val;

// 工具函数：构建 props（简化版）
const buildProps = <T extends Record<string, any>>(props: T): T => props;

export interface TransferPanelState {
  checked: TransferKey[];
  allChecked: boolean;
  query: string;
  checkChangeByUser: boolean;
}

export const CHECKED_CHANGE_EVENT = "checked-change";

export const transferPanelProps = buildProps({
  data: transferProps.data,
  optionRender: {
    type: definePropType<(option: TransferDataItem) => VNode | VNode[]>(Function),
  },
  placeholder: String,
  title: String,
  filterable: Boolean,
  format: transferProps.format,
  filterMethod: transferProps.filterMethod,
  defaultChecked: transferProps.leftDefaultChecked,
  props: transferProps.props,
  virtualScroll: Boolean,
} as const);
export type TransferPanelProps = ExtractPropTypes<typeof transferPanelProps>;
export type TransferPanelPropsPublic = __ExtractPublicPropTypes<typeof transferPanelProps>;

export const transferPanelEmits = {
  [CHECKED_CHANGE_EVENT]: transferCheckedChangeFn,
};
export type TransferPanelEmits = typeof transferPanelEmits;

export type TransferPanelInstance = InstanceType<typeof TransferPanel> & unknown;
