# Transfer API 要点

基于 [`template/mvp/src/components/transfer/README.md`](../template/mvp/src/components/transfer/README.md) 提炼。与 Element Plus Transfer API 兼容。

## 引入

```ts
import customTransfer from "@/components/transfer/src/transfer.vue";
import type { TransferDataItem } from "@/components/transfer/src/transfer";
```

## 常用 Props

| 参数 | 说明 | 典型值 |
|------|------|--------|
| `v-model` | 右侧已选 key 数组 | `selectedDeviceKeys` |
| `data` | 全量选项（左+右数据源） | `transferData` |
| `filterable` | 面板内搜索 | `true` |
| `filter-method` | 自定义过滤 | `(query, item) => boolean` |
| `titles` | 左右标题 | `['未绑定', '已绑定']` |
| `button-texts` | 中间按钮文案 | `['移除', '添加']` |
| `format` | 头部勾选计数文案 | 隐藏计数：`{ noChecked: " ", hasChecked: " " }`（勿用 `''`） |
| `virtual-scroll` | 虚拟滚动 | Dialog 大数据 **true**；Tab 小列表 **false** |
| `validate-event` | 触发表单校验 | Tab 嵌入常 `false` |

## 常用 Events

- `change(value, direction, movedKeys)` — 右侧列表变化

## 常用 Slots

- `default` — `{ option }` 自定义行
- `left-footer` / `right-footer` — 表头（BindDeviceDialog / DeviceTab 均用 footer 放表头）

## Methods（ref）

- `clearQuery('left' | 'right')` — Dialog 关闭时清空搜索

## 数据项形状

```ts
interface TransferOption extends TransferDataItem {
  key: string;      // 唯一，必填
  label: string;    // 默认展示
  device?: unknown; // 业务扩展字段
}
```

`key` 必须唯一；左右列表合并为同一 `data` 数组，由 `v-model` 区分已选（右侧）。
