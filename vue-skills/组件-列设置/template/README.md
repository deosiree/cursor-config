# template 说明

按**功能**组织的可复制样本，agent 执行时只读本目录，无需对照仓库其他路径。

**真相源**：`apex_dev/src/components/ColumnFilter` 及已接入业务页。

## mvp/（新增组件）

从 [`mvp/src/components/ColumnFilter/`](mvp/src/components/ColumnFilter/) 拷贝到目标仓库。

| 路径 | 说明 |
|------|------|
| `mvp/src/components/ColumnFilter/ColumnFilter.vue` | popover 勾选、重置、`v-model` |
| `mvp/src/i18n/locales/*.column-filter.fragment.json` | 组件三条 i18n key（可选合并到项目 locale） |

来源 commit：`a5b3214`（`feat(components): 设备管理添加列设置功能`）。

维护组件时：**先改 apex_dev，再同步覆盖本目录 mvp**。

## snapshot/（设备页闭环参考）

设备 `index.vue` 体量大，snapshot 用 **fragment** 而非整文件：

| 文件 | 说明 |
|------|------|
| `column-settings-toolbar.fragment.vue` | 工具栏 `ColumnFilter` + `v-hasPerm` 包裹 |
| `column-settings-script.fragment.ts` | `buildTableColumns`、`visibleColumns`、`localStorage` |

来源：当前 HEAD `device/index.vue`。

## before/ 与 after/（页面应用）

| 样本 | 形态 | before | after | 默认隐藏列 |
|------|------|--------|-------|------------|
| **租户** | B 分页+子表 | `tenant/index.vue` + `TenantTable.vue` | 同上 | 联系人、创建时间 |
| **用户** | C 搜索栏插槽 | `user/index.vue` + `UserTable.vue` + `UserSearchBar.vue` | 同上 | 创建时间 |
| **角色** | D 表组件自闭环 | `role/RoleListTable.vue` | 同上 | 无 |

### 提取命令

```bash
# 在 apex_dev 根目录执行

# before（HEAD = 接入列设置前）
git show HEAD:src/views/tenant/components/TenantTable.vue > template/before/.../TenantTable.vue

# after（工作区成品）
cp src/views/tenant/components/TenantTable.vue template/after/.../TenantTable.vue
```

若 after 已提交，before 改为该提交 `commit^`，after 改为该提交本身。

Few-shot：[`../assets/few-shot-example/`](../assets/few-shot-example/)

## 阅读顺序

1. `mvp/` — ColumnFilter API
2. `snapshot/` — 设备页最小闭环（同文件工具栏+表）
3. `before/tenant` vs `after/tenant` — 分页+子表形态
4. `before/user` vs `after/user` — 搜索栏 `#actions-extra` 插槽
5. `before/role` vs `after/role` — 表组件自闭环

## 与 feature-skills 对应

| 模板 | 子 skill |
|------|----------|
| `mvp/`、`snapshot/` | `feature-skills/新增-组件列设置/` |
| `before/`、`after/` | `feature-skills/应用-列设置/` |
