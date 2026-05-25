# OperationColumn

表格操作列：**行内固定槽位 +「更多」溢出**；列宽由离屏探针与逐字估宽自动计算。

## 目录结构

| 文件 | 职责 |
|------|------|
| `index.vue` | `el-table-column` 壳、离屏探针、列宽协调 |
| `OpItem.vue` | 声明式操作槽 |
| `OpItemContent.vue` | 行内 /「更多」菜单视觉 |
| `OperationCellOverflow.vue` | 行内/「更多」切分（`calcOpStrip`） |
| `operationWidth.ts` | 代表行、指纹、`calcOpStrip`、估宽 |

## 推荐用法

```ts
import OperationColumn from "@/components/OperationColumn/index.vue";
import OpItem from "@/components/OperationColumn/OpItem.vue";
```

```vue
<OperationColumn
  label="操作"
  fixed="right"
  :list-data-length="data.length"
  :inline-visible-count="2"
>
  <template #default="{ row }">
    <OpItem label="编辑" icon="edit" @click="onEdit(row)" />
    <!-- 其余 OpItem -->
  </template>
</OperationColumn>
```

## `inline-visible-count`（槽位语义）

表示行内条上占用的**槽位总数**，其中 **「更多」按钮占 1 个槽**（需要溢出菜单时）。

| 值 | 含义示例 |
|----|----------|
| `1` | 仅显示「更多」，全部操作在下拉（0 个行内 OpItem + 更多） |
| `2` | 最多 **1 个行内** OpItem + **更多** |
| `5` | 最多 **4 个行内** + **更多**（总槽位 5） |
| `6` | 最多 **5 个行内** + **更多**；若溢出仅 1 个则**不显示更多**，6 个全行内 |

归一化：`Math.max(inline-visible-count, 1)`。

### 折叠规则

当 `N` 个 OpItem、`slots` 为传入值（≥1）：

1. `N ≤ slots` → 全部行内，无「更多」
2. `N > slots` → 预留 1 槽给「更多」，行内 `slots - 1` 个
3. 若下拉里只剩 **1** 个 → 不显示「更多」，**N 个全行内**

示例：`slots=5`，`N=7` → 4 行内 + 更多（下拉 3 个）。

实现统一由 [`calcOpStrip`](operationWidth.ts) 计算，行内切分与列宽估宽共用，避免漂移。

## 其它 Props

| Prop | 默认 | 作用 |
|------|------|------|
| `list-data-length` | — | **必填**；与 `:data` 行数同步，参与重探针 |
| `action-gap` | `8` | 槽间距（px） |
| `cell-padding` | `16` | 列宽补偿左右 padding |
| `cell-max-height` | `32` | 操作区最大高度 |
| `min-width` | `80` | 探针完成前列宽 |

## 列宽与重探针

1. 离屏探针代表行 → `scanOpButtons` → `maxFromSlots`（内部 `calcOpStrip`）
2. 触发：`reprobeTrig`（行数 + `tblProbeFp` 表指纹）、`perms` 变化；32ms 合并（`schedReprobe`）
3. 仅改 `inline-visible-count` / 更多文案：`bumpStored` 公式重算 + `rowWidthEpoch`，不跑离屏 DOM

表指纹字段：`status`、`type`、`showResendActivation`（`tblProbeFp` / `pickProbeRows`）。

### `operationWidth.ts` 主要符号（≤12 字符）

| 短名 | 职责 |
|------|------|
| `calcOpStrip` | 槽位切分（行内个数 + 是否「更多」） |
| `pickProbeRows` | 从表数据选代表行 |
| `tblProbeFp` | 表数据轻量指纹 |
| `maxFromSlots` | 多场景列宽上限 |
| `mkWidthCoord` | 列宽协调器 |
| `normProbeVn` | 规范化 slot VNode |
| `probeDomSlots` | index 内离屏 DOM 探针（非导出） |

## 排障

| 现象 | 处理 |
|------|------|
| 6 操作仍出现「更多」且仅 1 项 | 提高 `inline-visible-count`（如 6）以触发折叠 |
| 只想「编辑 + 更多」 | 使用 `inline-visible-count="2"` |
| 列宽偏窄 | 确认探针代表行覆盖各 `status` 分支 |
