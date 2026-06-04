# 迁移-源码改动落地 — 实施计划模板

## 实施目标

- `implementationGoal`
- `designBasis`（引用权限设计方案）
- `targetRepo`

## 改动原则确认

- [ ] v-hasPerm 优先于 v-if
- [ ] 父层 v-if 仅用于多元素共享 perm
- [ ] 子组件收 props
- [ ] API 入口守卫
- [ ] 不改非 targetRepo 仓库

## 逐模块改动计划

| 模块 | 文件 | 改动类型 | 改动说明 |
|------|------|---------|---------|
| 首页 | src/views/dashboard/index.vue | 新增守卫 + v-if | loadDashboardData 入口 checkHasPerm + 顶层 v-if |
| 租户 | src/views/tenant/index.vue | 新增 computed + v-if | 工具栏 canQuery/canAdd/... |
| 租户 | src/views/tenant/components/TenantTable.vue | 新增 props | 收 actionPerms |

## 改动摘要

| 指标 | 数值 |
|------|------|
| 涉及文件数 | <N> |
| 新增 v-hasPerm | <N> |
| 新增 v-if | <N> |
| 新增 computed ref | <N> |
| 新增 props | <N> |
