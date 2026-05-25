# Few-shot：菜单管理操作列替换（树表 + 弹窗内表）

## 用户诉求

「菜单树表按 `row.type` 显示不同操作；权限/API 弹窗也有操作列。不要手写探针表。」

## 前置条件

`OperationColumn` 套件已存在（见 [`operation-column-mvp.md`](operation-column-mvp.md)）。

## After 要点

### 1. 菜单主表

`:list-data-length="getMenuChildren(tab.key).length"`，槽位 **3**：

```vue
<OperationColumn
  label="操作"
  fixed="right"
  align="center"
  :list-data-length="getMenuChildren(tab.key).length"
  :inline-visible-count="3"
>
```

`v-if` 留在 `OpItem` 上；探针按 `type` 取样（`pickProbeRows`）。

### 2. 弹窗内表

- **PermissionConfigDialog**：`:inline-visible-count="3"`
- **ApiConfigDialog**：`:inline-visible-count="4"`（2 个 OpItem 时常全行内）

见 [`dialog-tables-operation-column.fragment.vue`](../../template/after/src/views/system/menu/dialog-tables-operation-column.fragment.vue)。

## 样本路径

| 场景 | fragment |
|------|----------|
| 主表 | [`menu-index-operation-column.fragment.vue`](../../template/after/src/views/system/menu/menu-index-operation-column.fragment.vue) |
| 弹窗 | [`dialog-tables-operation-column.fragment.vue`](../../template/after/src/views/system/menu/dialog-tables-operation-column.fragment.vue) |

槽位语义：[`slot-semantics.md`](../../references/slot-semantics.md)

## 与租户 / 用户差异

| 点 | 租户 | 用户 | 菜单 |
|----|------|------|------|
| `inline-visible-count` | **6** | **2** | 主表 **3**；API **4** |
| `list-data-length` | `data.length` | `data.length` | Tab 子集行数 |
