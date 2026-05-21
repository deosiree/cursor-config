---
name: 布局-固定首尾，中间自适应
description: 当 Vue 列表页需要固定顶部工具栏与底部分页、中间 el-table 自适应并内部滚动时使用；含单组件三段式（角色）与父页分裂式（租户/用户 index+Table）。缩放后分页被裁切、max-height 100% 无效、calc(100%-106px) 魔法数时触发。
---

# 布局-固定首尾，中间自适应

**首尾**：**首** = 顶部固定区（工具栏、搜索栏等）；**尾** = 底部固定区（分页等）；中间表格区自适应并滚动。勿与「收尾」（仅指末端）混淆。

## 何时使用

- 列表页结构为：**工具栏（头） + el-table（中） + Pagination（尾）**。
- 浏览器放大比例后，**分页被挤出视口**或只能滚动整页。
- `el-table` 写了 `style="max-height: 100%"` 但 **tbody 仍不出现内部滚动条**。
- 页面使用 `height: 100%` 链，但中间区域无法收缩。

## 何时不要使用

- 多 Tab 列表且已由 `PageTabShell` 提供 `contentHeight` → 用 `extract-shell` + 菜单页 `:height` 模式。
- 弹窗内 Tab、树、表单区 → 固定 `max-height` 即可。
- 非 `el-table` 的中间区 → 另选方案。

## 布局形态判定（必先执行）

在 GREEN 之前，先判断当前页面属于哪种结构，**不要默认照搬角色管理单文件改法**。

| 形态 | 结构特征 | 典型页面 | 主要改哪些文件 |
|------|----------|----------|----------------|
| **A 单组件三段式** | 工具栏、表格、分页在**同一个**列表组件内 | 角色 `RoleListTable.vue` | 列表组件 + 父页高度链 |
| **B 父页分裂式** | 工具栏、分页在 **`index.vue`**，子组件**只有表格** | 租户、用户 | **父 `index.vue` + 子 `*Table.vue`**（两层都要改） |

**判定口诀**：分页写在 `index.vue`、表格在 `*Table.vue` → **形态 B**。

- 形态 A 样本：`template/after/.../RoleListTable.vue`（commit `855cec2c`）
- 形态 B 说明：`references/split-layout-parent-child.md`
- 形态 B 样本：`template/before|after/src/views/tenant/`、`.../system/user/`（`index.vue` + `*Table.vue`）
- 形态 B few-shot：`assets/few-shot-example/tenant-split-layout-fix.md`、`user-split-layout-fix.md`

## RED：先确认失败基线

在改代码前，至少核对以下 5 项（详见 `references/anti-patterns.md`）：

1. `el-table` 是否**缺少**数值型 `height` / `max-height` **prop**？
2. `.table-wrapper` 是否缺少 `flex: 1; min-height: 0; overflow: hidden`？
3. 分页是否直接放在 flex 列末尾且**无** `flex-shrink: 0`？
4. 父级 `el-card__body` / 编排层是否缺少 `min-height: 0`？
5. 是否在用 `calc(100% - 106px)` 等魔法数（缩放/DPI 易失效）？

对照 `template/before/` 与 `template/after/`（形态 A：角色 `855cec2c`；形态 B：租户列表落地样本）。

## GREEN：标准落地流程

### 0. 按形态分支

- **形态 A**：执行步骤 1 → 2A → 3 → 4
- **形态 B**：执行步骤 1 → 2B → 3 → 4（子组件仍用 `useTableBodyHeight`，但父页必须分配中间区高度）

### 1. 父级 flex 高度链（A/B 共用）

从 `app-container` → `el-card__body` → 业务编排层（如 `.role-index`、`.bottom-container`）逐层保证：

- `height: 100%`（或 `flex: 1` 占满）
- `min-height: 0`（允许子项在 flex 中收缩）
- 需要时 `overflow: hidden`（避免整页被内容撑开）

参考：`template/after/src/views/system/role/index.vue`。

### 2A. 形态 A — 列表壳三段式（头-中-尾）

在**同一列表组件**根节点使用纵向 flex：

| 区域 | 类名示例 | 样式要点 |
|------|----------|----------|
| 头（工具栏） | `.data-table__toolbar` | `flex-shrink: 0` |
| 中（表格容器） | `.table-wrapper` | `flex: 1; min-height: 0; overflow: hidden`，并加 `ref` |
| 尾（分页） | `.list-shell__pagination` | `flex-shrink: 0`，分页外包一层 div |

根节点（如 `.list-shell`）：`height: 100%; min-height: 0; overflow: hidden`。

参考：`template/after/src/views/system/role/components/role/RoleListTable.vue`。

### 2B. 形态 B — 父页分裂式（头-中-尾拆在两文件）

**父页 `index.vue`：**

| 区域 | 位置 | 样式要点 |
|------|------|----------|
| 头 | `BaseListToolbar` / `UserSearchBar` | `flex-shrink: 0` |
| 中 | 包裹 `TenantTable` / `UserTable` 的容器（如 `.list-page__body`） | `flex: 1; min-height: 0; overflow: hidden` |
| 尾 | `Pagination` 外包 `.list-page__pagination` | `flex-shrink: 0` |

**子组件 `*Table.vue`：** 根节点 `height: 100%; min-height: 0`，内部 `.table-wrapper` + `useTableBodyHeight`（见步骤 3、4）。**删除** `calc(100% - 106px)`。

详见 `references/split-layout-parent-child.md`。

### 3. 动态表格高度 composable

新增或复用 `src/composables/useTableBodyHeight.ts`：

- `ResizeObserver` 监听 `.table-wrapper` 的 `clientHeight`
- 不支持时降级 `window.resize`
- 返回 `tableBodyHeight = Math.max(measured, minHeight)`

在 `src/composables/index.ts` 导出。

参考：`template/after/src/composables/useTableBodyHeight.ts`。

### 4. 绑定 el-table

```vue
<div ref="tableWrapperRef" class="table-wrapper">
  <el-table :height="tableBodyHeight" ... />
</div>
```

```ts
const tableWrapperRef = ref<HTMLElement | null>(null);
const { tableBodyHeight } = useTableBodyHeight(tableWrapperRef);
```

- **必须**使用 prop `:height`（或 `:max-height` 数值），不要仅依赖 CSS `max-height: 100%`。
- 删除无效的 `style="max-height: 100%"`。

原理说明见 `references/element-plus-table-height.md`。

## REFACTOR：边界收敛

| 场景 | 处理 |
|------|------|
| 无分页 | 省略尾区，中间仍 `flex:1` + 动态高度 |
| 搜索区很高 | 搜索区也算「头」，一并 `flex-shrink: 0` |
| 分页 `v-if` 显隐 | `ResizeObserver` 会自动重算；必要时 `syncHeight()` |
| 已有 `PageTabShell` | 优先消费 `contentHeight`，勿重复造轮子 |

## 验收清单

1. 浏览器缩放 **100% / 125% / 150%**：底部分页完整可见。
2. 数据行超出可视区：`el-table` **tbody 纵向滚动**，表头固定。
3. 拖拽改变窗口高度：表格高度随动，分页仍贴底。
4. 切换 `pageSize`：布局不抖动，分页不被遮挡。
5. 相关文件 linter 无新增错误。

## 使用示例

```text
使用 $布局-固定首尾中间自适应 修复当前列表页：
固定工具栏和分页，中间 el-table 自适应高度并出现内部滚动条。
参考角色管理 commit 855cec2c 的改法。
```

## 延伸阅读

- 形态 B 分裂布局：`references/split-layout-parent-child.md`
- 高度链检查：`references/flex-height-chain.md`
- Element Plus 表格高度：`references/element-plus-table-height.md`
- 反模式：`references/anti-patterns.md`
- 真实 before/after：`template/before/`、`template/after/`
- few-shot 形态 A：`assets/few-shot-example/role-list-height-fix-855cec2c.md`
- few-shot 形态 B（反例说明）：`assets/few-shot-example/tenant-split-layout-antipattern.md`
- few-shot 形态 B（租户落地）：`assets/few-shot-example/tenant-split-layout-fix.md`
- few-shot 形态 B（用户落地）：`assets/few-shot-example/user-split-layout-fix.md`
- Darwin 测试 prompt：`test-prompts.json`
