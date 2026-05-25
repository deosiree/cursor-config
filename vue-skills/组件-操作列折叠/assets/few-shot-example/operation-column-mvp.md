# Few-shot：新增 OperationColumn 溢出套件（MVP）

## 用户诉求

「新建全局操作列：槽位折叠 + 离屏探针列宽。」

## Before 问题

- `v-auto-width` + `el-button` 扫宽
- 无 `calcOpStrip`、无「更多」统一切分

见 [`references/anti-patterns.md`](../../references/anti-patterns.md) §6。

## After 要点

### 文件清单

```text
src/components/OperationColumn/
  index.vue
  OpItem.vue
  OpItemContent.vue
  OperationCellOverflow.vue   # calcOpStrip 切分
  operationWidth.ts             # pickProbeRows, tblProbeFp, maxFromSlots
  README.md
  __tests__/operationWidth.test.ts   # 建议同步
```

### 关键 API

| API | 作用 |
|-----|------|
| `listDataLength` | 与 `:data` 行数同步；触发 `schedReprobe` |
| `inlineVisibleCount` | **槽位总数**（含「更多」1 槽），见 [`slot-semantics.md`](../../references/slot-semantics.md) |
| `OpItem.perm` | `checkHasPerm` |

### 最小列壳

```vue
<OperationColumn
  label="操作"
  fixed="right"
  :list-data-length="rows.length"
  :inline-visible-count="2"
>
  <template #default="{ row }">
    <OpItem label="编辑" icon="edit" perm="sys:x:edit" @click="onEdit(row)" />
  </template>
</OperationColumn>
```

## 样本路径

- [`template/mvp/src/components/OperationColumn/`](../../template/mvp/src/components/OperationColumn/)
- [`references/column-width-probe.md`](../../references/column-width-probe.md)

## 下一步

→ [`tenant-table-replace.md`](tenant-table-replace.md)、[`user-table-replace.md`](user-table-replace.md)、[`menu-table-replace.md`](menu-table-replace.md)
