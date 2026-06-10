# 产出验收清单

## 新增-组件列设置

- [ ] `src/components/ColumnFilter/ColumnFilter.vue` 已落地
- [ ] i18n：`列设置`、`显示/隐藏列`、`重置`
- [ ] 未改动业务 `*Table.vue`
- [ ] 已提示进入应用-列设置

## 应用-列设置

- [ ] 已判定页面形态 A/B/C/D
- [ ] `buildTableColumns` + `t()` 抽取
- [ ] `ColumnFilter` 权限包在原生 `<span>`
- [ ] `visibleColumns` 驱动表格 `v-for`
- [ ] `localStorage` 键符合 [`localStorage-keys.md`](../references/localStorage-keys.md)
- [ ] `initSelectedColumns` 含非法 prop 过滤（推荐）
- [ ] 原 slot（状态、OperationColumn）保留
- [ ] linter 无新增错误

## 父级路由

- [ ] 无 ColumnFilter → 新增
- [ ] 有 ColumnFilter、静态列 → 应用
- [ ] 未误触发操作列折叠 / 布局 skill
