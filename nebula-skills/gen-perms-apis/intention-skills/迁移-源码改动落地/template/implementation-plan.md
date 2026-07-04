# 迁移-源码改动落地 — 实施计划模板

## 实施目标

- `implementationGoal`
- `designBasis`（引用权限设计方案）
- `targetRepo`

## 改动原则确认

- [ ] 复杂页：单一 `xxxPagePerms` computed + boolean props
- [ ] 简单页：仍可用 `v-hasPerm`（≤2 控点、无行内 OpItem）
- [ ] 禁止 OpItem `:perm` 二次鉴权
- [ ] API 入口读 `xxxPagePerms.value.xxx`
- [ ] `XxxPagePerms` 在 `{module}.models.ts`
- [ ] 子组件 prop 名为 `perms`

## 逐模块改动计划

| 模块 | 文件 | 改动类型 | 改动说明 |
|------|------|---------|---------|
| 首页 | src/views/dashboard/index.vue | pagePerms + v-if | `dashboardPagePerms` + 顶层 v-if |
| 租户 | src/views/tenant/tenant.models.ts | 类型 | `TenantPagePerms` + `DEFAULT_TENANT_PAGE_PERMS` |
| 租户 | src/views/tenant/index.vue | pagePerms | `tenantPagePerms` 单 computed |
| 租户 | src/views/tenant/components/TenantTable.vue | boolean props | 收 `:perms`，OpItem 无 `:perm` |
| 用户 | src/views/system/user/user.models.ts | 类型 | `UserPagePerms` + `UserToolbarPerms` |

## 改动摘要

| 指标 | 数值 |
|------|------|
| 涉及文件数 | <N> |
| pagePerms 字段数 | <N> |
| 移除 v-hasPerm 撒点 | <N> |
| 移除 OpItem :perm | <N> |
| 新增 boolean props | <N> |
