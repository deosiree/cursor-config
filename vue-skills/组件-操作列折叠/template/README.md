# template 说明

按**功能**组织的可复制样本，agent 执行时只读本目录，无需对照仓库其他路径。

## mvp/（新增套件）

从 [`mvp/src/components/OperationColumn/`](mvp/src/components/OperationColumn/) 拷贝五件套到目标仓库。

| 路径 | 说明 |
|------|------|
| `mvp/src/components/OperationColumn/` | 列壳、OpItem、溢出、列宽（含 inject 探针） |
| `mvp/src/directive/permission/index.ts` | `checkHasPerm`（项目有权限体系时） |
| `mvp/src/i18n/locales/*.json` | **可选**，见 [`../references/optional-i18n.md`](../references/optional-i18n.md) |

## before/ 与 after/（页面接入）

| 样本 | 场景 | before | after |
|------|------|--------|-------|
| **租户** | `$t` 文案、固定 `width`、多 `el-button` | [`before/.../tenant/TenantTable.vue`](before/src/views/tenant/components/TenantTable.vue) | [`after/.../tenant/TenantTable.vue`](after/src/views/tenant/components/TenantTable.vue) |
| **用户** | 硬编码中文、多 `v-if` | [`before/.../user/UserTable.vue`](before/src/views/system/user/components/UserTable.vue) | [`after/.../user/UserTable.vue`](after/src/views/system/user/components/UserTable.vue) |
| **菜单** | 树表、`row.type` 多 `v-if`、Tab 子集 | 对照租户/用户 before 同构 | [`after/.../menu/*.fragment.vue`](after/src/views/system/menu/menu-index-operation-column.fragment.vue) |

Few-shot：[`../assets/few-shot-example/tenant-table-replace.md`](../assets/few-shot-example/tenant-table-replace.md)、[`user-table-replace.md`](../assets/few-shot-example/user-table-replace.md)、[`menu-table-replace.md`](../assets/few-shot-example/menu-table-replace.md)

## 阅读顺序

1. `mvp/` — 理解组件 API 与探针
2. `before/tenant` vs `after/tenant` — 页面迁移对照
3. `before/user` vs `after/user` — 跨表迁移练习
4. `after/menu/*.fragment.vue` — 树表 + 弹窗内表操作列片段

## 与 feature-skills 对应

| 模板 | 子 skill |
|------|----------|
| `mvp/` | `feature-skills/新增-OperationColumn溢出套件/` |
| `before/`、`after/` | `feature-skills/更新-页面接入OperationColumn/` |
