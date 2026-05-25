# template 说明

按**功能**组织的可复制样本，agent 执行时只读本目录，无需对照仓库其他路径。

**真相源**：`apex_dev/src/components/OperationColumn` 及已接入业务页（对齐 commit `5cc2e143`）。

## mvp/（新增套件）

从 [`mvp/src/components/OperationColumn/`](mvp/src/components/OperationColumn/) 拷贝五件套 + 单测到目标仓库。

| 路径 | 说明 |
|------|------|
| `mvp/src/components/OperationColumn/` | 列壳、OpItem、溢出、列宽（`calcOpStrip`、`mkWidthCoord`） |
| `mvp/src/components/OperationColumn/__tests__/` | `operationWidth.test.ts`、`operationColumnDomProbe.test.ts` |
| `mvp/src/directive/permission/index.ts` | `checkHasPerm`（项目有权限体系时） |
| `mvp/src/i18n/locales/*.json` | **可选**，见 [`../references/optional-i18n.md`](../references/optional-i18n.md) |

维护组件实现时：**先改 apex_dev，再同步覆盖本目录 mvp**。

单测（在 apex_dev 根目录）：

```bash
npm run test:unit -- src/components/OperationColumn/__tests__/operationWidth.test.ts
```

## before/ 与 after/（页面接入）

| 样本 | 场景 | before | after | `inline-visible-count` |
|------|------|--------|-------|------------------------|
| **租户** | `$t` 文案、固定 `width`、多 `el-button` | [`before/.../tenant/TenantTable.vue`](before/src/views/tenant/components/TenantTable.vue) | [`after/.../tenant/TenantTable.vue`](after/src/views/tenant/components/TenantTable.vue) | **6** |
| **用户** | 硬编码中文、多 `v-if` | [`before/.../user/UserTable.vue`](before/src/views/system/user/components/UserTable.vue) | [`after/.../user/UserTable.vue`](after/src/views/system/user/components/UserTable.vue) | **2** |
| **菜单主表** | 树表、`row.type` 多 `v-if`、Tab 子集 | 对照租户/用户 before 同构 | [`after/.../menu/menu-index-operation-column.fragment.vue`](after/src/views/system/menu/menu-index-operation-column.fragment.vue) | **3** |
| **菜单弹窗** | 权限表 + API 表 | — | [`after/.../menu/dialog-tables-operation-column.fragment.vue`](after/src/views/system/menu/dialog-tables-operation-column.fragment.vue) | 权限 **3**、API **4** |
| **角色** | 平表、少量操作 | — | [`after/.../role/role-list-operation-column.fragment.vue`](after/src/views/system/role/role-list-operation-column.fragment.vue) | **3** |

槽位语义见 [`../references/slot-semantics.md`](../references/slot-semantics.md)。

Few-shot：[`../assets/few-shot-example/`](../assets/few-shot-example/)

## 阅读顺序

1. `mvp/` — 组件 API、探针、`calcOpStrip`
2. `before/tenant` vs `after/tenant` — 页面迁移对照
3. `before/user` vs `after/user` — 多 `v-if` + `status` 探针
4. `after/menu/*.fragment.vue` — 树表 + 弹窗内表
5. `after/role/*.fragment.vue` — 角色表

## 与 feature-skills 对应

| 模板 | 子 skill |
|------|----------|
| `mvp/` | `feature-skills/新增-OperationColumn溢出套件/` |
| `before/`、`after/` | `feature-skills/更新-页面接入OperationColumn/` |
