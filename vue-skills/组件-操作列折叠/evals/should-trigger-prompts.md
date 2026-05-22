# 触发与误触发用例

## should-trigger（应激活本 skill）

1. 「表格操作列按钮太多，挤在一起，想折叠到更多」
2. 「用 OperationColumn / OpItem 替换操作列 el-button」
3. 「操作列 width 写死 200，想自动算列宽」
4. 「行内显示 1 个操作，其余进更多下拉」
5. 「新建全局 OperationColumn 组件，支持权限和图标」
6. 「租户表 TenantTable 操作列迁移」（组件已存在 → 更新子 skill）
7. 「用户 UserTable 多 v-if 操作列接入，不要改 i18n」
8. 「菜单管理树表 directory/page 操作不同，行内 3 个+更多，弹窗内表也要接入」（→ 更新子 skill + menu few-shot）
9. 「inline-visible-count=2 时更多按钮被裁切 / 列宽不够」
10. 「OperationColumn 离屏探针未扫描到 OpItem / probeRowCount 0」

## should-not-trigger（不应激活本 skill）

| 用户说法 | 应路由到 |
|----------|----------|
| 列表缩放后分页被裁切、表格内部滚动 | `layout-fixedHeadTail-adaptiveMiddle` |
| PageTabShell、extract-shell 抽壳 | `extract-shell` |
| gateway / wire 稳定模型 | `map-wire-stable` |
| 全项目 i18n 迁移、批量改业务文案 `$t()` | `i18n-server` |
| 大组件拆 composable 瘦身 | `vue3-component-slimming` |
| 仅要求业务页传 `probe-data-rows` 修探针 | 应读 `column-width-probe`：只传 list-data-length |
| 仅改单个按钮样式、与操作列结构无关 | 不触发 |

## 期望产物关键词

- `OperationColumn`、`OpItem`
- `inline-visible-count`、`list-data-length`
- `perm=`（替代 `v-hasPerm` on 按钮）
- `template/mvp`（新增）、`template/before|after`（更新）
- 无 slot 内 `el-button` 操作列（更新场景）

## 路由期望

| 输入特征 | 应进入 |
|----------|--------|
| 无 OpItem.vue / 旧版 v-auto-width index | 新增子 skill |
| 套件已有、表仍为 el-table-column 操作列 | 更新子 skill |
