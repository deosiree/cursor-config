# 角色 DeviceTab：el-table 多选 → Transfer

## 场景

角色编辑弹窗「关联设备」Tab，原 `el-table` 勾选，改为 `customTransfer`。

## 真相源

| 侧 | commit | 文件 |
|----|--------|------|
| before | `e0a93b0` | `template/before/.../DeviceTab.vue` |
| after | **HEAD** | `template/after/.../DeviceTab.vue` |

## 关键 diff

### 删除

- 外部 `el-input` + `deviceFilterKeyword`
- `el-table` + `@selection-change` + `tableRef`
- `filteredDevices` computed、`syncingTableSelection`

### 新增

- `customTransfer` + `filter-method="filterDevice"`
- `buildTransferData` + `selectedDeviceKeys` v-model
- `:virtual-scroll="false"`
- `transferFormat = { noChecked: " ", hasChecked: " " }`
- `:validate-event="false"`
- Tab 固定高度 + `.el-panel` 深度样式

### 保留

- `initialDeviceIds` / `defaultSelectAll` 回显逻辑
- `defineExpose({ getDeviceIds, hasLoadError, reapplySelection })`
- `DeviceGateway.getBind(undefined, 1)` + `mapBindDevicesToTabItems`

### UI 四必选

- **纵向滚动**：`.device-transfer-container` 固定高度 + `.el-transfer-panel__list { overflow-y: auto }`
- **数量**：`transferFormat` 空格隐藏面板头计数
- **tooltip**：grid 列 `:title` + `min-width: 0`
- 见 [`references/transfer-page-ui.md`](../../references/transfer-page-ui.md)

## agent 动作

1. 对照 before/after DeviceTab 整文件 diff
2. 勿引入 Dialog 样本的 `virtual-scroll=true`
3. 样式读 [`references/tab-embedded-layout.md`](../../references/tab-embedded-layout.md) + `transfer-page-ui.md`

## 验收

- 搜索在面板内可用
- 新建全选 / 编辑回显正确
- Tab 高度内**纵向滚动**可用、按钮不溢出
- 面板头无 `0/N`；长文本有 `:title`
