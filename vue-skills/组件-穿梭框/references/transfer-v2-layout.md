# Transfer v2（DeviceTransfer）布局规则

适用 [`template/v2-mvp/`](../template/v2-mvp/) 与 [`DeviceTransfer.vue`](../template/v2-mvp/src/components/transfer/src/transfer_v2/DeviceTransfer.vue)（真相源 commit `a609804`）。

## 保留项（壳内）

| 项 | 做法 |
|----|------|
| Panel 等分 | `.el-panel`：`flex: 1 1 0; min-width: 0` |
| 中间按钮 | `flex: 0 0 auto`，不抢 Panel 宽度 |
| 列 grid | `width: 100%` + `repeat(N, minmax(0, 1fr))`（`buildEqualColumnGrid`） |
| 单元格省略 | `min-width: 0` + `SpanByTipsFill` |
| 勾选与文字 | 覆盖 EP：`checkbox position: static`；label `padding-left: 14px` |
| 表头对齐 | `--device-transfer-checkbox-gutter: 36px`；表头 `padding-left` 同 gutter |
| 宿主高度 | `host-height` prop → `.device-transfer-host` 高度链 |
| 弹窗下限 | 业务 Dialog 使用 `min-width-dialog`（≥700px）时 **无需** Panel 横滚 |

## 已废弃（勿在壳或业务页恢复）

| 废弃 | 原因 |
|------|------|
| `width: max-content` + 列 `minmax(80px, 1fr)` | 宽屏仍横滚、右列被撑宽 |
| 每行 `.el-checkbox__label { overflow-x: auto }` | N 条横滚条 |
| `table-viewport` + JS `setupPanelScrollSync` | dialog 下限下无收益 |
| `--device-transfer-col-count` + `min-width: calc(N×80px)` | 同上 |
| Panel / body `overflow-x: auto` | 产品要求列 ellipsis，非横滚 |
| 业务页复制整段 `.device-transfer-host` / `.el-panel` flex | 三页漂移；样式只在壳内 |

## 与 v1 页内布局的关系

v1 更新 skill 要求在 **业务页** 写 `.transfer-container` + `:deep(.el-panel)` order/间距。v2 将这些收到 **DeviceTransfer.vue**；业务页只传 `columns`、`host-height` 等 props。

布局不适配 v2（强定制 footer、非标准多列）时，回退 v1：[`feature-skills/更新-页面接入Transfer`](../feature-skills/更新-页面接入Transfer/SKILL.md)。
