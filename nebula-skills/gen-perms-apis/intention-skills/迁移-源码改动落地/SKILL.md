---
name: 迁移-源码改动落地
description: 当权限设计已确认，需要按集中式原则（复杂页 pagePerms 静态预算、boolean props、最小 diff）改动源码时使用。
---

# 迁移-源码改动落地

## RED

- 没有本节点时，agent 容易在权限设计未确认时直接改码
- 也容易在复杂页撒 `v-hasPerm` 或传 `actionPerms` 字符串，导致同一 perm 重复鉴权
- 常见失败：
  - 列表页工具栏撒 `v-hasPerm`，与 `canQuery` computed 双挂同一 perm
  - 子组件收 `actionPerms` 字符串，OpItem `:perm` 每行二次 `checkHasPerm`
  - 多个平行 `canXxx` computed 而不合并为 `xxxPagePerms`
  - API 守卫写在组件内部而非入口处（`fetchData`/`save`/打开弹窗）
  - 忘记 `targetRepo` 默认约束，错误改动 opsdeck
  - 父、子组件同时对同一 perm 加守卫

## GREEN

- 本节点负责源码改动策略，消费 `[[../../feature-skills/源码集中式权限改动]]`
- 在设计未确认时，必须先消费 `[[../策略-设计权限点]]`
- 输出必须包含：
  - 改动原则说明
  - 逐模块改动计划
  - 每处改动的具体位置与方式

## 输入契约

- `权限设计方案`：必填（来自 `策略-设计权限点` 的输出）
- `targetRepo`：可选，默认 `apex_dev`
- `是否允许多轮人工确认`：可选，默认是

## 改动原则（强制）

### 优先链（从简到繁）

| 优先级 | 场景 | 做法 |
|--------|------|------|
| **P0** | 列表页 / 多行 OpItem / 工具栏 5+ 控点 | 单一 `xxxPagePerms` computed + boolean props |
| P1 | 单元素、无行内二次鉴权 | `v-hasPerm` |
| P2 | 整块共享 perm | `v-if="xxxPagePerms.action"` |
| P3 | pageGate 缺失 | PageNoPermission |

权威参考：`[[../../references/page-perms-static-budget.md]]`

### 禁止项

- ❌ 复杂页无 pagePerms 时撒 `v-hasPerm`
- ❌ 子组件收 perm 字符串 + OpItem `:perm` 二次鉴权
- ❌ 同一 perm 的 `canXxx` + `v-hasPerm` 双挂
- ❌ 父、子组件同时对同一 perm 加守卫（数据源不一致）
- ❌ 改动 `targetRepo` 以外的仓库（默认仅改 apex_dev）
- ❌ 改动 opsdeck

### API 守卫位置

- 页面级：`fetchData` / `loadData` 入口读 `xxxPagePerms.value.query`
- 表单提交：`handleSave` / `handleSubmit` 入口读 `xxxPagePerms.value.edit` 等
- 弹窗打开：`openDialog` 入口读对应 pagePerms 字段
- 不要求在每个子操作的点击事件上重复守卫

### 已有合理子级 perm 的处理

若组件中已存在合理且独立的子级 perm（如菜单的 `PermissionConfigDialog`、用户表 `OpItem`），本批**不强行上提**，避免大范围 diff。

## 典型改动模式

| 模块 | 集中式做法 |
|------|------------|
| 首页 | `loadDashboardData` 一处守卫 + 顶层 `v-if` |
| 租户 | `tenant.models.ts` + `tenantPagePerms` 单 computed；子组件收 boolean `:perms`；OpItem 无 `:perm` |
| 个人中心 | `assertProfilePerm()` 单点 + 主区域一层 `v-if` |
| 用户 | `user.models.ts` + `userPagePerms` 单 computed；子组件收 boolean `:perms`；OpItem 无 `:perm` |
| 角色 | `useRoleList.fetchData` 守卫 |
| 安全配置 | `useSecurityConfigPage` 按 perm 分支；`index.vue` 过滤 Tab、控制保存栏 |
| 菜单 | 工具栏 `canQuery/canAdd/canImport/canExport` + `fetchMenuList` 守卫 |
| 整页门控空态 | 见 `[[../编排-页面无权限空态落地]]`；`PageNoPermission` 兄弟分支 |

## 输出契约

- `implementationGoal`
- `designBasis`（引用权限设计方案）
- `targetRepo`
- `changePrinciples`
- `moduleChanges`（逐模块改动计划）
- `diffSummary`
- `filesToModify`

## Guardrails

- 不允许在权限设计未确认时直接改码
- 不允许在复杂页无 pagePerms 时撒 `v-hasPerm`（优先链约束）
- 不允许改动非 `targetRepo` 的仓库
- 不允许父、子组件对同一 perm 双重守卫
- 已有合理子级 perm 不强行上提

## REFACTOR

- 若复杂页仍用 v-hasPerm 撒点或 actionPerms 字符串，引用 before-04 阻止
- 若 `targetRepo` 约束被突破（改了 opsdeck），补「仅改 targetRepo」的入口校验
- 若改动计划缺少逐模块差异（一刀切所有模块），补 `[[references/change-patterns-ref.md]]` 的差异化模式引用
- 若父组件和子组件对同一 perm 双重守卫，补「单层守卫」强制审查

## 使用示例

```text
权限设计已确认，帮我按集中式原则改 apex_dev 源码。
只改 targetRepo=apex_dev，不动 opsdeck。
```

```text
租户列表页行内操作怎么改才不重复 checkHasPerm？用 tenantPagePerms + boolean props。
```
