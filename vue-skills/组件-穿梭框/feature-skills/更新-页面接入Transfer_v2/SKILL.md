---
name: 更新-页面接入Transfer_v2
description: 【默认】当 transfer_v2/DeviceTransfer 已存在，多列设备穿梭页要从 v1 页内布局收成 columns+host-height 时，对照 template/v2-before|v2-after；人类指定 v1 时勿用本 skill。
---

# 更新-页面接入Transfer_v2

父级 agent：[`../../SKILL.md`](../../SKILL.md)。**默认**业务页穿梭框接入路径（`DeviceTransfer` + `columns`）。

## 何时使用（默认）

- `transfer_v2/DeviceTransfer.vue` **已存在**（或刚完成新增套件 GREEN-2）
- 父级路由「更新」且**未**收到人类「用 Transfer v1 / customTransfer / 不用 DeviceTransfer」指令
- 目标页为多列设备穿梭：BindDevice / ProjectDeviceConfig / DeviceTab 类
- 要把 v1 页内 `#left-footer` / `#default` grid + 大段 `:deep(.el-panel)` **收成** `columns` + props

## 何时不要使用 / 回退 v1

- **人类明确**：「用 Transfer」「用 customTransfer」「不用 DeviceTransfer」「布局壳变化大用不了 v2」
- **布局不适配 v2 壳**：列结构/交互与 `DeviceTransfer` 预设差异大（非标准多列、强定制 footer、需完全自绘面板）→ [`../更新-页面接入Transfer/SKILL.md`](../更新-页面接入Transfer/SKILL.md)（v1 几乎不写布局，通用性更强）
- 无 v2 壳 → [`../新增-Transfer穿梭框套件/SKILL.md`](../新增-Transfer穿梭框套件/SKILL.md) GREEN-2
- 无 v1 → 先 GREEN-1

## 规范样本（真相源 `a609804^` / `a609804`）

| 样本 | Before | After | virtual-scroll | 备注 |
|------|--------|-------|----------------|------|
| **租户绑定** | [`v2-before/.../BindDeviceDialog.vue`](../../template/v2-before/src/views/tenant/components/BindDeviceDialog.vue) | [`v2-after/.../BindDeviceDialog.vue`](../../template/v2-after/src/views/tenant/components/BindDeviceDialog.vue) | **true** | `prevent-label-toggle`、自定义 `filterMethod` |
| **项目配置设备** | [`v2-before/.../ProjectDeviceConfigDialog.vue`](../../template/v2-before/src/views/tenant/components/ProjectDeviceConfigDialog.vue) | [`v2-after/.../ProjectDeviceConfigDialog.vue`](../../template/v2-after/src/views/tenant/components/ProjectDeviceConfigDialog.vue) | **true** | props 注入，无 gateway |
| **角色设备 Tab** | [`v2-before/.../DeviceTab.vue`](../../template/v2-before/src/views/system/role/components/DeviceTab.vue) | [`v2-after/.../DeviceTab.vue`](../../template/v2-after/src/views/system/role/components/DeviceTab.vue) | **false** | `host-height`、`defineExpose` 保持 |

Few-shot：[`device-transfer-page-migration.md`](../../assets/few-shot-example/device-transfer-page-migration.md)（nebula 三页）；域外实体见 [`cross-domain-transfer-migration.md`](../../assets/few-shot-example/cross-domain-transfer-migration.md)

## RED：迁移前核对

1. v2 壳是否已存在；若无则先 GREEN-2
2. 人类是否已要求 v1（若是，勿改 `DeviceTransfer`）
3. 页内是否仍维护与壳重复的 `:deep(.el-panel)` flex/grid
4. 是否误用 `max-content`、行级横滚、`table-viewport`（见 [transfer-v2-layout.md](../../references/transfer-v2-layout.md)）
5. gateway：BindDevice 是否仍 `pageSize: 999999`（可对照 v1 [`template/after/.../device.gateway.ts`](../../template/after/src/gateway/device/device.gateway.ts) `cdb58504`）
6. 域外场景：是否误抄 `getBind` / `BindDeviceDialog` 路径（见父级 [`SKILL.md`](../../SKILL.md) §域外对照）

## GREEN：公共步骤

1. import：

```ts
import DeviceTransfer from "@/components/transfer/src/transfer_v2/DeviceTransfer.vue";
import type { DeviceTransferColumn } from "@/components/transfer/src/transfer_v2/device-transfer";
```

2. `deviceColumns` computed（`label` + `getValue`）
3. 模板：`<DeviceTransfer v-model="..." :data="..." :columns="deviceColumns" :host-height="..." ... />`
4. 删除页内 `.transfer-container` 大块 scoped、`#left-footer` / `#default` 三列 grid
5. 单元格省略由壳内 `SpanByTipsFill` 处理；**勿**恢复 `TransferOverflowText`
6. **勿**在业务页复制 `DeviceTransfer.vue` 布局样式

### 样本要点

| 样本 | 额外 props / 行为 |
|------|-------------------|
| BindDevice | `:virtual-scroll="true"`；`prevent-label-toggle`；`filterMethod`；`clearQuery` on close；bind/unbind 非空才 `deviceActivate` |
| ProjectDeviceConfig | props 注入设备；`:virtual-scroll="true"`；`host-height` |
| DeviceTab | `:virtual-scroll="false"`；`validateEvent` 默认 false；保留 `defineExpose` / `initialDeviceIds` |

### gateway（BindDevice）

全量拉取规则见 [`gateway-full-fetch.md`](../../references/gateway-full-fetch.md)。样本 gateway 真相源仍为 v1 after **`cdb58504`**（与页面 commit `a609804` 可分叉）。

## UI 与 v1 四必选的关系

v2 壳已内聚 Panel flex、checkbox 间距、列 grid。业务页仍需：

- `titles` 无 `(count)`；`format: { noChecked: " ", hasChecked: " " }`
- `host-height` / Dialog 高度链（见 v2-after 各页）
- 纵向滚动：Dialog 开 `virtual-scroll`；Tab 常 `false`

细表 v1 页内写法见 [`transfer-page-ui.md`](../../references/transfer-page-ui.md)（v2 场景勿再抄 §⑤ 到业务页）。

## 验收清单

1. 使用 `DeviceTransfer` + `columns`，无页内重复穿梭布局 CSS
2. 场景正确的 `virtual-scroll`
3. BindDevice gateway 无 999999（若本任务含 gateway）
4. 无 `max-content` / 行级横滚 / `table-viewport`
5. linter 无新增错误

## 使用示例

```text
三处绑定设备页各自一大段穿梭框 CSS，transfer_v2 已有，请对照 template/v2-after 改成 DeviceTransfer。
```

## 延伸阅读

- [`../../references/transfer-v2-layout.md`](../../references/transfer-v2-layout.md)
- [`../../references/gateway-full-fetch.md`](../../references/gateway-full-fetch.md)
- [`../../references/tab-embedded-layout.md`](../../references/tab-embedded-layout.md)
- [`../../references/anti-patterns.md`](../../references/anti-patterns.md)
- [`../更新-页面接入Transfer/SKILL.md`](../更新-页面接入Transfer/SKILL.md)（v1 回退）
