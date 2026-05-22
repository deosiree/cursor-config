/**
 * @file 操作列宽度子系统：slot 采集、逐字估宽、列宽协调器、行 DOM 补偿。
 * @module OperationColumn/operationWidth
 */

import { Fragment, type VNode, type Ref } from "vue";

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
  iconMarginRight?: number;
}

/** OpItem 内 icon 槽宽度（px） */
export const OP_ITEM_ICON_WIDTH = 14;

/** OpItem 内 icon 与文案间距（px） */
export const OP_ITEM_ICON_MARGIN = 4;

/** 固定右列与表体纵向滚动条间距（px），供 finalWidth 补偿 */
export const FIXED_RIGHT_GUTTER = 8;

/** 与 label font-size:12px 对齐；CJK / 全角字符横向占位（px） */
const LABEL_CJK_CHAR_PX = 12;

/** 拉丁字母、数字、半角符号横向占位（px） */
const LABEL_LATIN_CHAR_PX = 7;

/** 「更多」槽最小宽，对齐 .operation-column-more-trigger min-width */
const MORE_SLOT_MIN = 40;

/** 与 OpItem 根节点 min-width 对齐（px） */
export const OP_ITEM_MIN_WIDTH = 32;

/** 离屏探针最多渲染的代表行数，避免大树全表扫描 */
export const MAX_PROBE_REPRESENTATIVE_ROWS = 24;

/** OpItem 左右 padding 及 EP link 渲染余量（px） */
const BTN_H_PADDING = 12;

/** icon 与文案之间的额外间隙（px） */
const ICON_LABEL_GAP = 4;

/** 单个 icon 槽横向占用：icon 宽 + 间距 + 文案间隙 */
const ICON_UNIT = OP_ITEM_ICON_WIDTH + OP_ITEM_ICON_MARGIN + ICON_LABEL_GAP;

const ROW_WIDTH_BUFFER = 4;

/** inject/provide 键：列宽协调器 */
export const OPERATION_COLUMN_WIDTH_KEY = Symbol("operationColumnWidth");

/** 列宽协调器对外能力 */
export interface OperationColumnWidthContext {
  /** 行 DOM 实测略宽时抬升列宽；不按行 desc 重算公式 */
  registerRowSignature(descs: OpButtonDesc[], domContentWidth?: number): void;
  /** inlineVisibleCount / 更多文案变化时，按 slot 场景重算列宽 */
  recalculateFromStored(): void;
  /** 列表代际变化：清行签名缓存，列宽仍从 slot 场景重算 */
  resetSignatures(): void;
  /**
   * 写入 slot 探针得到的按钮场景（表格行渲染前）。
   * 用于首屏列宽与 reset 后重算，不依赖行 DOM。
   */
  setSlotScenarios(scenarios: OpButtonDesc[][]): void;
}

// ========== 逐字估宽（列宽主路径，无 Canvas） ==========

/**
 * 是否为 CJK / 全角字符（与 12px 标签字体下的全角占位对齐）。
 */
export function isCjkOrFullwidth(ch: string): boolean {
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
 * 计算字符串的真实宽度（基于语种，区分字符宽度）
 * 按 CJK / 拉丁分档累加文案像素宽（支持 i18n 混排）。
 */
export function measureLabelTextWidth(text: string): number {
  let w = 0;
  for (const ch of text) {
    w += isCjkOrFullwidth(ch) ? LABEL_CJK_CHAR_PX : LABEL_LATIN_CHAR_PX;
  }
  return w;
}

// ========== slot VNode 采集 ==========

/**
 * 检查给定的值是否为 VNode 对象。
 *
 * @param value - 需要检查的任意类型值。
 * @returns 如果值是 VNode 对象则返回 true，否则返回 false。此函数作为类型守卫，可将参数类型窄化为 VNode。
 */
function isVNode(value: unknown): value is VNode {
  return typeof value === "object" && value !== null && "type" in value;
}

/**
 * 判断给定的 VNode 是否为 OpItem 组件的虚拟节点。
 *
 * @param vnode - 需要检查的虚拟节点对象
 * @returns 如果该节点是 OpItem 组件则返回 true，否则返回 false
 */
function isOpItemVNode(vnode: VNode): boolean {
  const type = vnode.type;

  // 排除非对象类型或 null 类型的 vnode.type
  if (typeof type !== "object" || type === null) return false;

  // 尝试从 type 对象中获取组件名称，优先使用 __name，其次使用 name
  const name =
    (type as { __name?: string; name?: string }).__name ??
    (type as { __name?: string; name?: string }).name;

  return name === "OpItem";
}

/**
 * 将虚拟节点（VNode）转换为操作按钮描述对象。
 *
 * 该函数从 VNode 的属性中提取标签、图标等信息，并计算相关的样式配置。
 * 若属性无效或缺少必要的标签，则返回 null。
 *
 * @param vnode - 输入的虚拟节点对象，用于提取按钮配置信息
 * @returns 如果转换成功，返回包含标签、图标状态及样式间距的操作按钮描述对象；否则返回 null
 */
function vnodeToDesc(vnode: VNode): OpButtonDesc | null {
  const raw = vnode.props as Record<string, unknown> | null;
  if (!raw) return null;
  const label = raw.label;
  if (typeof label !== "string" || !label) return null;

  // 提取图标相关属性并判断是否存在图标
  const icon = raw.icon as string | undefined;
  const iconClass = (raw.iconClass ?? raw["icon-class"]) as string | undefined;
  const hasIcon = !!(icon || iconClass);

  return {
    label,
    hasIcon,
    iconWidth: hasIcon ? OP_ITEM_ICON_WIDTH : undefined,
    iconMarginRight: hasIcon ? OP_ITEM_ICON_MARGIN : undefined,
  };
}

/**
 * 递归遍历虚拟节点（VNode）数组，提取操作项描述并收集到输出数组中。
 *
 * 该函数会处理以下情况：
 * 1. 跳过空节点。
 * 2. 如果节点是操作项（OpItem），将其转换为描述对象并添加到输出数组。
 * 3. 如果节点是 Fragment 类型，递归处理其子节点数组。
 * 4. 对于其他普通节点，递归处理其子节点数组。
 *
 * @param nodes - 要遍历的虚拟节点数组
 * @param out - 用于收集提取出的操作按钮描述的结果数组
 */
function walkVNodes(nodes: VNode[], out: OpButtonDesc[]): void {
  for (const node of nodes) {
    if (!node) continue;

    // 处理操作项节点：转换并收集描述
    if (isOpItemVNode(node)) {
      const desc = vnodeToDesc(node);
      if (desc) out.push(desc);
      continue;
    }

    // 处理 Fragment 节点：递归遍历其子节点
    if (node.type === Fragment) {
      const children = node.children;
      if (Array.isArray(children)) {
        for (const child of children) {
          if (isVNode(child)) walkVNodes([child], out);
        }
      }
      continue;
    }

    // 处理普通节点：递归遍历其子节点
    const children = node.children;
    if (Array.isArray(children)) {
      for (const child of children) {
        if (isVNode(child)) walkVNodes([child], out);
      }
    }
  }
}

/**
 * 将未知类型的输入值标准化为 VNode 数组。
 *
 * - 如果输入为 null 或 undefined，返回空数组。
 * - 如果输入是数组，则过滤出其中有效的 VNode 元素。
 * - 如果输入是单个 VNode，则将其包裹为单元素数组返回。
 * - 其他情况均返回空数组。
 *
 * @param result - 需要标准化的未知类型值
 * @returns 标准化后的 VNode 数组
 */
function normalizeVNodes(result: unknown): VNode[] {
  // 处理 null 或 undefined 的情况
  if (result == null) return [];

  // 处理数组输入，仅保留有效的 VNode
  if (Array.isArray(result)) return result.filter(isVNode);

  // 处理单个 VNode 输入
  if (isVNode(result)) return [result];

  // 其他无效类型返回空数组
  return [];
}

/**
 * 从虚拟节点（VNodes）中收集操作按钮描述信息。
 *
 * @param vnodes - 输入的虚拟节点数据，类型未知，将在内部进行标准化处理。
 * @returns 返回一个包含所有提取到的操作按钮描述（OpButtonDesc）的数组。
 */
export function collectOpsFromVNodes(vnodes: unknown): OpButtonDesc[] {
  const out: OpButtonDesc[] = [];

  // 标准化虚拟节点并递归遍历以收集操作按钮描述
  walkVNodes(normalizeVNodes(vnodes), out);

  return out;
}

// ========== slot 场景列宽（唯一公式主路径） ==========

/**
 * 计算“更多”槽位的估算宽度
 *
 * 该函数根据提供的标签文本，结合图标宽度和按钮内边距，
 * 计算出“更多”槽位所需的最小显示宽度。
 * 最终结果不会小于预设的最小槽位宽度（MORE_SLOT_MIN）。
 *
 * @param moreLabel - “更多”按钮显示的标签文本
 * @returns 返回计算后的槽位估算宽度（像素值）
 */
export function measureMoreSlotEstWidth(moreLabel: string): number {
  return Math.max(
    MORE_SLOT_MIN, // 最小槽位宽度
    measureLabelTextWidth(moreLabel) + // 标签文本宽度
      ICON_UNIT + // 图标宽度
      BTN_H_PADDING // 按钮内边距
  );
}

/**
 * 单个 OpItem 内容区估宽（对齐 min-width:32px 与文案/icon）。
 */
export function measureSingleOpItemContentWidth(desc: OpButtonDesc): number {
  const textW = measureLabelTextWidth(desc.label);
  const iconW = desc.hasIcon ? ICON_UNIT : 0;
  return Math.max(OP_ITEM_MIN_WIDTH, textW + iconW + BTN_H_PADDING);
}

/**
 * 计算场景操作条的总宽度
 *
 * @param descs - 操作按钮描述数组，包含标签、图标等信息
 * @param inlineVisibleCount - 期望内联显示的最大按钮数量
 * @param gap - 按钮之间的间距
 * @param moreLabel - “更多”按钮的标签文本
 * @param reserveMoreSlot - 跨场景最大按钮数超过 inline 时，本场景也需预留「更多」槽
 * @returns 计算得到的操作条总宽度（像素）
 */
export function measureScenarioStripWidth(
  descs: OpButtonDesc[],
  inlineVisibleCount: number,
  gap: number,
  moreLabel: string,
  reserveMoreSlot = false
): number {
  const n = Math.min(Math.max(inlineVisibleCount, 0), descs.length);

  if (n === 0 && descs.length > 0) {
    return measureMoreSlotEstWidth(moreLabel) + ROW_WIDTH_BUFFER;
  }
  if (n === 0) return 0;

  const inline = descs.slice(0, n);
  let w: number;

  if (n >= 2) {
    w = inline.reduce((sum, d) => sum + measureSingleOpItemContentWidth(d), 0);
    w += Math.max(0, n - 1) * gap;
  } else {
    const d = inline[0];
    w = measureSingleOpItemContentWidth(d);
  }

  const needsMore = reserveMoreSlot || descs.length > n;
  if (needsMore) {
    w += (n > 0 ? gap : 0) + measureMoreSlotEstWidth(moreLabel);
  }

  return w + ROW_WIDTH_BUFFER;
}

/**
 * 由 slot 探针得到的多个场景计算列宽内容区上限。
 * 外露 label 拼接串按 Set 去重后，对每条串用逐字估宽参与场景宽度计算。
 */
export function measureWidthFromSlotScenarios(
  inlineVisibleCount: number,
  gap: number,
  moreLabel: string,
  scenarios: OpButtonDesc[][]
): number {
  const seenConcats = new Set<string>();
  let maxW = 0;

  const globalMaxBtn = scenarios.reduce((max, descs) => Math.max(max, descs.length), 0);
  const reserveMoreSlot = globalMaxBtn > Math.max(inlineVisibleCount, 0);

  for (const descs of scenarios) {
    if (descs.length === 0) continue;

    const n = Math.min(Math.max(inlineVisibleCount, 0), descs.length);

    if (n === 0) {
      const w = measureScenarioStripWidth(descs, 0, gap, moreLabel, reserveMoreSlot);
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

    const w = measureScenarioStripWidth(
      descs,
      inlineVisibleCount,
      gap,
      moreLabel,
      reserveMoreSlot
    );
    if (w > maxW) maxW = w;
  }

  return maxW;
}

// ========== DOM 元数据 ==========

/**
 * 从 OpItem 根节点读取 data-op-*，供溢出菜单展示与行扫描复用。
 */
export function readOpItemMetaFromEl(el: HTMLElement): OpItemMeta {
  return {
    label: el.dataset.opLabel ?? "",
    icon: el.dataset.opIcon || undefined,
    iconClass: el.dataset.opIconClass || undefined,
    type: (el.dataset.opType as OpItemType) || "primary",
  };
}

/**
 * 从行内容器扫描 OpItem 文案与 icon 信息。
 */
export function scanOpButtons(rootEl: HTMLElement): OpButtonDesc[] {
  const items = rootEl.querySelectorAll(
    ".operation-column-op-item:not(.operation-column-op-item--hidden)"
  ); // 获取所有不隐藏的操作项
  return Array.from(items).map((item) => {
    const meta = readOpItemMetaFromEl(item as HTMLElement);
    const hasIcon = !!(meta.icon || meta.iconClass); // icon和iconClass都不携带，那就是不带icon

    return {
      label: meta.label,
      hasIcon,
      iconWidth: hasIcon ? OP_ITEM_ICON_WIDTH : undefined,
      iconMarginRight: hasIcon ? OP_ITEM_ICON_MARGIN : undefined,
    };
  });
}

/**
 * 按 label 去重（同表内同 label 对应同一 OpItem 配置，探针场景内只保留首次）。
 */
/**
 * 将 el-table :data 展平为行列表（树表 DFS）。
 */
export function flattenTableRowsForProbe(
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
 * 从表数据选取离屏探针代表行：按 type 去重、覆盖 showResendActivation 等常见 v-if 分支。
 */
export function collectProbeRowsFromTableData(
  rows: unknown[] | null | undefined,
  childrenKey = "children"
): unknown[] {
  const flattened = flattenTableRowsForProbe(rows, childrenKey);
  if (flattened.length === 0) return [];

  const picked: unknown[] = [];
  const seenType = new Set<unknown>();
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

    if (record.showResendActivation === true && !pickedResend) {
      pickedResend = true;
      if (!picked.includes(row)) picked.push(row);
    }
  }

  if (picked.length === 0) {
    return flattened.slice(0, Math.min(8, flattened.length));
  }

  if (seenType.size === 0 && flattened[0] != null && !picked.includes(flattened[0])) {
    picked.unshift(flattened[0]);
  }

  return picked.slice(0, MAX_PROBE_REPRESENTATIVE_ROWS);
}

export function dedupeDescsByLabel(descs: OpButtonDesc[]): OpButtonDesc[] {
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

/**
 * 创建操作列宽度协调器：列宽由 slot 场景公式决定，行挂载仅 DOM 补偿。
 */
export function createOperationColumnWidthCoordinator(options: {
  getInlineVisibleCount: () => number;
  getActionGap: () => number;
  compactWidthMax: Ref<number>;
  getMoreLabel: () => string;
}): OperationColumnWidthContext {
  const seenSignatures = new Set<string>();

  /** useSlots 探针得到的各场景 OpItem 列表（行渲染前即可用） */
  let slotScenarios: OpButtonDesc[][] = [];

  /**
   * 根据操作按钮描述数组生成唯一的签名字符串。
   * 该签名由每个按钮的标签和图标状态组成，用于标识一组特定的按钮配置。
   *
   * @param descs - 操作按钮描述对象数组，包含标签和是否有图标等信息
   * @returns 生成的签名字符串，各按钮信息通过单元分隔符 (\x1f) 连接
   */
  function signatureKey(descs: OpButtonDesc[]): string {
    return descs.map((d) => `${d.label}|${d.hasIcon ? 1 : 0}`).join("\x1f");
  }

  /**
   * 计算并应用插槽的最大紧凑宽度。
   *
   * 该函数通过测量不同插槽场景下的宽度，确定在紧凑模式下允许的最大宽度值，
   * 并将其赋值给 options.compactWidthMax。
   */
  function applySlotWidth() {
    options.compactWidthMax.value = measureWidthFromSlotScenarios(
      options.getInlineVisibleCount(),
      options.getActionGap(),
      options.getMoreLabel(),
      slotScenarios
    );
  }

  /**
   * 设置插槽场景数据，并应用插槽宽度。
   * @param scenarios - 二维数组，表示操作按钮描述的场景列表。
   */
  function setSlotScenarios(scenarios: OpButtonDesc[][]) {
    // 深拷贝场景数据以避免外部修改影响内部状态
    slotScenarios = scenarios.map((list) => list.map((d) => ({ ...d })));
    applySlotWidth();
  }

  /**
   * 注册行签名，用于去重统计；不修改 compactWidthMax（列宽由离屏探针一次性确定）。
   *
   * @param descs - 操作按钮描述数组，用于生成唯一签名
   * @param _domContentWidth - 保留参数供 OperationCellOverflow 调用，不参与列宽修正
   */
  function registerRowSignature(descs: OpButtonDesc[], _domContentWidth?: number) {
    if (descs.length === 0) return;

    const sig = signatureKey(descs); // 根据操作按钮描述数组生成唯一的签名字符串
    if (seenSignatures.has(sig)) return; // 如果已经见过这个签名，则返回
    seenSignatures.add(sig); // 如果没见过这个签名，则添加到已见过签名集合中
  }

  /**
   * 重置签名状态并重新应用槽位宽度。
   * 清除已见过的签名集合，并调用 applySlotWidth 更新布局。
   */
  function resetSignatures() {
    seenSignatures.clear();
    applySlotWidth();
  }

  /**
   * 从存储的状态重新计算并应用槽位宽度。
   * 调用 applySlotWidth 以反映当前存储的配置。
   */
  function recalculateFromStored() {
    applySlotWidth();
  }

  return {
    registerRowSignature,
    recalculateFromStored,
    resetSignatures,
    setSlotScenarios,
  };
}
