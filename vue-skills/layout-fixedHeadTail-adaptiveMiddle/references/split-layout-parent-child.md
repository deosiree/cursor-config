# 形态 B：父页分裂式布局

nebula 中除角色管理外，大量列表页采用 **父页编排 + 子组件仅表格** 的结构。只改子组件上的 `calc(100% - 106px)` **不足以**固定分页，必须同时改父页 flex 链。

## 结构示意

```text
el-card__body (flex column)
├── BaseListToolbar / UserSearchBar   ← 头（在父页）
├── TenantTable / UserTable           ← 中（子组件，仅 table-wrapper）
└── Pagination                        ← 尾（在父页）
```

对比 **形态 A（单组件三段式）**：

```text
RoleListTable (flex column)
├── toolbar
├── table-wrapper + el-table
└── pagination
```

## 父页必须满足

在 `views/**/index.vue`（或等价页面入口）：

1. `.bottom-container`（或卡片内容根）：
   - `display: flex; flex-direction: column`
   - `height: 100%`
   - **`min-height: 0`**
2. `el-card__body`（`:deep`）：
   - `height: 100%`
   - `flex column` + `overflow: hidden`
3. 头区（`BaseListToolbar`、`UserSearchBar` 等）：`flex-shrink: 0`
4. 尾区（`Pagination`）：外包一层 div，`flex-shrink: 0`
5. **中间子组件容器**：`flex: 1; min-height: 0; overflow: hidden`（若子组件根未占满，给子组件外包一层 `.list-shell__body`）

## 子组件（表格）必须满足

在 `TenantTable.vue` / `UserTable.vue` 等：

1. 根节点：`height: 100%; min-height: 0`（占满父页分配的中间区）
2. **删除** `height: calc(100% - 106px)` 等魔法数
3. `.table-wrapper`：`flex: 1; min-height: 0; overflow: hidden` + `ref`
4. `el-table`：`:height="tableBodyHeight"` + `useTableBodyHeight(tableWrapperRef)`
5. **删除** `style="max-height: 100%"`

## 仓库落点对照

| 页面 | 父页 | 子组件 | 当前反模式 |
|------|------|--------|------------|
| 租户管理 | `views/tenant/index.vue` | `components/TenantTable.vue` | 父缺 `min-height:0`；子用 `calc(100%-106px)` |
| 用户管理 | `views/system/user/index.vue` | `components/UserTable.vue` | 同上 |
| 角色管理 | `views/system/role/index.vue` | `components/role/RoleListTable.vue` | 已改为形态 A（三段在同一组件） |

## 常见误修

| 误修 | 后果 |
|------|------|
| 只改子组件 `calc` 为更大魔法数 | 缩放仍失效 |
| 只在子组件加 `:height` 但父页未 `min-height:0` | wrapper 测得高度为 0 或整页仍溢出 |
| 把 Pagination 放进子组件却不改父页 | 父页仍缺尾区 `flex-shrink:0` |

## 形态 B 最小改法清单

- [ ] 父 `index.vue`：`.bottom-container` 加 `min-height: 0`
- [ ] 父 `index.vue`：Pagination 外包 `flex-shrink: 0` 容器
- [ ] 父 `index.vue`：表格子组件所在层 `flex: 1; min-height: 0`
- [ ] 子 `*Table.vue`：去掉 `calc`，接入 `useTableBodyHeight`
- [ ] 子 `*Table.vue`：`el-table` 使用 `:height` prop
