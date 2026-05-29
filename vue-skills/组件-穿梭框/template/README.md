# template 说明

按**功能**组织的可复制样本，agent 执行时只读本目录。

## 真相源 commit

| 模板 | 真相源 | 说明 |
|------|--------|------|
| `mvp/` | `cdb58504` / HEAD | Transfer 组件全量 |
| `before/.../BindDeviceDialog.vue` | `cdb58504^` | 标题含 count；gateway 999999 |
| `after/.../BindDeviceDialog.vue` | **HEAD** | 含空变更跳过 deviceActivate；`.el-panel` + flex order；`#bindDevice` |
| `after/.../ProjectDeviceConfigDialog.vue` | **HEAD** | 样本 C：props 注入无 gateway；§⑤ 间距/order；`#projectDeviceConfig` |
| `after/.../TransferOverflowText.vue` | skill 参考 | 可选 tooltip SFC（成品页多用 `SpanByTipsFill` 或 `:title`） |
| `before|after/.../device.gateway.ts` | `cdb58504^` / `cdb58504` | fetchAllDevicePages |
| `before/.../DeviceTab.vue` | `e0a93b0` | el-table 多选 |
| `after/.../DeviceTab.vue` | **HEAD** | customTransfer Tab 嵌入 |

维护：**先改 apex_dev → 再覆盖本目录**。

## mvp/（新增套件）

从 [`mvp/src/components/transfer/`](mvp/src/components/transfer/) 拷贝到目标仓库 `@/components/transfer`。

| 路径 | 说明 |
|------|------|
| `mvp/src/components/transfer/` | 主组件 + composables + style |
| `mvp/src/types/vue3-virtual-scroll-list.d.ts` | 类型声明 |
| `mvp/package.json.fragment` | `vue3-virtual-scroll-list` 依赖 |

## before/ 与 after/（页面接入）

| 样本 | 场景 | before | after |
|------|------|--------|-------|
| **租户绑定** | Dialog + 大数据 + gateway | `before/.../BindDeviceDialog.vue` + `device.gateway.ts` | `after/.../BindDeviceDialog.vue`（HEAD）+ gateway 配套 |
| **项目配置设备** | Dialog + props 注入、无 gateway | — | `after/.../ProjectDeviceConfigDialog.vue`（HEAD） |
| **角色设备 Tab** | Tab + el-table 多选 | `before/.../DeviceTab.vue` | `after/.../DeviceTab.vue` |

gateway 配套 after 片段：

- [`after/src/constants/pagination.ts`](after/src/constants/pagination.ts)
- [`after/src/utils/notification.ts`](after/src/utils/notification.ts)（`newConcurLock` / `concurApiErr`）
- [`after/src/api/device/device.api.ts`](after/src/api/device/device.api.ts)
- [`after/src/types/device.ts`](after/src/types/device.ts)

## 阅读顺序

1. `mvp/` — 组件 API、virtual-scroll
2. [`references/transfer-page-ui.md`](../references/transfer-page-ui.md) — UI §①–⑤（含 flex order、DevTools）
3. `before|after` BindDeviceDialog — Dialog + gateway 全量拉取
4. `after` ProjectDeviceConfigDialog — 样本 C（间距 human-verified、grid 三列）
5. `before|after` DeviceTab — el-table → Transfer、Tab 布局

## 与 feature-skills 对应

| 模板 | 子 skill |
|------|----------|
| `mvp/` | `feature-skills/新增-Transfer穿梭框套件/` |
| `before/`、`after/` | `feature-skills/更新-页面接入Transfer/` |
