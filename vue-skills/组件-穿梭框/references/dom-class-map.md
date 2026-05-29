# customTransfer DOM 类名真相表

源码：[transfer-panel.vue](../../../../apex_dev/src/components/transfer/src/transfer-panel.vue) 使用 `ns.b('panel')` → `` `el-${blockName}` ``，**面板根不是** `el-transfer-panel`。

## 类名对照

| DOM 节点 | 实际类名 | 常见误写 | 备注 |
|----------|----------|----------|------|
| 面板根 | `.el-panel` | `.el-transfer-panel` | `transfer-panel.vue` 根 `div` |
| 面板头 | `.el-panel__header` | `.el-transfer-panel__header` | `ns.be('panel', 'header')` |
| 搜索框 | `.el-panel__filter` | `.el-transfer-panel__filter` | 同上 |
| 表头插槽区 | `.el-panel__footer` | `.el-transfer-panel__footer` | `#left-footer` / `#right-footer` |
| 列表外体 | `.el-panel__body` | `.el-transfer-panel__body` | 同上 |
| 列表容器 | `.el-transfer-panel__list` | — | 组件内**写死** class |
| 虚拟行 checkbox | `.el-transfer-panel__item` | — | `transfer-checkbox-item.vue` 写死 |
| 非虚拟行 | `.el-panel__item` | — | `virtual-scroll=false` 时 |

## 样式书写规则

| 目的 | 应写选择器 | 勿仅用 |
|------|------------|--------|
| 面板 flex 列、filter/header/footer 顺序 | `:deep(.el-panel)` 及其 `__header` / `__filter` / `__body` / `__footer` | 仅 `.el-transfer-panel` |
| 左右列宽度（Dialog） | `.transfer-container :deep(.el-panel) { width: 45%; min-width: 350px }` | — |
| 列表纵向滚动、flex 占满 | `:deep(.el-transfer-panel__list)` 及 `> div` 的 `overflow-y: auto` | 在错误的面板根下写 list |
| 行项 padding / checkbox 对齐 | `.transfer-container :deep(.el-transfer-panel__item.el-checkbox)` | 勿指望 EP 在 `.el-transfer-panel` 祖先下的规则自动生效 |
| flex 子节点顺序 | `.el-panel__header/filter/footer/body` 分别 `order: 1/2/3/4` | 漏 filter → 搜索框置顶 |

## flex order（`.el-panel` 平铺结构）

customTransfer 将 header、filter、footer、body 作为 **`.el-panel` 的直接子元素**（非 EP 旧版嵌套在 `.el-transfer-panel__body` 内）。改顺序必须用 `order`，不能只改 DOM 注释顺序。

详表与 DevTools 验收：[transfer-page-ui.md §⑤](transfer-page-ui.md)

## 与样本文件的关系

| 样本 | 说明 |
|------|------|
| [BindDeviceDialog after](../../template/after/src/views/tenant/components/BindDeviceDialog.vue) | `#bindDevice`；`.full-height-transfer :deep(.el-panel)` + order 1/2/3/4（与 apex HEAD 一致） |
| [ProjectDeviceConfigDialog after](../../template/after/src/views/tenant/components/ProjectDeviceConfigDialog.vue) | `#projectDeviceConfig`；§⑤ 间距 + `.transfer-container` 行 checkbox 复刻 |
| [DeviceTab after](../../template/after/src/views/system/role/components/DeviceTab.vue) | 注释已标明「真实类名为 el-panel」 |

改页前在 DevTools 确认：面板根节点 class 含 `el-panel`，再写 `:deep`。

## 延伸阅读

- [transfer-page-ui.md](transfer-page-ui.md) — UI 四必选
- [tab-embedded-layout.md](tab-embedded-layout.md) — Tab 容器高度
- [project-device-config-regression.md](../assets/few-shot-example/project-device-config-regression.md) — 选错类名 + 字符串 template 回归案例
