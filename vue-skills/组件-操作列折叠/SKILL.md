---
name: 组件-操作列折叠
description: 当表格操作列需折叠到「更多」、列宽自适应，或用 OperationColumn+OpItem 替换 el-button 时使用；探针由 inject(ElTable) 读表数据，业务只传 list-data-length；先判定新增套件或页面接入。
---

# 组件-操作列折叠

列表 **操作列**：行内槽位 +「更多」溢出；列宽由离屏探针与 `calcOpStrip` 估宽，业务用 **`OpItem`** 声明操作。

## 何时使用

- 操作列 `width="200"` 等魔法数，多按钮挤版或留白过大
- 需要「1 行内 + 更多」→ 通常 `:inline-visible-count="2"`（槽位语义见 [`references/slot-semantics.md`](references/slot-semantics.md)）
- 要把 `el-table-column` + `el-button` 换成 `OperationColumn` + `OpItem`
- 仓库尚无溢出套件（`OpItem` / `OperationCellOverflow`）

## 何时不要使用

- 列表 **高度**、分页裁切、表格内部滚动 → [`layout-fixedHeadTail-adaptiveMiddle`](../layout-fixedHeadTail-adaptiveMiddle/SKILL.md)
- 多 Tab + `PageTabShell` 壳 → [`extract-shell`](../extract-shell/SKILL.md)
- 全量 i18n 迁移 → `i18n-server`（本 skill **不**顺带改业务文案 i18n）

## RED：失败基线（先判定再改码）

1. 操作列是否写死 `width`
2. 是否每个操作用 `el-button` + `v-hasPerm`
3. 是否无法「行内 N 槽 + 更多」
4. 是否缺少 `OpItem.vue` / `OperationCellOverflow.vue` / `operationWidth.ts`
5. 或 `index.vue` 仍为 legacy `v-auto-width`（见 [`references/anti-patterns.md`](references/anti-patterns.md) §6）
6. 是否在业务页维护假探针行（`PROBE_ROWS`、`probe-data-rows`）
7. 是否把 `inline-visible-count` 当成「行内个数不含更多」（见 [`slot-semantics.md`](references/slot-semantics.md)）

对照样本：

- 组件：[`template/mvp/src/components/OperationColumn/`](template/mvp/src/components/OperationColumn/)
- 页面：**租户** / **用户** `before|after`；**菜单** / **角色** `after/.../*.fragment.vue`
- [`references/column-width-probe.md`](references/column-width-probe.md)、[`references/slot-semantics.md`](references/slot-semantics.md)

## 路由表（必先执行）

| 场景 | 判定信号 | 委派子 skill |
|------|----------|--------------|
| **新增** | 无 `OpItem.vue`，或 legacy `v-auto-width` / 旧 width inject | [`feature-skills/新增-OperationColumn溢出套件/SKILL.md`](feature-skills/新增-OperationColumn溢出套件/SKILL.md) |
| **更新** | 套件已存在，目标表仍为 `el-table-column` + `el-button` | [`feature-skills/更新-页面接入OperationColumn/SKILL.md`](feature-skills/更新-页面接入OperationColumn/SKILL.md) |
| **组合** | 新模块 / 新仓库 | **先新增 → 再更新** |

判定口诀：**没有 OpItem 就先新增；有 OpItem 但表上还是 el-button 就更新。**

## 检查点（改码前暂停）

| 时机 | 触发条件 | 动作 |
|------|----------|------|
| **路由歧义** | 无法判断新增 vs 更新 | 问：是否已有 `OpItem.vue`？表上是否仍为 el-button？ |
| **页面样本** | 走更新路径，表形态不明 | 对照 [`template/README.md`](template/README.md)；勿自创槽位数 |
| **槽位取值** | 不确定 `inline-visible-count` | 读 [`slot-semantics.md`](references/slot-semantics.md) 与对应 after 样本 |
| **探针兜底** | 要求 `probe-data-rows`、假行 | 不实现；见 [`column-width-probe.md`](references/column-width-probe.md) |

**页面样本速查**：

| 形态 | few-shot | after | 槽位 |
|------|----------|-------|------|
| 平表 + `$t` | tenant-table-replace | tenant/TenantTable | **6** |
| 平表 + 多 `v-if` | user-table-replace | user/UserTable | **2** |
| 树表 + Tab | menu-table-replace | menu/*.fragment | **3** / **4** |
| 角色表 | role-table-replace | role/*.fragment | **3** |

## GREEN / REFACTOR（父级职责）

父级 **不**展开逐步改码，只委派子 skill。验收：

1. 槽位语义正确：行内 +「更多」符合 [`slot-semantics.md`](references/slot-semantics.md)
2. `perm` / `v-if` 与迁移前一致
3. 列宽稳定；`status` 变更后操作列重切分（用户表启用/停用等）
4. 异步 `:data` 后自动重探针
5. slot 内无 `el-button`；仅 `list-data-length`
6. linter 无新增错误

## 使用示例

```text
使用 $组件-操作列折叠 把用户表操作列改成编辑+更多，槽位语义按 template/after/user。
```

```text
租户表 6 个操作要全行内，组件已有，请按 TenantTable after 样本设 inline-visible-count=6。
```

## 延伸阅读

- 新增：[`feature-skills/新增-OperationColumn溢出套件/SKILL.md`](feature-skills/新增-OperationColumn溢出套件/SKILL.md)
- 更新：[`feature-skills/更新-页面接入OperationColumn/SKILL.md`](feature-skills/更新-页面接入OperationColumn/SKILL.md)
- [`references/op-item-api.md`](references/op-item-api.md)
- Few-shot：[`assets/few-shot-example/`](assets/few-shot-example/)
