# full_test：用户管理 pagePerms 改码（2026-07-04）

> Darwin dim8 实测记录。Prompt：「按集中式原则改 apex_dev 用户管理：userPagePerms 静态预算，类型放 user.models.ts，子组件收 :perms，去掉 OpItem :perm。」

## 改前（RED）

| 问题 | 证据 |
|------|------|
| 行内 OpItem 7 处 `:perm` 字符串 | `UserTable.vue` 每行 onBeforeMount 二次 `checkHasPerm` |
| 仅 toolbar 3 字段 budget | `toolbarPerms` 缺 edit/lock/unlock 等 |
| API 守卫不完整 | 行操作 handler 无 perm 入口守卫 |
| 类型在组件内 export | `UserPagePerms` 曾定义于 `UserTable.vue` |

## 改后（GREEN）

| 文件 | 改动 |
|------|------|
| `user.models.ts` | `UserPagePerms` + `DEFAULT_USER_PAGE_PERMS` + `UserToolbarPerms` |
| `index.vue` | `userPagePerms` 8 字段单 computed；`:perms` 下传；API 守卫 |
| `UserTable.vue` | `v-if="perms.xxx"`；无 `:perm` |
| `UserSearchBar.vue` | `UserToolbarPerms` 从 models import |

## 验证

| 项 | 结果 |
|----|------|
| TypeScript / linter | ✅ 无报错 |
| `pnpm run build` | ⚠️ 既有 tenant 测试 TS 错误，用户模块无新增报错 |
| skill 口径对齐 after-04 | ✅ 模式 S + models 约定 |

## dim8 对比（with skill vs without）

| 维度 | 带 skill（gen-perms-apis after-04） | 不带 skill（基线 agent） |
|------|-------------------------------------|--------------------------|
| 是否建 xxxPagePerms | ✅ 8 字段 computed | ⚠️ 可能只改 toolbar 或保留 OpItem :perm |
| 类型位置 | ✅ `user.models.ts` | ❌ 常在组件内 export |
| OpItem 处理 | ✅ 去掉 :perm，外层 v-if | ❌ 常保留 perm 字符串 |
| API 守卫 | ✅ 各 handler 读 userPagePerms | ⚠️ 仅 UI 层 |
| 子组件 props | ✅ boolean `:perms` | ⚠️ actionPerms 字符串 |

**dim8 估分**：8/10（结构正确；缺浏览器实跑 E2E）

## 结论

full_test **PASS** — pagePerms 模式可从 tenant 复制到 user；类型下沉 models + `:perms` prop 为现行规范。
