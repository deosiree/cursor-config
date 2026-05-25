# 列宽协调与离屏探针

实现源码：[`template/mvp/src/components/OperationColumn/`](../template/mvp/src/components/OperationColumn/)（`index.vue`、`operationWidth.ts`）。

## 核心 Props（OperationColumn）

| Prop | 默认 | 作用 |
|------|------|------|
| `listDataLength` | — | **必填**；与 `el-table :data` 行数同步；变化时重跑离屏探针 |
| `inlineVisibleCount` | `1` | **行内条总槽位数**（含「更多」占 1 槽）；归一化 `Math.max(n,1)`。语义见 [`slot-semantics.md`](slot-semantics.md) |
| `actionGap` | `8` | 槽间距（px） |
| `cellPadding` | `16` | 列宽补偿的 cell 左右 padding 总和 |
| `fixed` | `right` | `fixed="right"` 时加 `RIGHT_GUT` |

业务页**只**绑 `:list-data-length`。**禁止**传 `probe-data-rows`、手写 `MenuType` 探针表、或在组件内恢复 `PROBE_ROWS` 假行。

## 探针流程

1. `inject(TABLE_INJECTION_KEY)` 读取父级 `el-table`。
2. `rawTblRows`：`store.states.data` 有行则用；否则回退 `elTable.props.data`。
3. `pickProbeRows`（`operationWidth.ts`）：树表 DFS → 按 `row.type` / `status` 去重；覆盖 `showResendActivation` 等 `v-if` 分支；上限 `MAX_PROBE_N`（24）。
4. `probeDomSlots`：对每个代表行离屏 render default slot → `dedupeByLbl(scanOpButtons(container))`。
5. `mkWidthCoord.setSlotScn`：多场景 `maxFromSlots`（内部 `calcOpStrip`）写列宽。
6. 表数据为空：不弹「未扫描到 OpItem」；待 `list-data-length` 或表数据 0→N 后 `schedReprobe`。

## 列宽公式（`operationWidth.ts`）

- 行内切分与单场景条宽均由 **`calcOpStrip(N, slots)`** 决定，无全局 `reserveMoreSlot` 推断。
- 多场景取 `maxFromSlots` 上限；行 mount **不**用行 DOM 抬列宽（防闪烁）。

## 触发重探针

| 触发 | 行为 |
|------|------|
| `reprobeTrig`（`listDataLength` + `tblProbeFp`） | 离屏 DOM 重探针，`schedReprobe` 32ms 合并 |
| `userInfo.perms` 变化 | 同上 |
| 仅 `inlineVisibleCount` / 更多文案 | `bumpStored` + `rowWidthEpoch`，不跑离屏 DOM |

`tblProbeFp` 字段：`status`、`type`、`showResendActivation`（行内 `status` 原地变更会触发重探针与行切分）。

## 行内切分（`OperationCellOverflow`）

- `refreshSplit` 使用同一 `calcOpStrip`。
- `onUpdated` 比较行内 OpItem 签名（label + hidden），`v-if` 同位数替换（如启用↔停用）仍会重切分。

## 排障

| 现象 | 处理 |
|------|------|
| `probeRowCount: 0` | 异步 `:data` 未就绪；勿在业务页加假探针行 |
| `probeRowCount > 0` 仍无 OpItem | slot 须为 `OpItem`；`perm` 是否全隐藏 |
| 未注入 ElTable | `OperationColumn` 须在 `el-table` 子树内 |
| 启用用户后仍显示「停用」 | 确认表指纹含 `status`；勿只改 `list-data-length` |

## 相关文件

| 文件 | 职责 |
|------|------|
| `operationWidth.ts` | `pickProbeRows`、`tblProbeFp`、`calcOpStrip`、`maxFromSlots`、`mkWidthCoord` |
| `index.vue` | inject、离屏探针、`schedReprobe` |
| `OperationCellOverflow.vue` | `refreshSplit`、下拉「更多」 |

组件内说明：[`template/mvp/.../README.md`](../template/mvp/src/components/OperationColumn/README.md)。
