---
name: 组件-列设置
description: 当列表需「列设置」按钮、列显示/隐藏、localStorage 记忆，或硬编码 el-table-column 需改为 visibleColumns 动态渲染时使用；先判定新增 ColumnFilter 或页面应用。
---

# 组件-列设置

列表 **列显示/隐藏**：`ColumnFilter` + `buildTableColumns` + `visibleColumns` 动态列 + `localStorage` 持久化。

## 何时使用

- 工具栏需要「列设置」按钮（popover 勾选、重置、记忆）
- 表格列硬编码，需改为 `v-for="column in visibleColumns"`
- 参照设备/租户/用户/角色已接入形态扩展新列表页

## 何时不要使用

- 操作列折叠到「更多」→ [`组件-操作列折叠`](../组件-操作列折叠/SKILL.md)
- 列表高度、分页裁切、表格内部滚动 → `layout-fixedHeadTail-adaptiveMiddle`
- 全量 i18n 迁移 → `i18n-server`（本 skill 仅要求 `buildTableColumns` 内 `t()` 抽取）

## RED：失败基线（先判定再改码）

1. 是否存在 `src/components/ColumnFilter/ColumnFilter.vue`
2. 目标表是否仍为静态 `el-table-column` 列表
3. 工具栏是否缺 `ColumnFilter`（`v-hasPerm` 须包原生 `<span>`，勿挂组件根）
4. 是否缺 `buildTableColumns` / `selectedColumns` / `visibleColumns` / `localStorage`

对照样本：

- 组件：[`template/mvp/src/components/ColumnFilter/`](template/mvp/src/components/ColumnFilter/)
- 设备页闭环：[`template/snapshot/`](template/snapshot/src/views/deviceManage/device/)
- 业务页：**租户** / **用户** / **角色** `before|after`

## 路由表（必先执行）

| 场景 | 判定信号 | 委派子 skill |
|------|----------|--------------|
| **新增** | 无 `ColumnFilter.vue` | [`feature-skills/新增-组件列设置/SKILL.md`](feature-skills/新增-组件列设置/SKILL.md) |
| **应用** | 组件已有，目标表未动态化 | [`feature-skills/应用-列设置/SKILL.md`](feature-skills/应用-列设置/SKILL.md) |
| **组合** | 新仓库 / 新模块 | **先新增 → 再应用** |

判定口诀：**没有 ColumnFilter 就先新增；有 ColumnFilter 但表上还是静态列就应用。**

## 🔴 CHECKPOINT · 🛑 STOP（路由后、改码前）

在委派子 skill **之前**，若出现以下任一情况 **必须暂停**，不得直接改码：

| 触发条件 | 必须动作 | 仍无法判定 |
|----------|----------|------------|
| 无法判断新增 vs 应用 | 问：是否已有 `ColumnFilter.vue`？表是否仍为静态 `el-table-column`？ | 读 [`template/mvp`](template/mvp/) 与 [`template/before`](template/before/) 对比 |
| 不确定页面形态 A/B/C/D | 读 [`page-layout-patterns.md`](references/page-layout-patterns.md) 选型表 | 问用户：工具栏与表格是否同文件？是否有独立 SearchBar？ |
| 用户未给默认隐藏列 | 读 [`localStorage-keys.md`](references/localStorage-keys.md) 已有模块默认值 | 问用户确认默认显示/隐藏列 |
| 需求含「操作列折叠/更多」 | **停止**，路由 [`组件-操作列折叠`](../组件-操作列折叠/SKILL.md) | — |

## 页面形态速查

| 形态 | 代表页 | 列状态位置 | ColumnFilter 落点 | 样本 |
|------|--------|------------|-------------------|------|
| A 内联工具栏 | 设备管理 | 同文件 `index.vue` | `action-buttons` 内 | snapshot fragment |
| B 分页+子表 | 租户管理 | 父页 `index.vue` | `BaseListToolbar` `#actions` | tenant before/after |
| C 搜索栏插槽 | 用户管理 | 父页 `index.vue` | `UserSearchBar` `#actions-extra` | user before/after |
| D 表组件自闭环 | 角色管理 | `RoleListTable.vue` | 同组件 `#actions` | role before/after |

详见 [`references/page-layout-patterns.md`](references/page-layout-patterns.md)。

## 失败 fallback（路由/执行层）

| 症状 | 一线修复 | 仍失败兜底 |
|------|----------|------------|
| `ColumnFilter` 找不到 / 未注册 | 确认 `src/components/ColumnFilter/ColumnFilter.vue` 存在；补显式 import 或 unplugin 配置 | 回到 **新增-组件列设置** |
| 有按钮但勾选列表格不变 | 查表是否仍为静态列；补 `visibleColumns` + `v-for` | 对照 [`template/after`](template/after/) 同模块 |
| `v-hasPerm` 列设置不显示 | 权限包原生 `<span>`，勿挂 ColumnFilter 根（§ [`anti-patterns.md`](references/anti-patterns.md) §1） | 用户模块改用 `v-if="toolbarPerms.query"` |
| 刷新后列全消失 | `initSelectedColumns` 对 localStorage 做 `validProps` 交集过滤 | 清 `{module}_manage_table_columns` 键重试 |
| 形态 C 但 SearchBar 无插槽 | 在 SearchBar `#actions` 末尾加 `<slot name="actions-extra" />` | 勿把 `#actions-extra` 抄到 BaseListToolbar |

## GREEN / REFACTOR（父级职责）

父级 **不**展开逐步改码，只委派子 skill。验收：

1. 有 query 权限时出现「列设置」；无权限不显示
2. `required` 列（选择、操作）popover 内 disabled，表格始终显示
3. 勾选/取消列即时生效；「重置」恢复默认列组合
4. 刷新后 `localStorage` 恢复偏好；非法缓存有交集过滤兜底
5. 原列 slot（状态 tag、`OperationColumn` 等）逻辑不变
6. linter 无新增错误

## 使用示例

```text
使用 $组件-列设置 给租户列表加列设置，默认隐藏联系人和创建时间。
```

```text
用户管理已有 ColumnFilter 组件，按 user before/after 样本接入列设置。
```

## 延伸阅读

- 新增：[`feature-skills/新增-组件列设置/SKILL.md`](feature-skills/新增-组件列设置/SKILL.md)
- 应用：[`feature-skills/应用-列设置/SKILL.md`](feature-skills/应用-列设置/SKILL.md)
- [`references/column-config-api.md`](references/column-config-api.md)
- Few-shot：[`assets/few-shot-example/`](assets/few-shot-example/)
- 试跑：[`test-prompts.json`](test-prompts.json)
