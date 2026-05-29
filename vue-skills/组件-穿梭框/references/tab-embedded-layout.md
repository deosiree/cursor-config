# Tab 内嵌穿梭框布局

样本：[`template/after/src/views/system/role/components/DeviceTab.vue`](../template/after/src/views/system/role/components/DeviceTab.vue)

## 容器高度

RoleEditDialog Tab 内容区 `max-height: 480px`，穿梭框容器：

```scss
.device-transfer-container {
  height: min(400px, calc(480px - 48px));
  min-height: 280px;
}
```

## 类名（Dialog / Tab 相同）

面板根在源码中均为 **`.el-panel`**（见 [dom-class-map.md](dom-class-map.md)）。列表容器均为 **`.el-transfer-panel__list`**（组件内写死）。

| 元素 | 实际类名 |
|------|----------|
| 面板根 | `.el-panel` |
| 列表容器 | `.el-transfer-panel__list` |

Tab 与 Dialog 均应对 `:deep(.el-panel)` 写 flex 列；**勿**仅用 `.el-transfer-panel` 写面板布局（选择器不命中）。BindDevice 模板内残留的 `.el-transfer-panel` 嵌套块为历史写法；定宽以 `.transfer-container :deep(.el-panel)` 为准。

## Props 组合

```vue
<customTransfer
  :virtual-scroll="false"
  :validate-event="false"
  :format="transferFormat"
/>
```

```ts
const transferFormat = { noChecked: " ", hasChecked: " " };
```

## 父级契约

保留 `defineExpose`：

- `getDeviceIds()`
- `hasLoadError()`
- `reapplySelection()`

`watch(selectedDeviceKeys)` → `emit('update:deviceIds')` 供 RoleEditDialog 消费。

## 选型回显

- 编辑：`initialDeviceIds` → `resolveSelectedKeys`
- 新建全选：`defaultSelectAll` → 全选 `transferData` 的 key
- 数据加载完成后 `syncFromProps()`
