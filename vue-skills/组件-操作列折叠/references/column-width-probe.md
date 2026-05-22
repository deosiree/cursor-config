# 列宽协调与离屏探针

实现源码：[`template/mvp/src/components/OperationColumn/`](../template/mvp/src/components/OperationColumn/)（`index.vue`、`operationWidth.ts`）。

## 核心 Props（OperationColumn）

| Prop | 默认 | 作用 |
|------|------|------|
| `listDataLength` | — | **必填**；与 `el-table :data` 行数同步；变化时重跑离屏探针 |
| `inlineVisibleCount` | `1` | 行内外露 `OpItem` 数，其余进「更多」；**负数按 0**（`-1` 等价仅「更多」） |
| `actionGap` | `8` | 槽间距（px） |
| `cellPadding` | `16` | 列宽补偿的 cell 左右 padding 总和 |
| `fixed` | `right` | `fixed="right"` 时加 `FIXED_RIGHT_GUTTER` |

业务页**只**绑 `:list-data-length`（平表常用 `data.length`；菜单 Tab 子集可用 `getMenuChildren(tab.key).length`，与 `:data` 行数一致即可）。**禁止**传 `probe-data-rows`、手写 `MenuType` 探针表、或在组件内恢复 `PROBE_ROWS` 假行。

## 探针流程

1. `inject(TABLE_INJECTION_KEY)` 读取父级 `el-table`。
2. `resolveRawTableRows`：`store.states.data` 有行则用；否则回退 `elTable.props.data`（与 `:data` 同源）。
3. `collectProbeRowsFromTableData`（`operationWidth.ts`）：树表 DFS → 按 `row.type` 去重；平表覆盖 `showResendActivation` 等 `v-if` 分支；上限 `MAX_PROBE_REPRESENTATIVE_ROWS`（24）。
4. 对每个代表行离屏 render default slot → `scanOpButtons` 反读 DOM（`perm` / `v-if` 与线上一致）。
5. 表数据为空：不弹「未扫描到 OpItem」；待 `list-data-length` 或表数据长度 0→N 后 `scheduleWidthReprobe`。

## 列宽公式（`operationWidth.ts`）

- `globalMaxBtn = max(各探针场景可见 OpItem 数)`
- `globalMaxBtn > inlineVisibleCount` 时，各场景公式均预留「更多」槽
- `inlineVisibleCount ≥ 2`：逐按钮 `measureSingleOpItemContentWidth`，对齐 `OP_ITEM_MIN_WIDTH=32`
- 多场景取 max；行 mount **不**用行 DOM 抬列宽（防闪烁）

## 触发重探针

- `inlineVisibleCount` / `moreLabel`（i18n）变化
- `userInfo.perms` 变化
- `list-data-length` 变化
- inject 表数据长度变化（`probeSourceLength`）

## 排障

| 现象 | 处理 |
|------|------|
| `probeRowCount: 0` | 异步 `:data` 未就绪；勿在业务页加假探针行 |
| `probeRowCount > 0` 仍无 OpItem | 检查 slot 是否用 `OpItem`、`perm` 是否全隐藏 |
| 未注入 ElTable | `OperationColumn` 须放在 `el-table` 子树内 |

## 相关文件

| 文件 | 职责 |
|------|------|
| `operationWidth.ts` | 代表行选取、估宽公式、协调器 |
| `index.vue` | inject、离屏探针、`scheduleWidthReprobe` |
| `OperationCellOverflow.vue` | 行内 / 「更多」切分 |

组件内说明：[`template/mvp/.../README.md`](../template/mvp/src/components/OperationColumn/README.md)。
