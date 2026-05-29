---
name: 更新-页面接入Transfer
description: 【非默认】仅当人类指定 Transfer v1/customTransfer，或 v2 布局壳不适配时，按 template/before|after 接入 customTransfer；多列设备 Dialog 默认走 Transfer_v2。
---

# 更新-页面接入Transfer（v1）

父级 agent：[`../../SKILL.md`](../../SKILL.md)。**非默认**路径：v1 `customTransfer` + **页内**布局与 gateway 接入。

> **默认**多列设备页请用 [`更新-页面接入Transfer_v2`](../更新-页面接入Transfer_v2/SKILL.md)（`DeviceTransfer` + `columns`）。仅当人类明确「用 Transfer / customTransfer / 不用 DeviceTransfer」，或布局与 v2 壳差异过大时使用本 skill。

## 何时使用

- **人类明确要求** Transfer v1 / `customTransfer`，或声明 v2 布局壳不适用
- 目标页布局强定制，无法收敛到 `DeviceTransfer` 多列 grid
- 已存在 v1 `transfer.vue`，且任务为 `el-transfer` / `el-table` 迁移到 **页内 slot** 写法（非 v2）
- gateway `pageSize: 999999` 等（可与 v2 页并行，gateway 样本仍在本目录 after）

## 何时不要使用

- 未获人类 v1 指令，且 `transfer_v2/DeviceTransfer.vue` 已存在、页面为标准多列设备穿梭 → [`../更新-页面接入Transfer_v2/SKILL.md`](../更新-页面接入Transfer_v2/SKILL.md)
- 组件不存在 → [`../新增-Transfer穿梭框套件/SKILL.md`](../新增-Transfer穿梭框套件/SKILL.md)

## UI 接入四必选（改页必过）

详表见 [`../../references/transfer-page-ui.md`](../../references/transfer-page-ui.md)。摘要：

| # | 要求 | 验收 |
|---|------|------|
| 1 | **不显示设备数量** | `titles` 无 `(count)`；`format` 为 `{ noChecked: " ", hasChecked: " " }`（空串无效） |
| 2 | **CSS / 纵向滚动** | 外层高度上限 + `min-height:0` 链 + 列表 `overflow-y: auto`（或 virtual-scroll 正确） |
| 3 | **截断 tooltip** | 每列 `transfer-item__desc` 含 `:title` + ellipsis + `min-width:0` |
| 4 | **CSS 优化** | `:deep` 限定页面容器；Dialog/Tab 面板类名分场景 |
| 5 | **间距 / order / 验收** | filter `order:2`；行间距在 `.transfer-container`；DevTools 验收（§⑤） |

§⑤ 详表：[`../../references/transfer-page-ui.md`](../../references/transfer-page-ui.md)

## 规范样本

| 样本 | Before | After | virtual-scroll | 布局 |
|------|--------|-------|----------------|------|
| **租户绑定** | [`before/.../BindDeviceDialog.vue`](../../template/before/src/views/tenant/components/BindDeviceDialog.vue) + [`device.gateway.ts`](../../template/before/src/gateway/device/device.gateway.ts) | [`after/.../BindDeviceDialog.vue`](../../template/after/src/views/tenant/components/BindDeviceDialog.vue)（**HEAD**）+ [`after gateway`](../../template/after/src/gateway/device/device.gateway.ts)（**cdb58504**） | **true** | el-dialog 65% |
| **角色设备 Tab** | [`before/.../DeviceTab.vue`](../../template/before/src/views/system/role/components/DeviceTab.vue)（`e0a93b0`） | [`after/.../DeviceTab.vue`](../../template/after/src/views/system/role/components/DeviceTab.vue)（**HEAD**） | **false** | RoleEditDialog Tab |
| **项目配置设备** | —（props 注入，无 gateway） | [`after/.../ProjectDeviceConfigDialog.vue`](../../template/after/src/views/tenant/components/ProjectDeviceConfigDialog.vue)（**HEAD**，与 apex 同步） | **true** | el-dialog 78% |

Few-shot：[`bind-device-gateway-replace.md`](../../assets/few-shot-example/bind-device-gateway-replace.md)、[`role-device-tab-replace.md`](../../assets/few-shot-example/role-device-tab-replace.md)、[`project-device-config-regression.md`](../../assets/few-shot-example/project-device-config-regression.md)

## RED：迁移前核对

1. 是否仍用 `el-table` + 外部搜索框 + `selection-change`
2. gateway 是否 `pageSize: 999999`
3. 标题是否硬编码 `(total)`；**面板头是否仍显示 `x/y`**（未设 `format`）
4. Dialog 大数据是否未开 `virtual-scroll`
5. Tab 内是否误用 dialog 全屏样式（见 [`tab-embedded-layout.md`](../../references/tab-embedded-layout.md)）
6. 列表区是否无纵向滚动（外层无高度 / 列表仅 `overflow:hidden`）
7. `#default` 单元格是否缺 `:title`
8. 是否误用 `defineComponent` 字符串 `template` 或 `overflow-x` 横滚（见 [project-device-config-regression.md](../../assets/few-shot-example/project-device-config-regression.md)）
9. 面板深度样式是否命中 `.el-panel`（见 [dom-class-map.md](../../references/dom-class-map.md)）
10. `.el-panel__filter` 是否 `order: 2`（见 transfer-page-ui §⑤）
11. 列表行间距是否写在 `.transfer-container`（非仅 `.full-height-transfer`）
12. 间距改动是否已在 DevTools 验证 Computed 命中

## GREEN：公共步骤

1. import：

```ts
import customTransfer from "@/components/transfer/src/transfer.vue";
import type { TransferDataItem } from "@/components/transfer/src/transfer";
```

2. 数据：`buildTransferData()` → `{ key, label, device }`；`v-model="selectedDeviceKeys"`
3. 模板：`#left-footer` / `#right-footer` 表头 + `#default` 行 grid
4. 搜索：优先用组件 `filterable` + `filter-method`，删除外部 `el-input` 搜索
5. **UI 四必选 + §⑤**：按 [`transfer-page-ui.md`](../../references/transfer-page-ui.md) 自检（含 flex order 与 DevTools）

## 样本 A：租户绑定 Dialog + gateway

**真相源**：before=`cdb58504^`；BindDeviceDialog after=**HEAD**；gateway after=**cdb58504**

### 页面

- `:virtual-scroll="true"`
- `transferTitles` 纯文案，不含 `(count)`
- `:format="transferFormat"`，`transferFormat = { noChecked: " ", hasChecked: " " }`
- 关闭 Dialog：`transferRef.clearQuery('left'|'right')`
- **HEAD 增量**：`handleSubmit` 仅当 `devicesToBind.length || devicesToUnbind.length` 时调 `deviceActivate`

### UI 对照（样本 A）

- 外层 [`.transfer-container`](../../template/after/src/views/tenant/components/BindDeviceDialog.vue) `height: 500px`
- 列表区配合 panel body `calc` 高度；`#default` 各列 `:title`
- 深度样式：面板根 **`.el-panel`** + 列表 **`.el-transfer-panel__list`**（见 [dom-class-map.md](../../references/dom-class-map.md)）

### gateway（见 [`gateway-full-fetch.md`](../../references/gateway-full-fetch.md)）

- 删除 `pageSize: 999999`
- 使用 `fetchAllDevicePages` + `PAGE_SIZE_MAX=50`
- 并行页失败用 `newConcurLock` + `concurApiErr`，避免重复 toast
- 配套：[`pagination.ts`](../../template/after/src/constants/pagination.ts)、[`notification.ts`](../../template/after/src/utils/notification.ts) 并发段

## 样本 B：角色 DeviceTab（el-table → Transfer）

**真相源**：before=`e0a93b0`；after=**HEAD**

### 删除（before）

- 外部 `device-search` + `el-input`
- `el-table` + `tableRef` + `handleSelectionChange` + `syncingTableSelection`
- `filteredDevices` computed

### 新增（after）

- `customTransfer` + `filter-method="filterDevice"`
- `:virtual-scroll="false"`
- `:format="transferFormat"`（`{ noChecked: " ", hasChecked: " " }`）隐藏头部计数
- `:validate-event="false"`（嵌入表单 Tab）
- `DeviceGateway.getBind(undefined, 1)` + `mapBindDevicesToTabItems`
- 保留 `resolveSelectedKeys` / `syncFromProps` / `defineExpose`

### UI 对照（样本 B）

- [`.device-transfer-container`](../../template/after/src/views/system/role/components/DeviceTab.vue) 固定高度
- [`.el-transfer-panel__list`](../../template/after/src/views/system/role/components/DeviceTab.vue) `overflow-y: auto !important`
- grid 行 + 每列 `:title`；表头 `.header-item` ellipsis

### 布局

- 固定高度：`height: min(400px, calc(480px - 48px))`
- 面板类名 **`.el-panel`** — 见 [`tab-embedded-layout.md`](../../references/tab-embedded-layout.md)

## 样本 C：项目配置设备 Dialog（仅 UI，无 gateway）

**真相源**：[`project-device-config-regression.md`](../../assets/few-shot-example/project-device-config-regression.md)；成品 apex `ProjectDeviceConfigDialog.vue`

### 页面

- 设备由父组件 `devices` prop 注入，**不改** gateway
- UI 四必选 + fork BindDevice `.transfer-container` / `.el-panel` 宽度
- tooltip：`:title` MVP 或 `TransferOverflowText.vue` SFC；**禁止**字符串 template

## 验收清单

1. 场景正确的 `virtual-scroll`（Dialog true / Tab 常 false）
2. gateway 全量 `{ list, total }`，无 999999
3. 选型回显：编辑 `initialDeviceIds`、新建 `defaultSelectAll` 行为不变（DeviceTab）
4. BindDeviceDialog 无变更不调 `deviceActivate`（HEAD）
5. **UI 四必选**：无数量、纵向滚动、`:title`、CSS 容器链（见 transfer-page-ui 自检表）
6. linter 无新增错误

## 使用示例

```text
租户绑定设备请对照 after/BindDeviceDialog + after/device.gateway，大数据开 virtual-scroll，面板不要显示 0/N。
```

```text
角色 DeviceTab 从 el-table 多选改 Transfer，对照 after/role/DeviceTab，Tab 内要有纵向滚动和 :title。
```

## 延伸阅读

- [`../../references/transfer-page-ui.md`](../../references/transfer-page-ui.md)
- [`../../references/gateway-full-fetch.md`](../../references/gateway-full-fetch.md)
- [`../../references/tab-embedded-layout.md`](../../references/tab-embedded-layout.md)
- [`../../references/anti-patterns.md`](../../references/anti-patterns.md)
- [`../../references/dom-class-map.md`](../../references/dom-class-map.md)
