---
name: 更新-页面接入OperationColumn
description: 当 OperationColumn 溢出套件已存在，目标表格仍使用 el-table-column + el-button 操作列时，按 template/before|after 替换为 OperationColumn + OpItem。
---

# 更新-页面接入OperationColumn

父级 agent：[`../../SKILL.md`](../../SKILL.md)。本节点只负责 **业务表操作列迁移**，不重复创建全局组件。

## 何时使用

- 已存在 `OpItem.vue`、`OperationCellOverflow.vue`
- 目标 `*Table.vue` 仍为 `<el-table-column label="操作">` + 多个 `<el-button v-hasPerm>`

## 何时不要使用

- 组件套件不存在 → 先 [`../新增-OperationColumn溢出套件/SKILL.md`](../新增-OperationColumn溢出套件/SKILL.md)
- 纯列表高度 / 分页裁切 → [`layout-fixedHeadTail-adaptiveMiddle`](../../layout-fixedHeadTail-adaptiveMiddle/SKILL.md)

## 规范样本（双表对照）

| 样本 | 场景 | Before | After |
|------|------|--------|-------|
| **租户** | `$t` 文案、固定 `width` | [`tenant/.../TenantTable.vue`](../../template/before/src/views/tenant/components/TenantTable.vue) | [`after/.../tenant/`](../../template/after/src/views/tenant/components/TenantTable.vue) |
| **用户** | 硬编码中文、多 `v-if` | [`user/.../UserTable.vue`](../../template/before/src/views/system/user/components/UserTable.vue) | [`after/.../user/`](../../template/after/src/views/system/user/components/UserTable.vue) |
| **菜单** | 树表、`row.type` 多 `v-if`、Tab 子集 `:data` | 对照租户/用户 before 同构 | [`after/.../menu/*.fragment.vue`](../../template/after/src/views/system/menu/menu-index-operation-column.fragment.vue) |

Few-shot：[`tenant-table-replace.md`](../../assets/few-shot-example/tenant-table-replace.md)、[`user-table-replace.md`](../../assets/few-shot-example/user-table-replace.md)、[`menu-table-replace.md`](../../assets/few-shot-example/menu-table-replace.md)

其他 `*Table.vue` **同构替换**；**勿**借机改 i18n（见 [`optional-i18n.md`](../../references/optional-i18n.md)）。

## RED：迁移前核对

1. 操作列是否写死 `width="200"`（或类似魔法数）
2. 是否每个操作用 `el-button` + `v-hasPerm`
3. icon 是否内联 `<div class="i-svg:...">`
4. 条件操作是否用 `v-if` 在按钮上（迁移后保留在 `OpItem` 上）
5. `OperationColumn`、`OpItem` 是否已 import

## GREEN：替换步骤

### 1. 增加 import

```ts
import OperationColumn from "@/components/OperationColumn/index.vue";
import OpItem from "@/components/OperationColumn/OpItem.vue";
```

### 2. 替换列壳

```vue
<!-- Before -->
<el-table-column :label="$t('操作')" fixed="right" width="200">
  <template #default="{ row }">
    <el-button ... />
  </template>
</el-table-column>

<!-- After -->
<OperationColumn
  :label="$t('操作')"
  fixed="right"
  :list-data-length="data.length"
  :inline-visible-count="1"
>
  <template #default="{ row }">
    <!-- OpItem 列表 -->
  </template>
</OperationColumn>
```

- 删除列上的 `width` / `min-width` 魔法数
- `list-data-length` 绑定当前表 `data.length`；**勿**传 `probe-data-rows`

### 3. 每个按钮 → OpItem

| Before | After |
|--------|-------|
| `el-button` + `v-hasPerm="'code'"` | `<OpItem perm="code" ... />` |
| `type="danger"` | `type="danger"` on OpItem |
| `icon="edit"`（EP 图标） | `icon="edit"` |
| 内联 `div.i-svg:foo` | `icon-class="i-svg:foo"` |
| `@click` | `@click`（签名不变） |
| `v-if` on button | `v-if` on OpItem |

### 4. 权限与无权限项

- 有 `v-hasPerm` 的项：改为 `perm="..."` 
- 原无 `v-hasPerm` 的项：省略 `perm`

### 5. 行内个数

- `:inline-visible-count="1"`：行内 1 个操作，其余进「更多」（菜单等可按产品设为 `3`，见 [`menu-table-replace.md`](../../assets/few-shot-example/menu-table-replace.md)）
- 树表 / 多 `v-if`：无需业务页枚举 `type` 探针行（见 [`column-width-probe.md`](../../references/column-width-probe.md)）

### 6. 禁止项

- 不要添加 `probe-data-rows`、`:probe-rows` 或 `MenuType` 探针配置
- 不要在组件内恢复 `PROBE_ROWS` 假行

## REFACTOR

| 场景 | 处理 |
|------|------|
| 操作少于 N 个 | 可不出现「更多」；仍建议统一用 OpItem |
| 自定义非标准按钮 | 优先拆为 OpItem；避免 slot 内再嵌 `el-button` |
| 列需固定 width | 仅在明确不要溢出估宽时传 `width`；与溢出模式二选一 |

## 验收清单

1. 多操作行：行内显示 `inline-visible-count` 个，其余在「更多」下拉
2. 无权限操作不渲染（与迁移前 `v-hasPerm` 一致）
3. `v-if` 条件操作仍按行数据显隐
4. 列宽稳定；`inline-visible-count≥2` 时「更多」完整可见
5. 异步 `:data`：加载完成后列宽自动更新
6. 缩放 / 改窗口宽度后操作区仍可用
7. linter 无新增错误

## 使用示例

```text
租户表操作列按钮太多，组件已有 OperationColumn，请按更新子 skill 替换 TenantTable 操作列。
```

## 延伸阅读

- [`../../assets/few-shot-example/tenant-table-replace.md`](../../assets/few-shot-example/tenant-table-replace.md)
- [`../../assets/few-shot-example/menu-table-replace.md`](../../assets/few-shot-example/menu-table-replace.md)
- [`../../references/op-item-api.md`](../../references/op-item-api.md)
- [`../../references/anti-patterns.md`](../../references/anti-patterns.md)
- [`../../references/column-width-probe.md`](../../references/column-width-probe.md)
