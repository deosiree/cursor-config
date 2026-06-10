# should-not-trigger 补充

本文件与 [`should-trigger-prompts.md`](should-trigger-prompts.md) 的误触发表互补，供 evals 单独引用。

## 明确不触发

1. 「操作列按钮太多，折叠到更多下拉」
2. 「UserTable 改用 OperationColumn + OpItem」
3. 「表格 max-height 无效，分页被挡住」
4. 「批量把硬编码中文改成 $t()」
5. 「设备列表加列排序 filter」
6. 「仅调整 el-table-column width」

## 边界：可能共存但不属本 skill

- 列表页**同时**要列设置 + 操作列折叠：先列设置（本 skill），操作列另走 `组件-操作列折叠`
- 列设置接入时**顺带**在 `buildTableColumns` 内 `t()`：允许，不算全量 i18n 迁移
