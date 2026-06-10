# 触发与误触发用例

## should-trigger（应激活本 skill）

1. 「给租户列表加列设置，能勾选显示哪些列」
2. 「用户管理列显示隐藏，记住用户偏好」
3. 「角色管理加 ColumnFilter 列设置按钮」
4. 「参照设备管理，列表加列设置」
5. 「表格列太多，让用户自己选显示哪些列」
6. 「新建 ColumnFilter 组件，popover 勾选列」
7. 「硬编码 el-table-column 改成动态 visibleColumns」
8. 「列设置刷新后要记住 localStorage」
9. 「租户表默认隐藏联系人和创建时间」

## should-not-trigger（不应激活本 skill）

| 用户说法 | 应路由到 |
|----------|----------|
| 操作列折叠到更多、OperationColumn | `组件-操作列折叠` |
| 列表缩放后分页被裁切 | `layout-fixedHeadTail-adaptiveMiddle` |
| 全项目 i18n 迁移 | `i18n-server` |
| 仅改列宽、列排序 | 不触发（非显示/隐藏） |
| 报表多级表头 | 不触发 |

## 期望产物关键词

- `ColumnFilter`、`buildTableColumns`、`visibleColumns`、`selectedColumns`
- `localStorage`、`required`、`visible: false`
- `template/mvp`（新增）、`template/before|after`（应用）
- `column-filter-wrap`、`v-hasPerm` 包 span

## 路由期望

| 输入特征 | 应进入 |
|----------|--------|
| 无 ColumnFilter.vue | 新增-组件列设置 |
| 有组件、表静态列 | 应用-列设置 |
| 新仓库全流程 | 先新增 → 再应用 |
