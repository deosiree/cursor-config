# inline-visible-count 槽位语义

`inline-visible-count` = 行内条上占用的**槽位总数**，其中 **「更多」按钮占 1 个槽**（需要溢出菜单时）。

归一化：`Math.max(inline-visible-count, 1)`。

## 含义对照

| 槽位数 | 典型 UI |
|--------|---------|
| `1` | 仅「更多」，全部 OpItem 在下拉 |
| `2` | 最多 **1** 个行内 OpItem + **更多** |
| `3` | 最多 **2** 个行内 + **更多** |
| `6` | 最多 **5** 个行内 + **更多**；若下拉里只剩 1 个则**不显示更多**，全部行内 |

## 折叠规则（`calcOpStrip`）

设当前行可见 OpItem 数为 `N`，传入槽位数为 `slots`（≥1）：

1. `N ≤ slots` → 全部行内，无「更多」
2. `N > slots` → 行内 `slots - 1` 个，其余进「更多」
3. 若下拉里只剩 **1** 个 → 不显示「更多」，**N** 个全行内

示例：`slots=5`，`N=7` → 4 行内 + 更多（下拉 3 个）。

`slots=1` 时固定为 0 行内 + 更多（全部进下拉）。

## apex_dev 样本默认传参

与 [`template/after/`](../template/after/) 及业务页一致（commit `5cc2e143` 后）：

| 页面 / 片段 | `inline-visible-count` | 预期 |
|-------------|------------------------|------|
| UserTable | **2** | 「编辑」+ 更多 |
| TenantTable | **6** | 6 个操作全行内，无更多 |
| 菜单主表 | **3** | 树表多 `v-if`，2 行内 + 更多（视可见数） |
| PermissionConfigDialog | **3** | 3 个 OpItem 时 2 行内 + 更多 |
| ApiConfigDialog | **4** | 2 个 OpItem 时常全行内 |
| RoleListTable | **3** | 2 个 OpItem 时常全行内 |

选型：先数「希望行内露几个 + 是否保留 1 槽给更多」，再设槽位总数；勿把参数当成「仅行内个数、不含更多」。

## 误配

| 误配 | 结果 |
|------|------|
| 想要 1 行内 + 更多，却设 `1` | 仅更多，0 行内 |
| 租户 6 操作却设 `5` | 出现「更多」且下拉仅 1 项（应提高到 `6` 触发折叠） |

实现与估宽共用 [`calcOpStrip`](../template/mvp/src/components/OperationColumn/operationWidth.ts)，见 [`column-width-probe.md`](column-width-probe.md)。
