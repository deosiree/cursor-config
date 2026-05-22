# Few-shot：新增 OperationColumn 溢出套件（MVP）

## 用户诉求

「新建全局操作列组件，按钮太多时折叠到更多，列宽自动算。」

## Before 问题（旧列壳）

- `v-auto-width` 扫描 `.operation-buttons .el-button` 算宽
- 业务仍用 `el-button`，无声明式 `perm` / 统一 icon 槽
- 无「更多」折叠

对照：[`references/anti-patterns.md`](../../references/anti-patterns.md) §6。

## After 要点

### 文件清单（从 template/mvp 拷贝）

```text
src/components/OperationColumn/
  index.vue              # inject 离屏探针
  OpItem.vue
  OpItemContent.vue
  OperationCellOverflow.vue
  operationWidth.ts
  README.md
src/directive/permission/index.ts   # checkHasPerm（有权限体系时）
```

### 关键 API

| API | 作用 |
|-----|------|
| `listDataLength` | 与 `:data` 行数同步；变化时重跑探针 |
| `inlineVisibleCount` | 行内外露个数，其余进「更多」 |
| `OpItem.perm` | 与 `v-hasPerm` 共用 `checkHasPerm` |

### 最小可用列

```vue
<OperationColumn
  :label="$t('操作')"
  fixed="right"
  :list-data-length="rows.length"
  :inline-visible-count="1"
>
  <template #default="{ row }">
    <OpItem label="编辑" icon="edit" perm="sys:x:edit" @click="onEdit(row)" />
  </template>
</OperationColumn>
```

## 样本路径

- 组件：[`template/mvp/src/components/OperationColumn/`](../../template/mvp/src/components/OperationColumn/)
- 列宽：[`references/column-width-probe.md`](../../references/column-width-probe.md)
- i18n（可选）：[`references/optional-i18n.md`](../../references/optional-i18n.md)

## 下一步

组件落地后 → [`tenant-table-replace.md`](tenant-table-replace.md)；树表菜单 → [`menu-table-replace.md`](menu-table-replace.md)
