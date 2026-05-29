# DeviceTransfer（transfer_v2）

设备多列穿梭框：在 v1 [`Transfer`](../transfer.vue) 之上提供统一外壳、表头/行渲染与布局样式。

v1 组件与 [`README.md`](../../README.md) **保持不变**；设备多列场景请使用本目录。

## 引入

```vue
<script setup lang="ts">
import DeviceTransfer from "@/components/transfer/src/transfer_v2/DeviceTransfer.vue";
import type { DeviceTransferColumn } from "@/components/transfer/src/transfer_v2/device-transfer";
import type { TransferDataItem } from "@/components/transfer/src/transfer";
</script>
```

## 与 v1 的差异

| 项 | v1 | DeviceTransfer |
|----|-----|----------------|
| 虚拟滚动 | 默认 `false` | 默认 **`true`** |
| 外壳高度 | 业务页自写样式 | `hostHeight` |
| 多列表格 | 业务 slot + 自写 grid | `columns` 数组，内部等分 N 列渲染 |
| 搜索过滤 | 必写 `filterMethod` 或走 label | 默认按 `columns.getValue` 过滤；扩展字段时传 `filterMethod` |
| 表单校验 | `validateEvent` 默认 `true` | 默认 **`false`**（勾选不触发表单） |

## Props

| Prop | 类型 | 默认 | 说明 |
|------|------|------|------|
| `v-model` | `(string \| number)[]` | `[]` | 已选 key |
| `data` | `TransferDataItem[]` | `[]` | 数据源 |
| `columns` | `DeviceTransferColumn[]` | `[]` | 列定义；长度 = 等分列数 |
| `hostHeight` | `string` | `'500px'` | 外壳可视高度 |
| `titles` | `[string, string]` | `[]` | 左右面板标题 |
| `buttonTexts` | `[string, string]` | `[]` | 中间按钮文案 |
| `filterable` | `boolean` | `true` | 是否可搜索 |
| `filterPlaceholder` | `string` | — | 搜索占位 |
| `filterMethod` | `(query, item) => boolean` | — | 可选；未传则按 columns 默认过滤 |
| `virtualScroll` | `boolean` | `true` | 虚拟滚动 |
| `preventLabelToggle` | `boolean` | `false` | 点击行内文案不切换 checkbox |
| `validateEvent` | `boolean` | `false` | 是否触发表单校验 |

### DeviceTransferColumn

```ts
interface DeviceTransferColumn {
  label: string; // 已翻译表头
  getValue: (option: TransferDataItem) => string | undefined;
}
```

列宽：`repeat(N, minmax(0, 1fr))`，N = `columns.length`。

## 示例

```vue
<template>
  <DeviceTransfer
    v-model="selectedKeys"
    :data="transferData"
    :columns="deviceColumns"
    host-height="500px"
    filter-placeholder="搜索设备"
    :titles="['未绑定', '已绑定']"
    :button-texts="['移除', '添加']"
  />
</template>

<script setup lang="ts">
const deviceColumns = [
  { label: "设备名称", getValue: (o) => o.device?.deviceName },
  { label: "机器码", getValue: (o) => o.device?.machineCode },
];
</script>
```

扩展搜索（租户绑定设备，含租户/状态）：

```vue
<DeviceTransfer
  :columns="deviceColumns"
  :filter-method="customFilter"
  :prevent-label-toggle="true"
/>
```

Tab 内较矮：

```vue
<DeviceTransfer host-height="min(400px, calc(480px - 48px))" ... />
```

## 插槽（可选覆盖）

- `left-footer` / `right-footer` / `default`：默认由 `columns` 渲染；传入 slot 可覆盖

## ref 方法

`clearQuery('left' | 'right')`、`leftPanel`、`rightPanel`

## 项目内使用

- `src/views/system/role/components/DeviceTab.vue`
- `src/views/tenant/components/BindDeviceDialog.vue`
- `src/views/tenant/components/ProjectDeviceConfigDialog.vue`
