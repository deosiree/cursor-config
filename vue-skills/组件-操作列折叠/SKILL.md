---
name: 组件-操作列折叠
description: 当表格操作列需折叠到「更多」、列宽自适应，或用 OperationColumn+OpItem 替换 el-button 时使用；探针由 inject(ElTable) 读表数据，业务只传 list-data-length；先判定新增套件或页面接入。
---

# 组件-操作列折叠

列表 **操作列**：行内露出 N 个操作，其余收入「更多」下拉；列宽由组件离屏探针估算，业务用 **`OpItem`** 声明操作，不再堆 `el-button`。

## 何时使用

- 操作列 `width="200"` 等魔法数，多按钮挤版或留白过大
- 需要「行内 1 个 + 更多」或自定义 `inline-visible-count`
- 要把 `el-table-column` + `el-button` 换成 `OperationColumn` + `OpItem`
- 仓库尚无溢出套件（`OpItem` / `OperationCellOverflow`）

## 何时不要使用

- 列表 **高度**、分页裁切、表格内部滚动 → [`layout-fixedHeadTail-adaptiveMiddle`](../layout-fixedHeadTail-adaptiveMiddle/SKILL.md)
- 多 Tab + `PageTabShell` 壳 → [`extract-shell`](../extract-shell/SKILL.md)
- 全量 i18n 迁移、批量改 `$t()` → `i18n-server`（本 skill **不**顺带改业务文案 i18n）

## RED：失败基线（先判定再改码）

在 GREEN 之前至少核对：

1. 操作列是否写死 `width`（如 `width="200"`）
2. 是否每个操作用 `el-button` + `v-hasPerm`，icon 用内联 `div.i-svg:*`
3. 是否无法「行内 N 个 + 更多」
4. 是否缺少 `OpItem.vue` / `OperationCellOverflow.vue` / `operationWidth.ts`
5. 或 `OperationColumn/index.vue` 仍为 `v-auto-width` + `operation-buttons`（见 [`references/anti-patterns.md`](references/anti-patterns.md) §6）
6. 是否在业务页或组件内维护假探针行（`PROBE_ROWS`、`probe-rows`、`MenuType` 探针表）

对照样本：

- 组件成品：[`template/mvp/src/components/OperationColumn/`](template/mvp/src/components/OperationColumn/)
- 页面迁移：**租户** / **用户** `template/before|after` 全表对照；**菜单** `template/after/.../menu/*.fragment.vue` + [`menu-table-replace.md`](assets/few-shot-example/menu-table-replace.md)
- 反模式：[`references/anti-patterns.md`](references/anti-patterns.md)
- 列宽探针：[`references/column-width-probe.md`](references/column-width-probe.md)
- i18n 边界：[`references/optional-i18n.md`](references/optional-i18n.md)（**可选**，非主责）

## 路由表（必先执行）

| 场景 | 判定信号 | 委派子 skill |
|------|----------|--------------|
| **新增** | 无 `OpItem.vue`，或 `index.vue` 仍为 legacy `v-auto-width` | [`feature-skills/新增-OperationColumn溢出套件/SKILL.md`](feature-skills/新增-OperationColumn溢出套件/SKILL.md) |
| **更新** | 套件已存在，目标表仍为 `el-table-column` + `el-button` 操作区 | [`feature-skills/更新-页面接入OperationColumn/SKILL.md`](feature-skills/更新-页面接入OperationColumn/SKILL.md) |
| **组合** | 新模块 / 新仓库 | **先新增 → 再更新** |

判定口诀：**没有 OpItem 就先新增；有 OpItem 但表上还是 el-button 就更新。**

## 检查点（改码前暂停）

以下情况 **先向用户确认或读文档**，再委派子 skill，禁止凭猜测改码：

| 时机 | 触发条件 | 动作 |
|------|----------|------|
| **路由歧义** | 仅描述「操作列挤/想折叠」，无法判断新增 vs 更新 | 问：仓库是否已有 `OpItem.vue`？目标表是否仍为 `el-table-column` + `el-button`？ |
| **页面样本** | 走更新路径，但表形态不明（租户 / 用户 / 菜单 / 其他） | 对照 [`template/README.md`](template/README.md) 与下表选 **最接近** 的 few-shot；无匹配时 **先问** 再改，勿自创 `inline-visible-count` 或探针方案 |
| **探针兜底** | 用户要求 `probe-data-rows`、`MenuType` 假行、恢复 `PROBE_ROWS` | **不默认实现**；先读 [`column-width-probe.md`](references/column-width-probe.md)，说明业务只传 `list-data-length` |
| **i18n 扩 scope** | 要求顺带改业务文案 `$t()` / 批量 locale | **先确认**；默认仅 optional-i18n 检查，全量迁移路由 `i18n-server` |

**页面样本速查**（更新路径）：

| 形态 | few-shot | template |
|------|----------|----------|
| 平表 + `$t` | [`tenant-table-replace.md`](assets/few-shot-example/tenant-table-replace.md) | `before\|after/.../tenant/TenantTable.vue` |
| 平表 + 硬编码 + 多 `v-if` | [`user-table-replace.md`](assets/few-shot-example/user-table-replace.md) | `before\|after/.../user/UserTable.vue` |
| 树表 + `row.type` + Tab 子集 `:data` | [`menu-table-replace.md`](assets/few-shot-example/menu-table-replace.md) | `after/.../menu/*.fragment.vue` |

## GREEN / REFACTOR（父级职责）

父级 **不**展开逐步改码，只委派子 skill。子 skill 完成后按下列验收：

### 验收清单

1. 多操作行：行内 `inline-visible-count` 个外露，其余在「更多」下拉可点
2. `perm` 与迁移前 `v-hasPerm` 行为一致；`v-if` 条件操作仍生效
3. 列宽随最长探针场景稳定，无明显先宽后窄闪烁；`inline-visible-count` 为 2/3 时「更多」不被裁切
4. 异步加载表：数据到达后自动重探针，无持久「未扫描到 OpItem」误报
5. `checkHasPerm` 在新增路径已就绪（项目有权限体系时）
6. **（可选）** 仅当项目已用 vue-i18n：「更多」词条满足组件需要（见 optional-i18n）；**未**顺带做业务 i18n 迁移
7. slot 内无 `el-button` 操作项
8. 业务页**未**新增 `probe-data-rows` / 手写探针表；仅 `list-data-length` + `OpItem` slot
9. 相关文件 linter 无新增错误

## 使用示例

```text
使用 $组件-操作列折叠 把当前列表操作列改成行内1个+更多。
```

```text
仓库还没有 OpItem，请先判定走新增子 skill；已有组件则把 TenantTable 操作列换成 OpItem。
```

## 延伸阅读

- 新增落地：[`feature-skills/新增-OperationColumn溢出套件/SKILL.md`](feature-skills/新增-OperationColumn溢出套件/SKILL.md)
- 页面迁移：[`feature-skills/更新-页面接入OperationColumn/SKILL.md`](feature-skills/更新-页面接入OperationColumn/SKILL.md)
- [`references/op-item-api.md`](references/op-item-api.md)
- [`references/column-width-probe.md`](references/column-width-probe.md)
- Few-shot：[`operation-column-mvp.md`](assets/few-shot-example/operation-column-mvp.md)、[`tenant-table-replace.md`](assets/few-shot-example/tenant-table-replace.md)、[`user-table-replace.md`](assets/few-shot-example/user-table-replace.md)、[`menu-table-replace.md`](assets/few-shot-example/menu-table-replace.md)
- 模板索引：[`template/README.md`](template/README.md)
- 触发边界：[`evals/should-trigger-prompts.md`](evals/should-trigger-prompts.md)
