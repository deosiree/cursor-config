/**
 * @file 操作列宽度子系统：离屏探针、逐字估宽、列宽协调器。
 * @module OperationColumn/operationWidth
 */

import type { VNode, Ref } from "vue";

// ========== 类型与常量 ==========

/** 操作项展示类型（行内 / 更多菜单配色） */
export type OpItemType = "primary" | "danger";

/** 从 OpItem DOM 读取的元数据 */
export interface OpItemMeta {
  label: string;
  icon?: string;
  iconClass?: string;
  type: OpItemType;
}

/** 操作按钮描述（用于列宽公式） */
export interface OpButtonDesc {
  label: string;
  hasIcon: boolean;
  iconWidth?: number;
  /** icon 与文案间距（px） */
  iconMg?: number;
}

/** OpItem 内 icon 槽宽度（px） */
export const OP_ICON_W = 14;

/** OpItem 内 icon 与文案间距（px） */
export const OP_ICON_M = 4;

/** 固定右列与表体纵向滚动条间距（px） */
export const RIGHT_GUT = 8;

/** 与 label font-size:12px 对齐；CJK / 全角字符横向占位（px） */
const CJK_CHAR_PX = 12;

/** 拉丁字母、数字、半角符号横向占位（px） */
const LATIN_CHAR_PX = 7;

/** 「更多」槽最小宽，对齐 .operation-column-more-trigger min-width */
const MORE_SLOT_MIN = 40;

/** 与 OpItem 根节点 min-width 对齐（px） */
export const OP_MIN_W = 32;

/** 离屏探针最多渲染的代表行数 */
export const MAX_PROBE_N = 24;

const BTN_H_PADDING = 12;
const ICON_LABEL_GAP = 4;
const ICON_UNIT = OP_ICON_W + OP_ICON_M + ICON_LABEL_GAP;
const ROW_BUF = 4;

/** 列宽协调器：仅存离屏探针场景并按公式写 colWMax */
export interface WidthCoord {
  /** 写入离屏探针得到的各场景 OpItem 列表并重算列宽 */
  setSlotScn(scenarios: OpButtonDesc[][]): void;
  /** inlineVisibleCount / 更多文案变化：用已存场景重算列宽，不跑离屏 DOM */
  recalcStored(): void;
}

// ========== 离屏探针 slot 规范化 ==========

function isVNode(value: unknown): value is VNode {
  return typeof value === "object" && value !== null && "type" in value;
}

/**
 * 将 default slot 返回值规范为 VNode 列表，供离屏 render 使用。
 * @param content - `slots.default({ row })` 的返回值
 */
export function normProbeVn(content: unknown): VNode[] {
  if (content == null) return [];
  if (Array.isArray(content)) return content.filter(isVNode);
  if (isVNode(content)) return [content];
  return [];
}

// ========== 逐字估宽 ==========

/** 是否为 CJK / 全角字符（与 12px 标签字体下的占位对齐）。 */
export function isCjkFull(ch: string): boolean {
  const cp = ch.codePointAt(0);
  if (cp === undefined) return false;
  if (cp <= 0xff) return false;
  if (cp >= 0x4e00 && cp <= 0x9fff) return true;
  if (cp >= 0x3400 && cp <= 0x4dbf) return true;
  if (cp >= 0xff00 && cp <= 0xffef) return true;
  if (cp >= 0x3000 && cp <= 0x303f) return true;
  return false;
}

/**
 * 按 CJK / 拉丁分档累加文案像素宽。
 * @param text - 按钮文案（支持 i18n 混排）
 */
export function labelTextW(text: string): number {
  let w = 0;
  for (const ch of text) {
    w += isCjkFull(ch) ? CJK_CHAR_PX : LATIN_CHAR_PX;
  }
  return w;
}

/**
 * 估算「更多」槽位宽度（px）。
 * @param moreLabel - 「更多」按钮文案
 */
export function moreSlotW(moreLabel: string): number {
  return Math.max(MORE_SLOT_MIN, labelTextW(moreLabel) + ICON_UNIT + BTN_H_PADDING);
}

/** 单个 OpItem 内容区估宽（对齐 min-width:32px 与文案/icon）。 */
export function opItemW(desc: OpButtonDesc): number {
  const textW = labelTextW(desc.label);
  const iconW = desc.hasIcon ? ICON_UNIT : 0;
  return Math.max(OP_MIN_W, textW + iconW + BTN_H_PADDING);
}

/**
 * 按行内条总槽位数（含「更多」）解析行内 OpItem 个数与是否显示「更多」。
 * @param totalButtons - 当前场景可见 OpItem 总数 N
 * @param displaySlotCount - 行内条槽位总数（含「更多」占 1 槽），小于 1 按 1 处理
 * @returns inlineOpCount 行内直接露出的个数；showMore 是否渲染「更多」
 */
export function calcOpStrip(
  totalButtons: number,
  displaySlotCount: number
): { inlineOpCount: number; showMore: boolean } {
  const slots = Math.max(displaySlotCount, 1);
  if (totalButtons <= 0) {
    return { inlineOpCount: 0, showMore: false };
  }
  /** slots=1：整行仅「更多」槽，全部 OpItem 进下拉 */
  if (slots === 1) {
    return { inlineOpCount: 0, showMore: true };
  }
  if (totalButtons <= slots) {
    return { inlineOpCount: totalButtons, showMore: false };
  }
  const inlineOpCount = slots - 1;
  const overflowCount = totalButtons - inlineOpCount;
  if (overflowCount <= 1) {
    return { inlineOpCount: totalButtons, showMore: false };
  }
  return { inlineOpCount, showMore: true };
}

/**
 * 单场景操作条总宽度（px）。
 * @param displaySlotCount - 行内条总槽位数（含「更多」），与 calcOpStrip 一致
 */
export function stripSceneW(
  descs: OpButtonDesc[],
  displaySlotCount: number,
  gap: number,
  moreLabel: string
): number {
  if (descs.length === 0) return 0;

  const { inlineOpCount, showMore } = calcOpStrip(descs.length, displaySlotCount);

  if (showMore && inlineOpCount === 0) {
    return moreSlotW(moreLabel) + ROW_BUF;
  }

  const n = Math.min(inlineOpCount, descs.length);
  const inline = descs.slice(0, n);
  let w = 0;

  if (n >= 2) {
    w = inline.reduce((sum, d) => sum + opItemW(d), 0);
    w += Math.max(0, n - 1) * gap;
  } else if (n === 1) {
    w = opItemW(inline[0]);
  }

  if (showMore) {
    w += (n > 0 ? gap : 0) + moreSlotW(moreLabel);
  }

  return w + ROW_BUF;
}

/**
 * 由多组探针场景取列宽内容区上限（逐字估宽，无 Canvas）。
 * @param displaySlotCount - 行内条总槽位数（含「更多」）
 */
export function maxFromSlots(
  displaySlotCount: number,
  gap: number,
  moreLabel: string,
  scenarios: OpButtonDesc[][]
): number {
  const seenConcats = new Set<string>();
  let maxW = 0;

  for (const descs of scenarios) {
    if (descs.length === 0) continue;

    const { inlineOpCount } = calcOpStrip(descs.length, displaySlotCount);
    const n = Math.min(inlineOpCount, descs.length);

    if (n === 0) {
      const w = stripSceneW(descs, displaySlotCount, gap, moreLabel);
      if (w > maxW) maxW = w;
      continue;
    }

    const concat =
      n >= 2
        ? descs
            .slice(0, n)
            .map((d) => d.label)
            .join("\x1f")
        : descs
            .slice(0, n)
            .map((d) => d.label)
            .join("");
    if (seenConcats.has(concat)) continue;
    seenConcats.add(concat);

    const w = stripSceneW(descs, displaySlotCount, gap, moreLabel);
    if (w > maxW) maxW = w;
  }

  return maxW;
}

// ========== DOM 元数据 ==========

/** 从 OpItem 根节点读取 data-op-*。 */
export function readOpMeta(el: HTMLElement): OpItemMeta {
  return {
    label: el.dataset.opLabel ?? "",
    icon: el.dataset.opIcon || undefined,
    iconClass: el.dataset.opIconClass || undefined,
    type: (el.dataset.opType as OpItemType) || "primary",
  };
}

/**
 * 扫描容器内未隐藏的 OpItem，供离屏探针读最终可见态。
 * @param rootEl - 探针宿主或行内容器
 */
export function scanOpButtons(rootEl: HTMLElement): OpButtonDesc[] {
  const items = rootEl.querySelectorAll(
    ".operation-column-op-item:not(.operation-column-op-item--hidden)"
  );
  return Array.from(items).map((item) => {
    const meta = readOpMeta(item as HTMLElement);
    const hasIcon = !!(meta.icon || meta.iconClass);

    return {
      label: meta.label,
      hasIcon,
      iconWidth: hasIcon ? OP_ICON_W : undefined,
      iconMg: hasIcon ? OP_ICON_M : undefined,
    };
  });
}

/** 树表 DFS 展平 :data，供代表行选取与指纹。 */
export function flatForProbe(
  rows: unknown[] | null | undefined,
  childrenKey = "children"
): unknown[] {
  if (!rows?.length) return [];

  const out: unknown[] = [];
  const walk = (list: unknown[]) => {
    for (const row of list) {
      if (row == null) continue;
      out.push(row);
      if (typeof row === "object" && row !== null) {
        const children = (row as Record<string, unknown>)[childrenKey];
        if (Array.isArray(children) && children.length > 0) {
          walk(children);
        }
      }
    }
  };
  walk(rows);
  return out;
}

/**
 * 影响 slot v-if 的轻量指纹（status / type / showResendActivation）。
 * 行数不变、字段原地变时触发列宽重探针。
 */
export function tblProbeFp(rows: unknown[] | null | undefined, childrenKey = "children"): string {
  return flatForProbe(rows, childrenKey)
    .map((row) => {
      if (row == null || typeof row !== "object") return "";
      const r = row as Record<string, unknown>;
      return `${r.status ?? ""}|${r.type ?? ""}|${r.showResendActivation ? 1 : 0}`;
    })
    .join("\n");
}

/** 从表数据选取离屏探针代表行（type/status 去重 + showResendActivation 分支）。 */
export function pickProbeRows(
  rows: unknown[] | null | undefined,
  childrenKey = "children"
): unknown[] {
  const flattened = flatForProbe(rows, childrenKey);
  if (flattened.length === 0) return [];

  const picked: unknown[] = [];
  const seenType = new Set<unknown>();
  const seenStatus = new Set<unknown>();
  let pickedResend = false;

  for (const row of flattened) {
    if (row == null || typeof row !== "object") continue;
    const record = row as Record<string, unknown>;

    if ("type" in record) {
      const typeVal = record.type;
      if (!seenType.has(typeVal)) {
        seenType.add(typeVal);
        picked.push(row);
      }
    }

    if ("status" in record) {
      const statusVal = record.status;
      if (!seenStatus.has(statusVal)) {
        seenStatus.add(statusVal);
        if (!picked.includes(row)) picked.push(row);
      }
    }

    if (record.showResendActivation === true && !pickedResend) {
      pickedResend = true;
      if (!picked.includes(row)) picked.push(row);
    }
  }

  if (picked.length === 0) {
    return flattened.slice(0, Math.min(8, flattened.length));
  }

  if (
    seenType.size === 0 &&
    seenStatus.size === 0 &&
    flattened[0] != null &&
    !picked.includes(flattened[0])
  ) {
    picked.unshift(flattened[0]);
  }

  return picked.slice(0, MAX_PROBE_N);
}

/** 探针场景内按 label 去重（同 label 视为同一 OpItem 配置）。 */
export function dedupeByLbl(descs: OpButtonDesc[]): OpButtonDesc[] {
  const seen = new Set<string>();
  const out: OpButtonDesc[] = [];
  for (const d of descs) {
    if (!d.label || seen.has(d.label)) continue;
    seen.add(d.label);
    out.push(d);
  }
  return out;
}

// ========== 列宽协调器 ==========

/** 创建列宽协调器：列宽仅由离屏探针场景 + 估宽公式决定。 */
export function mkWidthCoord(options: {
  getSlotCnt: () => number;
  getActionGap: () => number;
  colWMax: Ref<number>;
  getMoreLabel: () => string;
}): WidthCoord {
  let slotScenarios: OpButtonDesc[][] = [];

  /** 用已存 slotScenarios 写 colWMax */
  function applySlotWidth() {
    options.colWMax.value = maxFromSlots(
      options.getSlotCnt(),
      options.getActionGap(),
      options.getMoreLabel(),
      slotScenarios
    );
  }

  function setSlotScn(scenarios: OpButtonDesc[][]) {
    slotScenarios = scenarios.map((list) => list.map((d) => ({ ...d })));
    applySlotWidth();
  }

  function recalcStored() {
    applySlotWidth();
  }

  return {
    setSlotScn,
    recalcStored,
  };
}
