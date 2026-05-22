# OpItem API 约定

业务侧用 **`OpItem`** 声明每个操作，**不要**在 `OperationColumn` slot 内再嵌套 `el-button`。

## Props

| Prop | 类型 | 必填 | 说明 |
|------|------|------|------|
| `label` | `string` | 是 | 操作文案（参与列宽估宽与 `data-op-label`） |
| `perm` | `string \| string[]` | 否 | 权限码；无权限不渲染（同 `v-hasPerm`） |
| `icon` | `string` | 否 | Element Plus 图标名，如 `edit`、`delete` |
| `icon-class` | `string` | 否 | 自定义类名，如 `i-svg:table-manage`（与 `icon` 二选一） |
| `type` | `'primary' \| 'danger'` | 否 | 默认 `primary`；`danger` 用于删除等 |

## 事件

| 事件 | 说明 |
|------|------|
| `click` | `(event: MouseEvent)`，与原 `el-button @click` 一致 |

## 条件显隐

行级 `v-if` / `v-show` 写在 **`OpItem` 上**，与迁移前写在 `el-button` 上相同：

```vue
<OpItem
  v-if="row.showResendActivation"
  :label="$t('重发激活链接')"
  perm="sys:tenant:edit"
  @click="emit('resendActivation', row)"
/>
```

## 权限

- 有 `perm`：内部调用 `checkHasPerm(perm)`（`@/directive/permission`）
- 无 `perm`：始终渲染（适用于原列表未加 `v-hasPerm` 的操作）

## DOM 元数据（列宽探针用）

渲染后带 `data-op-label`、`data-op-icon`、`data-op-icon-class`、`data-op-type`，供 `scanOpButtons` 读取。勿改 class `operation-column-op-item`。

## 推荐 import

```ts
import OpItem from "@/components/OperationColumn/OpItem.vue";
```

样本：`template/after/src/views/tenant/components/TenantTable.vue`。
