# Few-shot：租户表操作列替换（before/after）

## 用户诉求

「租户列表操作列按钮太多，列宽 200 不够，改成行内 1 个 + 更多。」

## 前置条件

`OperationColumn` 套件已存在（见 [`operation-column-mvp.md`](operation-column-mvp.md)）。

## Before 问题

- `<el-table-column ... width="200">`
- 多个 `el-button`，`v-hasPerm` + 内联 svg `div`
- 无「更多」入口

## After 要点

### 列壳

```vue
<OperationColumn
  :label="$t('操作')"
  :list-data-length="data.length"
  :inline-visible-count="1"
>
```

### 按钮迁移对照

| 原写法 | 新写法 |
|--------|--------|
| `v-hasPerm` on el-button | `perm` on OpItem |
| 内联 `div.i-svg:*` | `icon-class="i-svg:*"` |
| `icon="edit"` | `icon="edit"` on OpItem |
| `type="danger"` | `type="danger"` on OpItem |
| `v-if` on button | `v-if` on OpItem |
| 无 v-hasPerm | 省略 `perm` |

### import

```ts
import OperationColumn from "@/components/OperationColumn/index.vue";
import OpItem from "@/components/OperationColumn/OpItem.vue";
```

## 样本路径

- Before：[`template/before/.../TenantTable.vue`](../../template/before/src/views/tenant/components/TenantTable.vue)
- After：[`template/after/.../TenantTable.vue`](../../template/after/src/views/tenant/components/TenantTable.vue)

## 列宽探针

- 业务页只传 `:list-data-length="data.length"`
- 详见 [`references/column-width-probe.md`](../../references/column-width-probe.md)

## 推广

其他 `*Table.vue` 对照租户/用户/菜单 after 同构替换；见 [`user-table-replace.md`](user-table-replace.md)、[`menu-table-replace.md`](menu-table-replace.md)。
