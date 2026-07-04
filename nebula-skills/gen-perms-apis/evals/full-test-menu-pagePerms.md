# full_test：菜单管理 pagePerms 改码（2026-07-04）

> Darwin dim8 实测记录。Prompt：「full_test一下，优化菜单管理」→ 延伸「菜单模态框 pagePerms」

## 改前（RED）

| 问题 | 证据 |
|------|------|
| 工具栏 7+ 处 `v-hasPerm` | `MenuToolbar.vue` actions 区 |
| 行内 OpItem `:perm` 字符串 | `MenuTreeTable.vue` + `getMenuRowActions(row, checkHasPerm)` |
| Tab 行操作二次鉴权 | `MenuTabActions.vue` 传 `checkHasPerm` |
| 无 pagePerms 静态预算 | `index.vue` 仅 `canQuery` + 模板散落 `checkHasPerm('sys:menu:add')` |
| 模态框鉴权断链 | `PermissionConfigDialog` / `ApiConfigDialog` / `ApiWhitelistDialog` 独立 `v-hasPerm` + OpItem `:perm`，K 行 × 3 ≈ 3K 次重复 |
| 缺 configApi 字段 | `menu.models.ts` 仅 7 字段，子弹窗用第 8 个 perm 未预算 |

## 改后（GREEN）

| 文件 | 改动 |
|------|------|
| `menu.models.ts` | `MenuPagePerms` 8 字段（+configApi）；Dialog Pick 子类型 |
| `index.vue` | `menuPagePerms` 单 computed；`:perms` 下传至三个 Dialog |
| `MenuToolbar.vue` | `v-if="perms?.xxx"` |
| `MenuTreeTable.vue` / `MenuTabActions.vue` | boolean perms；无 OpItem `:perm` |
| `PermissionConfigDialog.vue` | `:perms` + v-if + handler 守卫 → 下传 `ApiConfigDialog` |
| `ApiConfigDialog.vue` | `:perms` + v-if + handler 守卫 |
| `ApiWhitelistDialog.vue` | `:perms` + v-if + handler 守卫 |
| `utils/menu-row-actions.ts` | boolean filter |

## 验证

| 项 | 结果 |
|----|------|
| `menu-row-actions.test.ts` | ✅ 11/11 pass |
| grep `v-hasPerm` / OpItem `:perm` in menu/ | ✅ 零残留 |
| TypeScript / linter | ✅ 无报错 |
| skill 口径对齐 after-04 | ✅ 模式 S + 模态框延伸 |

## dim8 对比（with skill vs without）

| 维度 | 带 skill | 不带 skill（基线 agent） |
|------|----------|--------------------------|
| pagePerms 字段 | ✅ 8 字段含 configApi | ⚠️ 可能只 7 字段或弹窗独立鉴权 |
| 模态框链 | ✅ index → Dialog → 嵌套 Dialog 全 `:perms` | ❌ 弹窗保留 v-hasPerm + OpItem 行级倍增 |
| Pinia 方案 | ✅ 不引入；props 下传足够 | ⚠️ 可能过度设计全局 store |
| models 位置 | ✅ `menu.models.ts` + Pick 子类型 | ❌ 常在组件内 |

**dim8 估分**：9/10（主链 + 模态框链贯通；缺浏览器 E2E）

## 结论

full_test **PASS** — 菜单管理 pagePerms 覆盖本路由域全部 UI 控点（含嵌套模态框）；与 user/tenant 形成一致范式。
