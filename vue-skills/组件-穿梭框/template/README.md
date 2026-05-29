# template 说明

按**功能**组织的可复制样本，agent 执行时只读本目录。

## 真相源 commit

| 模板 | 真相源 | 说明 |
|------|--------|------|
| `mvp/` | `cdb58504` / HEAD | Transfer v1 组件全量 |
| `v2-mvp/` | `a609804` | DeviceTransfer 三文件（GREEN-2） |
| `v2-before/` 三设备页 | `a609804^`（`8a5daa3`） | v1 页内布局 + `customTransfer` |
| `v2-after/` 三设备页 | `a609804` | `DeviceTransfer` + `deviceColumns` |
| `before/.../BindDeviceDialog.vue` | `cdb58504^` | v1 更新 skill：标题含 count；gateway 999999 |
| `after/.../BindDeviceDialog.vue` | `cdb58504` 等 | v1 更新 skill：页内 `.transfer-container` + customTransfer |
| `after/.../ProjectDeviceConfigDialog.vue` | v1 样本 C | v1 页内 §⑤ 间距（非 apex HEAD v2） |
| `before|after/.../device.gateway.ts` | `cdb58504^` / `cdb58504` | fetchAllDevicePages（v1/v2 页均可引用） |
| `before/.../DeviceTab.vue` | `e0a93b0` | el-table 多选 |
| `after/.../DeviceTab.vue` | v1 after 真相源 | customTransfer Tab（与 v2-after 分叉） |

维护：**先改 apex_dev → 再覆盖本目录**。apex HEAD 设备页为 v2 时，同步 **`v2-after/`**，勿强行覆盖 v1 `after/` 设备页以免 v1 更新 skill 失真。

## mvp/（新增 GREEN-1）

从 [`mvp/src/components/transfer/`](mvp/src/components/transfer/) 拷贝到目标仓库 `@/components/transfer`。

| 路径 | 说明 |
|------|------|
| `mvp/src/components/transfer/` | 主组件 + composables + style |
| `mvp/src/types/vue3-virtual-scroll-list.d.ts` | 类型声明 |
| `mvp/package.json.fragment` | `vue3-virtual-scroll-list` 依赖 |

## v2-mvp/（新增 GREEN-2）

从 [`v2-mvp/src/components/transfer/src/transfer_v2/`](v2-mvp/src/components/transfer/src/transfer_v2/) 拷贝 `DeviceTransfer.vue`、`device-transfer.ts`、`README.md`。

## v2-before/ 与 v2-after/（默认页面接入）

| 样本 | 场景 | before | after |
|------|------|--------|-------|
| **租户绑定** | Dialog + 大数据 | `v2-before/.../BindDeviceDialog.vue` | `v2-after/.../BindDeviceDialog.vue` |
| **项目配置设备** | Dialog + props | `v2-before/.../ProjectDeviceConfigDialog.vue` | `v2-after/.../ProjectDeviceConfigDialog.vue` |
| **角色设备 Tab** | Tab | `v2-before/.../DeviceTab.vue` | `v2-after/.../DeviceTab.vue` |

## before/ 与 after/（v1 页面接入，非默认）

| 样本 | 场景 | before | after |
|------|------|--------|-------|
| **租户绑定** | Dialog + gateway | `before/.../BindDeviceDialog.vue` + gateway | `after/...`（v1 customTransfer） |
| **项目配置设备** | props 注入 | — | `after/.../ProjectDeviceConfigDialog.vue` |
| **角色设备 Tab** | el-table → Transfer | `before/.../DeviceTab.vue` | `after/.../DeviceTab.vue` |

gateway 配套 after 片段：

- [`after/src/constants/pagination.ts`](after/src/constants/pagination.ts)
- [`after/src/utils/notification.ts`](after/src/utils/notification.ts)
- [`after/src/api/device/device.api.ts`](after/src/api/device/device.api.ts)
- [`after/src/types/device.ts`](after/src/types/device.ts)

## 阅读顺序

1. `mvp/` — v1 组件 API
2. `v2-mvp/` — DeviceTransfer 壳
3. [`references/transfer-v2-layout.md`](../references/transfer-v2-layout.md)
4. `v2-before|v2-after` — 默认三页迁移
5. `before|after` — 仅人类指定 v1 时
6. [`references/transfer-page-ui.md`](../references/transfer-page-ui.md) — v1 页内 UI §①–⑤

## 与 feature-skills 对应

| 模板 | 子 skill |
|------|----------|
| `mvp/` | `feature-skills/新增-Transfer穿梭框套件/` §GREEN-1 |
| `v2-mvp/` | `feature-skills/新增-Transfer穿梭框套件/` §GREEN-2 |
| `v2-before/`、`v2-after/` | `feature-skills/更新-页面接入Transfer_v2/` |
| `before/`、`after/`（设备页 v1） | `feature-skills/更新-页面接入Transfer/` |
