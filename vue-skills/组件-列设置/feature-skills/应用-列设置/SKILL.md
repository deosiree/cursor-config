---
name: 应用-列设置
description: 当 ColumnFilter 已存在、目标表格仍为硬编码 el-table-column 时，按 template/before|after 接入列设置与动态列渲染。
---

# 应用-列设置

父级 agent：[`../../SKILL.md`](../../SKILL.md)。本节点只负责 **业务页列设置迁移**。

## 何时使用

- 已存在 `ColumnFilter.vue`
- 目标表仍为静态 `<el-table-column>` 列表
- 工具栏缺「列设置」按钮

## 何时不要使用

- 组件不存在 → [`../新增-组件列设置/SKILL.md`](../新增-组件列设置/SKILL.md)
- 操作列折叠 → `组件-操作列折叠`

## 规范样本

| 样本 | 形态 | Before | After | 默认隐藏 |
|------|------|--------|-------|----------|
| **租户** | B 分页+子表 | [`tenant/before`](../../template/before/src/views/tenant/) | [`tenant/after`](../../template/after/src/views/tenant/) | 联系人、创建时间 |
| **用户** | C 搜索栏插槽 | [`user/before`](../../template/before/src/views/system/user/) | [`user/after`](../../template/after/src/views/system/user/) | 创建时间 |
| **角色** | D 表自闭环 | [`role/before`](../../template/before/src/views/system/role/components/role/RoleListTable.vue) | [`role/after`](../../template/after/src/views/system/role/components/role/RoleListTable.vue) | 无 |

Few-shot：[`tenant-column-settings-replace.md`](../../assets/few-shot-example/tenant-column-settings-replace.md)、[`user-column-settings-replace.md`](../../assets/few-shot-example/user-column-settings-replace.md)、[`role-column-settings-replace.md`](../../assets/few-shot-example/role-column-settings-replace.md)

页面形态：[`page-layout-patterns.md`](../../references/page-layout-patterns.md)

## RED：迁移前核对

1. 目标表是否硬编码 `el-table-column`
2. 工具栏结构属于 A/B/C/D 哪种形态
3. 权限点（通常与 `query` 同级）
4. 是否已有 `OperationColumn` 等复杂列 slot（迁移时须保留）

## 🔴 CHECKPOINT · 🛑 STOP

| 触发条件 | 必须动作 |
|----------|----------|
| 无 `ColumnFilter.vue` | **停止应用**，改走 [`新增-组件列设置`](../新增-组件列设置/SKILL.md) |
| 无法判定 A/B/C/D 形态 | 读 [`page-layout-patterns.md`](../../references/page-layout-patterns.md)；仍不明则问用户 |
| 用户要求默认隐藏列但未说明 | 读 [`localStorage-keys.md`](../../references/localStorage-keys.md)；新模块则问用户确认 |

## GREEN：通用步骤

### 1. 列配置块（父页或表组件，依形态而定）

```ts
const STORAGE_KEY = "{module}_manage_table_columns";

const buildTableColumns = () => {
  t("列名1"); // 每个 label 调用 t()
  return [
    { prop: "selection", label: "选择", required: true },
    { prop: "foo", label: "列名1", visible: true },
    { prop: "actions", label: "操作", required: true },
  ];
};

const tableColumns = ref(buildTableColumns());
const selectedColumns = ref<string[]>([]);
const visibleColumns = computed(() =>
  tableColumns.value.filter(
    (c) => selectedColumns.value.includes(c.prop) || c.required
  )
);
```

`initSelectedColumns` + `watch` → localStorage，推荐非法 prop 过滤（见 [`localStorage-keys.md`](../../references/localStorage-keys.md)）。

`onMounted` 首行或尽早调用 `initSelectedColumns()`。

### 2. 工具栏 ColumnFilter

```vue
<span v-hasPerm="'sys:xxx:query'" class="column-filter-wrap">
  <ColumnFilter v-model="selectedColumns" :columns="tableColumns" />
</span>
```

样式：`.column-filter-wrap { display: inline-flex; align-items: center; }`

### 3. 表格动态列

子表增加 `visibleColumns` prop；模板改为：

```vue
<template v-for="column in visibleColumns" :key="column.prop">
  <el-table-column v-if="column.prop === 'foo'" :label="$t(column.label)" ... />
  <OperationColumn v-else-if="column.prop === 'actions'" ... />
</template>
```

### 4. 分模块要点

| 模块 | 改动文件 | 要点 |
|------|----------|------|
| 租户 | `index.vue` + `TenantTable.vue` | 父页列状态；`:visible-columns` 传子表 |
| 用户 | `index.vue` + `UserSearchBar.vue` + `UserTable.vue` | `UserSearchBar` 增 `#actions-extra` 插槽 |
| 角色 | `RoleListTable.vue` | 列状态+Filter+表同文件；无 selection 列 |

## 失败 fallback

| 症状 | 一线修复 | 仍失败兜底 |
|------|----------|------------|
| 勾选列后表格无变化 | 确认 `*Table.vue` 已接 `visibleColumns` 且 `v-for` 分支完整 | 对照 [`template/after`](../../template/after/) 同模块 diff |
| 首屏仅显示选择+操作两列 | `onMounted` 前未 `initSelectedColumns`；或 `selectedColumns` 初始为空 | 补默认选中或同步调用 init |
| 刷新后列偏好丢失 | 检查 `watch(selectedColumns)` 是否写 storageKey；key 名是否与文档一致 | 见 [`localStorage-keys.md`](../../references/localStorage-keys.md) |
| 用户模块 Filter 不显示 | 确认 `#actions-extra` 插槽已加且父页有 `#actions-extra` 内容 | 勿把插槽写到 BaseListToolbar |
| 动态列丢失状态 tag / OperationColumn | 按 `column.prop` 分支保留原 slot，只改渲染壳 | 读 [`anti-patterns.md`](../../references/anti-patterns.md) §8 |

## REFACTOR

| 场景 | 处理 |
|------|------|
| 新列表页形态接近租户 | 抄 B 形态 before/after |
| 工具栏在独立 SearchBar 组件 | 增 actions 扩展插槽（参考用户 C） |
| 工具栏表已封装 | 抄 D 形态角色表 |

## 验收

- [ ] 有 query 权限显示「列设置」
- [ ] 默认列与 [`localStorage-keys.md`](../../references/localStorage-keys.md) 一致
- [ ] 勾选/重置/刷新持久化正常
- [ ] `OperationColumn`、状态 tag 等业务 slot 未退化
- [ ] linter 无新增错误

## 延伸阅读

- API：[`column-config-api.md`](../../references/column-config-api.md)
- 反模式：[`anti-patterns.md`](../../references/anti-patterns.md)
