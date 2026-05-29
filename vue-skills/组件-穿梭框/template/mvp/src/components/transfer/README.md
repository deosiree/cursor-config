# Transfer 穿梭框组件使用手册

## 简介

Transfer 穿梭框组件是一个功能强大的数据选择组件，支持在两个列表之间移动数据项。本组件基于 Element Plus 的 Transfer 组件进行定制开发，增加了虚拟滚动功能以支持大数据量场景。

## 特性

- ✅ 支持大数据量（通过虚拟滚动优化）
- ✅ 支持自定义渲染内容
- ✅ 支持搜索过滤
- ✅ 支持自定义标题和按钮文本
- ✅ 支持左右面板自定义插槽
- ✅ 完全兼容 Element Plus Transfer API

## 基本用法

### 安装

组件已内置在项目中，直接导入使用：

```vue
<script setup>
import customTransfer from '@/components/transfer/src/transfer.vue'
</script>
```

### 最简单的例子

```vue
<template>
  <customTransfer
    v-model="selectedKeys"
    :data="transferData"
  />
</template>

<script setup>
import { ref } from 'vue'
import customTransfer from '@/components/transfer/src/transfer.vue'

const selectedKeys = ref(['1', '2'])
const transferData = ref([
  { key: '1', label: '选项1' },
  { key: '2', label: '选项2' },
  { key: '3', label: '选项3' },
])
</script>
```

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| `v-model` / `modelValue` | 绑定值，选中项的 key 数组 | `(string \| number)[]` | `[]` |
| `data` | 数据源 | `TransferDataItem[]` | `[]` |
| `filterable` | 是否可搜索 | `boolean` | `false` |
| `filterMethod` | 自定义搜索方法 | `(query: string, item: TransferDataItem) => boolean` | - |
| `filterPlaceholder` | 搜索框占位符 | `string` | 当前语言默认值，`zh-CN` 下为 `'请输入搜索内容'` |
| `titles` | 自定义列表标题 | `[string, string]` | 当前语言默认值，`zh-CN` 下为 `['列表 1', '列表 2']` |
| `buttonTexts` | 自定义按钮文本 | `[string, string]` | `[]` |
| `props` | 数据源的字段别名 | `TransferPropsAlias` | `{ key: 'key', label: 'label', disabled: 'disabled' }` |
| `format` | 列表顶部勾选状态文案 | `TransferFormat` | `{}` |
| `leftDefaultChecked` | 初始状态下左侧列表的已勾选项的 key 数组 | `(string \| number)[]` | `[]` |
| `rightDefaultChecked` | 初始状态下右侧列表的已勾选项的 key 数组 | `(string \| number)[]` | `[]` |
| `renderContent` | 自定义数据项渲染函数 | `(h: any, option: TransferDataItem) => VNode` | - |
| `targetOrder` | 右侧列表元素的排序策略 | `'original' \| 'push' \| 'unshift'` | `'original'` |
| `validateEvent` | 是否触发表单验证 | `boolean` | `true` |
| `virtualScroll` | 是否启用虚拟滚动（数据量大于 0 时启用） | `boolean` | `false` |

### TransferDataItem

数据项类型定义：

```typescript
type TransferDataItem = Record<string, any>
```

数据项必须包含 `key` 字段（或通过 `props.key` 指定的字段）作为唯一标识。

### TransferPropsAlias

字段别名配置：

```typescript
interface TransferPropsAlias {
  key?: string    // key 字段名，默认 'key'
  label?: string  // label 字段名，默认 'label'
  disabled?: string // disabled 字段名，默认 'disabled'
}
```

### TransferFormat

列表顶部勾选状态文案：

```typescript
interface TransferFormat {
  noChecked?: string   // 未勾选时的文案，默认显示选中数量
  hasChecked?: string  // 已勾选时的文案，默认显示选中数量
}
```

### Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| `change` | 右侧列表元素变化时触发 | `(value: (string \| number)[], direction: 'left' \| 'right', movedKeys: (string \| number)[])` |
| `left-check-change` | 左侧列表勾选状态变化时触发 | `(value: (string \| number)[], movedKeys?: (string \| number)[])` |
| `right-check-change` | 右侧列表勾选状态变化时触发 | `(value: (string \| number)[], movedKeys?: (string \| number)[])` |

### Methods

通过 ref 可以访问到以下方法：

| 方法名 | 说明 | 参数 |
|--------|------|------|
| `clearQuery` | 清空某个面板的搜索关键字 | `(which: 'left' \| 'right')` |

### Slots

| 插槽名 | 说明 |
|--------|------|
| `default` | 自定义数据项内容，参数为 `{ option: TransferDataItem }` |
| `left-footer` | 左侧面板底部内容 |
| `right-footer` | 右侧面板底部内容 |
| `left-empty` | 左侧面板无数据时显示的内容 |
| `right-empty` | 右侧面板无数据时显示的内容 |

## 使用示例

### 基础用法

```vue
<template>
  <customTransfer
    v-model="selectedKeys"
    :data="transferData"
    :titles="['待选择', '已选择']"
    :button-texts="['移除', '添加']"
  />
</template>

<script setup>
import { ref } from 'vue'
import customTransfer from '@/components/transfer/src/transfer.vue'

const selectedKeys = ref(['1', '2'])
const transferData = ref([
  { key: '1', label: '选项1' },
  { key: '2', label: '选项2' },
  { key: '3', label: '选项3', disabled: true },
])
</script>
```

### 启用搜索

```vue
<template>
  <customTransfer
    v-model="selectedKeys"
    :data="transferData"
    filterable
    filter-placeholder="请输入关键字搜索"
    :filter-method="filterMethod"
  />
</template>

<script setup>
import { ref } from 'vue'
import customTransfer from '@/components/transfer/src/transfer.vue'

const selectedKeys = ref([])
const transferData = ref([
  { key: '1', label: '选项1', desc: '描述1' },
  { key: '2', label: '选项2', desc: '描述2' },
])

// 自定义搜索方法
const filterMethod = (query: string, item: any) => {
  return item.label.toLowerCase().includes(query.toLowerCase()) ||
         item.desc?.toLowerCase().includes(query.toLowerCase())
}
</script>
```

### 启用虚拟滚动（大数据量）

当数据量较大时（如超过 3000 条），建议启用虚拟滚动以提升性能：

```vue
<template>
  <customTransfer
    v-model="selectedKeys"
    :data="transferData"
    :virtual-scroll="true"
  />
</template>

<script setup>
import { ref } from 'vue'
import customTransfer from '@/components/transfer/src/transfer.vue'

const selectedKeys = ref([])
// 大量数据
const transferData = ref(
  Array.from({ length: 5000 }, (_, i) => ({
    key: `item-${i}`,
    label: `选项 ${i + 1}`,
  }))
)
</script>
```

### 自定义数据项渲染

```vue
<template>
  <customTransfer
    v-model="selectedKeys"
    :data="transferData"
  >
    <template #default="{ option }">
      <div style="display: flex; align-items: center;">
        <el-icon><User /></el-icon>
        <span style="margin-left: 8px;">{{ option.label }}</span>
        <el-tag v-if="option.tag" size="small" style="margin-left: 8px;">
          {{ option.tag }}
        </el-tag>
      </div>
    </template>
  </customTransfer>
</template>

<script setup>
import { ref } from 'vue'
import { User } from '@element-plus/icons-vue'
import customTransfer from '@/components/transfer/src/transfer.vue'

const selectedKeys = ref([])
const transferData = ref([
  { key: '1', label: '用户1', tag: 'VIP' },
  { key: '2', label: '用户2', tag: '普通' },
])
</script>
```

### 自定义面板底部（表头）

```vue
<template>
  <customTransfer
    v-model="selectedKeys"
    :data="transferData"
  >
    <template #left-footer>
      <div class="transfer-header">
        <div class="header-item">名称</div>
        <div class="header-item">描述</div>
        <div class="header-item">状态</div>
      </div>
    </template>
    
    <template #right-footer>
      <div class="transfer-header">
        <div class="header-item">名称</div>
        <div class="header-item">描述</div>
        <div class="header-item">状态</div>
      </div>
    </template>
    
    <template #default="{ option }">
      <div class="transfer-item">
        <div class="transfer-item__desc">{{ option.name }}</div>
        <div class="transfer-item__desc">{{ option.desc }}</div>
        <div class="transfer-item__desc">
          <el-tag :type="option.status === 'active' ? 'success' : 'info'">
            {{ option.status }}
          </el-tag>
        </div>
      </div>
    </template>
  </customTransfer>
</template>

<script setup>
import { ref } from 'vue'
import customTransfer from '@/components/transfer/src/transfer.vue'

const selectedKeys = ref([])
const transferData = ref([
  { key: '1', name: '项目1', desc: '描述1', status: 'active' },
  { key: '2', name: '项目2', desc: '描述2', status: 'inactive' },
])
</script>

<style scoped>
.transfer-header {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  padding: 4px 20px;
  font-size: 12px;
  font-weight: 600;
  color: #606266;
  background: #f5f7fa;
}

.transfer-item {
  display: flex;
  align-items: center;
  font-size: 12px;
}

.transfer-item__desc {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
```

### 使用自定义字段名

当数据源的字段名不是 `key`、`label`、`disabled` 时，可以通过 `props` 指定：

```vue
<template>
  <customTransfer
    v-model="selectedKeys"
    :data="transferData"
    :props="{
      key: 'id',
      label: 'name',
      disabled: 'isDisabled'
    }"
  />
</template>

<script setup>
import { ref } from 'vue'
import customTransfer from '@/components/transfer/src/transfer.vue'

const selectedKeys = ref([1, 2])
const transferData = ref([
  { id: 1, name: '选项1', isDisabled: false },
  { id: 2, name: '选项2', isDisabled: false },
  { id: 3, name: '选项3', isDisabled: true },
])
</script>
```

### 完整示例（设备绑定场景）

```vue
<template>
  <el-dialog v-model="dialogVisible" title="绑定设备" width="65%">
    <div class="transfer-container">
      <customTransfer
        ref="transferRef"
        v-model="selectedDeviceKeys"
        :data="transferData"
        filterable
        :filter-method="filterMethod"
        filter-placeholder="请输入关键字进行模糊搜索"
        :titles="['待绑定设备', '已绑定设备']"
        :button-texts="['解绑', '绑定']"
        class="full-height-transfer"
        :virtual-scroll="true"
      >
        <template #left-footer>
          <div class="transfer-header">
            <div class="header-item">设备名称</div>
            <div class="header-item">设备描述</div>
            <div class="header-item">机器码</div>
            <div class="header-item">状态</div>
          </div>
        </template>

        <template #right-footer>
          <div class="transfer-header">
            <div class="header-item">设备名称</div>
            <div class="header-item">设备描述</div>
            <div class="header-item">机器码</div>
            <div class="header-item">状态</div>
          </div>
        </template>

        <template #default="{ option }">
          <div class="transfer-item">
            <div class="transfer-item__desc">{{ option.device?.deviceName || '-' }}</div>
            <div class="transfer-item__desc">{{ option.device?.deviceDesc || '-' }}</div>
            <div class="transfer-item__desc">{{ option.device?.machineCode || '-' }}</div>
            <div class="transfer-item__desc">
              <el-tag v-if="option.device?.status" size="small">
                {{ getStatusLabel(option.device.status) }}
              </el-tag>
              <span v-else>-</span>
            </div>
          </div>
        </template>
      </customTransfer>
    </div>
  </el-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'
import customTransfer from '@/components/transfer/src/transfer.vue'

const dialogVisible = ref(false)
const transferRef = ref()
const selectedDeviceKeys = ref([])
const transferData = ref([])

// 搜索方法
const filterMethod = (query: string, item: any) => {
  const device = item.device
  if (!device) return false
  const searchText = query.toLowerCase()
  return (
    device.deviceName?.toLowerCase().includes(searchText) ||
    device.deviceDesc?.toLowerCase().includes(searchText) ||
    device.machineCode?.toLowerCase().includes(searchText)
  )
}

// 关闭对话框时清空搜索框
watch(dialogVisible, (visible) => {
  if (!visible && transferRef.value) {
    if (transferRef.value.clearQuery) {
      transferRef.value.clearQuery('left')
      transferRef.value.clearQuery('right')
    }
  }
})
</script>
```

## 性能优化建议

1. **大数据量场景**：当数据量超过 1000 条时，建议启用 `virtual-scroll` 属性
2. **搜索优化**：使用 `filterMethod` 自定义搜索逻辑，避免不必要的计算
3. **数据格式**：确保数据项的 `key` 值是唯一的，避免性能问题

## 注意事项

1. 数据项的 `key` 值必须唯一
2. 启用虚拟滚动时，建议数据量大于 0 才启用（组件会自动判断）
3. 自定义渲染时，注意保持列表项高度一致，以获得更好的虚拟滚动效果
4. 使用 `clearQuery` 方法清空搜索框时，需要确保组件已完全挂载

## 常见问题

### Q: 虚拟滚动不生效？

A: 确保 `virtual-scroll` 属性设置为 `true`，且数据量大于 0。

### Q: 搜索框清空不生效？

A: 使用组件暴露的 `clearQuery` 方法，而不是直接操作 DOM。

### Q: 自定义渲染内容不显示？

A: 检查是否正确使用了 `default` 插槽，并确保插槽参数格式正确。

### Q: 数据项无法移动？

A: 检查数据项的 `key` 值是否唯一，以及是否设置了 `disabled` 属性。

## 更新日志

### v1.0.0
- 初始版本
- 支持虚拟滚动
- 支持自定义渲染
- 完全兼容 Element Plus Transfer API

