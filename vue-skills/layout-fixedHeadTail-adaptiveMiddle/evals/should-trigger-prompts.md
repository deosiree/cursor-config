# 触发与误触发用例

## should-trigger（应激活本 skill）

1. 「列表页放大后分页被挡住，表格要内部滚动」
2. 「el-table 写了 max-height 100% 但不生效」
3. 「固定工具栏和分页，中间表格自适应高度」
4. 「角色管理缩放后显示不全，分页看不到」
5. 「动态计算表格高度，固定首尾中间自适应」
6. 「租户列表 TenantTable 在子组件、分页在 index，缩放后分页看不见」（形态 B）

## should-not-trigger（不应激活本 skill）

| 用户说法 | 应路由到 |
|----------|----------|
| PageTabShell 抽壳、Tab 内容区高度 | `extract-shell` |
| 弹窗里 PermissionTree / 表单 Tab 高度 | 固定 max-height，非列表链 |
| gateway wire 与 stable 映射 | `map-wire-stable` |
| 大组件拆 composable、瘦身 | `vue3-component-slimming` |
| 仅改分页组件样式、与表格高度无关 | 不触发 |

## 期望产物关键词

激活后输出或代码改动应出现（不必全部，但核心缺一不可）：

- `useTableBodyHeight` 或等价的 `ResizeObserver` + wrapper `clientHeight`
- `el-table` 的 `:height` 数值绑定
- 列表壳 `flex-shrink: 0`（头/尾）+ `flex: 1; min-height: 0`（中）
- 父级 `min-height: 0` 高度链修补
