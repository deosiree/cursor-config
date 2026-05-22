
# OperationColumn 溢出模式

启用 **`enable-overflow-menu="true"`** 时，操作列采用固定槽位工具格布局，列宽由组件内部自动计算，无需配置 `width` / `min-width` / `max-width`，也不支持列宽拖拽。

## 目录结构

| 文件 | 职责 |
|------|------|
| `index.vue` | `el-table-column` 壳；非溢出自适应宽；溢出模式 provide 列宽协调器 |
| `OpItem.vue` | 业务声明式操作槽（权限、`data-op-*`、点击） |
| `OpItemContent.vue` | 行内 / 「更多」菜单共用视觉（icon、文案、menu tooltip） |
| `OperationCellOverflow.vue` | 行内与「更多」切分、下拉、行签名上报 |
| `operationWidth.ts` | DOM 元数据、行扫描、Canvas 测宽、列宽协调器 |

权限判断与 `v-hasPerm` 共用 [`checkHasPerm`](../../directive/permission/index.ts)。

## 推荐 import

```ts
import OperationColumn from "@/components/OperationColumn/index.vue";
import OpItem from "@/components/OperationColumn/OpItem.vue";
```

## 槽位约定（对齐原型）

| 元素 | 尺寸 |
|------|------|
| 普通操作槽 | 高 32px，宽 min 32px（随按钮内容增长） |
| 「更多」槽 | 高 32px，宽 min 40px |
| 槽间距 | 8px |
| icon 槽 | 14×14px，与文案间距 4px |
| Cell 左右 padding | 各 8px（列宽 = 内容宽 + 16 + 2px 缓冲） |
| 固定右列滚动条余量 | 8px（`FIXED_RIGHT_GUTTER`，`fixed="right"` 时自动加） |
| 「更多」槽公式下限 | 40px（对齐 CSS `min-width`） |
| 「更多」下拉菜单 | 最大宽度 200px，超长文案省略，悬浮 tooltip 显示全称 |

## OpItem（声明式操作槽）

业务侧使用 **`OpItem`** 定义每个操作，**不要**再嵌套 `el-button`。

| Prop | 作用 |
|------|------|
| `label` | 文案（必填） |
| `icon` | Element Plus 图标名，如 `edit`、`delete` |
| `icon-class` | 自定义 `i-svg:*` 类名（与 `icon` 二选一） |
| `type` | `primary`（默认）或 `danger` |
| `perm` | 权限码，无权限时不渲染（同 `v-hasPerm`） |

行内与「更多」下拉共用 `OpItemContent` 布局，保证 icon 左对齐、左侧留白一致。

```vue
<OperationColumn
  :label="$t('操作')"
  fixed="right"
  :list-data-length="data.length"
  :inline-visible-count="1"
  :enable-overflow-menu="true"
>
  <template #default="{ row }">
    <OpItem
      :label="$t('编辑')"
      icon="edit"
      perm="sys:example:edit"
      @click="onEdit(row)"
    />
  </template>
</OperationColumn>
```

## 核心 Props（OperationColumn）

| Prop | 作用 | 默认 |
|------|------|------|
| **`inline-visible-count`** | 行内最多外露几个 `OpItem`，其余收进「更多」 | `1` |
| **`enable-overflow-menu`** | 启用固定槽位 + 溢出菜单 | `false` |
| **`cell-padding`** | 列宽补偿的 cell 左右 padding 总和（px） | `16` |
| **`action-gap`** | 槽间距（px） | `8` |
| **`list-data-length`** | 数据行数变化时重置签名缓存 | 必填 |

## 列宽如何计算（溢出模式）

1. **slot 离屏探针（必须）**：`inject(ElTable)` 读取表数据（`store.states.data`，挂载早期若仍为空则回退 `props.data`），经 `collectProbeRowsFromTableData` 选取代表行，再离屏 render、`scanOpButtons` 读 DOM。表数据尚未就绪时不弹错，待 `list-data-length` / 表数据长度变化后自动重探针。
2. **估宽**：`inline-visible-count ≥ 2` 时按单按钮累加（对齐 `min-width:32px`）；跨场景 `globalMaxBtn > inline` 时各场景均预留「更多」槽。
3. **多场景取 max**：取最宽作为列宽；`list-data-length` 变化时清行签名并**重跑**离屏探针。
4. **行签名**：行 mount 后仅登记可见按钮组合签名，**不**用行 DOM 修正列宽（避免先宽后窄闪烁）。`userInfo.perms` 变化时重跑离屏探针。

## 不用溢出菜单时

关闭 `:enable-overflow-menu="true"` 时，行为与旧版一致，仍可用 slot 包裹任意内容，`width` 为固定列宽：

```vue
<OperationColumn :width="200" :list-data-length="data.length" />
```
