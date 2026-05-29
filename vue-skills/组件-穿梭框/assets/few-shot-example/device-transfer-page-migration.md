# Few-shot：三页接入 DeviceTransfer（v2 更新）

真相源：**apex_dev** `a609804^` → `a609804`。

## 何时读

- 执行 [`更新-页面接入Transfer_v2`](../../feature-skills/更新-页面接入Transfer_v2/SKILL.md)
- 父级已默认路由 v2；**未**收到人类「用 Transfer v1 / customTransfer」指令

## 模板路径

| 样本 | before | after |
|------|--------|-------|
| 租户绑定 | [`v2-before/.../BindDeviceDialog.vue`](../../template/v2-before/src/views/tenant/components/BindDeviceDialog.vue) | [`v2-after/.../BindDeviceDialog.vue`](../../template/v2-after/src/views/tenant/components/BindDeviceDialog.vue) |
| 项目配置 | [`v2-before/.../ProjectDeviceConfigDialog.vue`](../../template/v2-before/src/views/tenant/components/ProjectDeviceConfigDialog.vue) | [`v2-after/.../ProjectDeviceConfigDialog.vue`](../../template/v2-after/src/views/tenant/components/ProjectDeviceConfigDialog.vue) |
| 角色 Tab | [`v2-before/.../DeviceTab.vue`](../../template/v2-before/src/views/system/role/components/DeviceTab.vue) | [`v2-after/.../DeviceTab.vue`](../../template/v2-after/src/views/system/role/components/DeviceTab.vue) |

## 页面侧删除清单（before 常见）

- `.transfer-container` / `.device-transfer-container` 大段 scoped
- `:deep(.el-panel)` flex、order、行间距、checkbox 覆盖
- `#left-footer` / `#right-footer` 手写三列表头 grid
- `#default` 内三列 `transfer-item__desc` grid
- 本地 `TransferOverflowText.vue`（若存在）

## 页面侧新增（after 常见）

```ts
import DeviceTransfer from "@/components/transfer/src/transfer_v2/DeviceTransfer.vue";
import type { DeviceTransferColumn } from "@/components/transfer/src/transfer_v2/device-transfer";
```

- `deviceColumns: DeviceTransferColumn[]` computed
- `<DeviceTransfer :columns="deviceColumns" :host-height="..." ... />`
- BindDevice：`prevent-label-toggle`、自定义 `filterMethod`
- DeviceTab：`:virtual-scroll="false"`；gateway 规则仍见 v1 gateway 样本（`cdb58504`）

## gateway

BindDevice 全量拉取可继续对照 [`template/after/.../device.gateway.ts`](../../template/after/src/gateway/device/device.gateway.ts)（`cdb58504`），与 v2 页面 commit 分叉无妨。

## 禁止

- 在业务页复制 `DeviceTransfer.vue` 内布局样式
- 恢复 `max-content`、行级横滚、`table-viewport`（见 [transfer-v2-layout.md](../../references/transfer-v2-layout.md)）
