# Few-shot：租户表操作列替换（before/after）

## 用户诉求

「租户列表 6 个操作要全部行内显示，不要『更多』。」

## 前置条件

`OperationColumn` 套件已存在（见 [`operation-column-mvp.md`](operation-column-mvp.md)）。

## After 要点

### 列壳

```vue
<OperationColumn
  :label="$t('操作')"
  :list-data-length="data.length"
  :inline-visible-count="6"
>
```

槽位 **6**：6 个可见 OpItem 时 `calcOpStrip` 折叠为全行内、无「更多」。

### 按钮迁移

| 原写法 | 新写法 |
|--------|--------|
| `v-hasPerm` on el-button | `perm` on OpItem |
| 内联 `div.i-svg:*` | `icon-class="i-svg:*"` |

## 对照路径

- before：[`template/before/.../tenant/TenantTable.vue`](../../template/before/src/views/tenant/components/TenantTable.vue)
- after：[`template/after/.../tenant/TenantTable.vue`](../../template/after/src/views/tenant/components/TenantTable.vue)

## 验收

- 6 个操作（含 `showResendActivation` 分支）均行内可见
- 无「更多」按钮
- 去掉 `width="200"`
