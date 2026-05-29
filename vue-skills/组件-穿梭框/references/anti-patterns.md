# 反模式

## 勿恢复

| 反模式 | 原因 | 正确做法 |
|--------|------|----------|
| `pageSize: 999999` | 接口/内存风险 | `fetchAllDevicePages` + `PAGE_SIZE_MAX` |
| 大数据不开 virtual-scroll | 渲染卡顿 | BindDeviceDialog `:virtual-scroll="true"` |
| Tab 强行开 virtual-scroll | 复杂度 unnecessary | DeviceTab `:virtual-scroll="false"` |
| DOM 清搜索框 | 易失效 | `transferRef.clearQuery('left'|'right')` |
| 重复 key | 移动/勾选异常 | `buildTransferData` 保证 key 唯一 |
| 无变更仍调 `deviceActivate` | 多余请求 | HEAD BindDeviceDialog：bind/unbind 非空才调 |
| 仅用 `:deep(.el-transfer-panel)` 写面板 flex/宽度 | DOM 根为 `.el-panel`，规则不生效 | [dom-class-map.md](dom-class-map.md) |
| 外部 el-input + el-table 多选 | 与 Transfer 重复 | 内置 filterable + v-model keys |
| 并行分页失败多次 toast | 体验差 | `newConcurLock` + `concurApiErr` |

## UI 湿跑回归（ProjectDeviceConfig 等）

| 反模式 | 原因 | 正确做法 |
|--------|------|----------|
| `#default` 内 `defineComponent` + 字符串 `template` | Vite 无运行时编译，插槽空 | 独立 `.vue` SFC 或先用 `:title` |
| 为「看不全」加 `overflow-x: auto` / 固定列 min-width 撑宽 | 产品要省略号非横滚 | 横向 100% + ellipsis；纵滚用高度链 |
| `el-dialog__body` 大 `min-height` + `transfer-container` 再高 | 高度链断裂 | body `min-height:0`；容器 `height:500px` |
| `.el-panel__filter` 无 `order`（仅设 header/footer/body） | filter 默认 0，搜索框在标题上 | header `1` / filter `2` / footer `3` / body `4` |
| 行间距未写在 `.transfer-container` | append-to-body 下规则不命中 | `.transfer-container :deep(.el-transfer-panel__item)` 复刻 EP 行布局 |
| `filter { padding: 15px }` 照抄 EP | Dialog 内搜索区四周被撑开 | 优先 `padding-bottom: 15px`；对齐 BindDevice 视觉 |
| 改 scoped CSS 未开 DevTools | agent 宣称完成但用户无变化 | Computed 须命中本页 `.transfer-container` 规则 |

案例叙事：[project-device-config-regression.md](../assets/few-shot-example/project-device-config-regression.md)（含第二波间距/order）

## 标题计数

产品若要求纯文案标题，勿在 `titles` 拼接 `(total)`。面板头用 `format: { noChecked: " ", hasChecked: " " }` 隐藏 `0/N`（**勿**用 `''`，空串会回退默认计数）。

## v2 布局壳（DeviceTransfer）

| 反模式 | 原因 | 正确做法 |
|--------|------|----------|
| `width: max-content` + 列 `minmax(80px,1fr)` | 宽屏横滚、列被撑宽 | `width:100%` + `minmax(0,1fr)` |
| 每行 `label { overflow-x:auto }` | N 条横滚条 | 无横滚；`SpanByTipsFill` + ellipsis |
| `table-viewport` + JS scroll 同步 | dialog min-width 下无收益 | footer/body 为 `.el-panel` 直接子节点 |
| `--device-transfer-col-count` + min-width calc | 同上 | 删除；靠 dialog 下限 |
| 有 v2 壳仍在业务页抄 `:deep(.el-panel)` 布局 | 三页漂移 | 样式只在 `DeviceTransfer.vue`；走 **Transfer_v2** 更新 skill |
| 人类指定 v1 仍改 `DeviceTransfer` | 违背路由 | [`更新-页面接入Transfer`](../feature-skills/更新-页面接入Transfer/SKILL.md) |

详见 [`transfer-v2-layout.md`](transfer-v2-layout.md)。

## 历史扩展（非主 before）

`456e761^` 的 `el-transfer` → 见 [`el-transfer-migration.md`](../assets/few-shot-example/el-transfer-migration.md)，不作为 template/before 主样本。
