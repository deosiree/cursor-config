import type { TransferDataItem } from "../transfer";

/** 设备穿梭框单列：表头文案 + 从 option 取值 */
export interface DeviceTransferColumn {
  /** 表头文案（业务层完成翻译后传入） */
  label: string;
  /** 从穿梭项 option 读取单元格展示值 */
  getValue: (option: TransferDataItem) => string | undefined;
}

/** 外壳默认可视高度 */
export const DEVICE_TRANSFER_HOST_HEIGHT_DEFAULT = "500px";

/**
 * 根据列定义生成默认搜索过滤：在各列 getValue 结果中做包含匹配。
 * @param columns 列配置
 * @returns 可供 Transfer filterMethod 使用的函数
 */
export function createDefaultFilterMethod(
  columns: DeviceTransferColumn[]
): (query: string, item: TransferDataItem) => boolean {
  return (query: string, item: TransferDataItem) => {
    const q = (query || "").trim().toLowerCase();
    if (!q) return true;
    return columns.some((col) => (col.getValue(item) ?? "").toString().toLowerCase().includes(q));
  };
}

/**
 * 等分 N 列的 grid-template-columns 字符串。
 * @param columnCount 列数，至少为 1
 */
export function buildEqualColumnGrid(columnCount: number): string {
  const n = Math.max(1, columnCount);
  return `repeat(${n}, minmax(0, 1fr))`;
}
