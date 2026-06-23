---
name: 迁移-源码改动落地
description: 当权限设计已确认，需要按集中式原则（v-hasPerm 优先、父组件收敛、最小 diff）改动源码时使用。
---

# 迁移-源码改动落地

## RED

- 没有本节点时，agent 容易在权限设计未确认时直接改码
- 也容易在多处子组件上喷洒 `v-hasPerm`，违反集中式原则
- 常见失败：
  - 用 `v-if` + computed ref 替代 `v-hasPerm`，增大 diff 面
  - 在子组件多个元素上分别写 `v-hasPerm`，而不是父组件一层 `v-if` 包整块
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

1. **单个元素** → 使用 `v-hasPerm="'perm'"`（不新增 ref 变量）
2. **多个兄弟元素共享同一 perm** → 父层一个 `v-if="canXxx"`（一个 computed）
3. **子组件需要感知权限** → 收 `props.perms`，由父组件传入

### 禁止项

- ❌ 用 `v-if` + computed ref 替代单个元素的 `v-hasPerm`
- ❌ 在多个子按钮上分别写 `v-hasPerm`，而不在父层统一控制
- ❌ 父、子组件同时对同一 perm 加守卫
- ❌ 在组件内部多次调用 `checkHasPerm` 检查同一 perm
- ❌ 改动 `targetRepo` 以外的仓库（默认仅改 apex_dev）
- ❌ 改动 opsdeck

### API 守卫位置

- 页面级：`fetchData` / `loadData` 入口调用一次 `checkHasPerm`
- 表单提交：`handleSave` / `handleSubmit` 入口调用一次
- 弹窗打开：`openDialog` 入口或弹窗组件 `v-if` 控制挂载
- 不要求在每个子操作的点击事件上重复守卫

### 已有合理子级 perm 的处理

若组件中已存在合理且独立的子级 perm（如菜单的 `PermissionConfigDialog`、用户表 `OpItem`），本批**不强行上提**，避免大范围 diff。

## 典型改动模式

| 模块 | 集中式做法 |
|------|------------|
| 首页 | `loadDashboardData` 一处守卫 + 顶层 `v-if` |
| 租户 | 权限集中在 `index.vue`；子组件收 `actionPerms` prop；弹窗由父 `v-if` 控制 |
| 个人中心 | `assertProfilePerm()` 单点 + 主区域一层 `v-if` |
| 用户 | `index.vue` 定义 `toolbarPerms`；子组件收 `props.perms` |
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
- 不允许优先使用 `v-if` + ref 替代 `v-hasPerm`（优先链约束）
- 不允许改动非 `targetRepo` 的仓库
- 不允许父、子组件对同一 perm 双重守卫
- 已有合理子级 perm 不强行上提

## REFACTOR

- 若 v-hasPerm 优先链被违反（用 v-if+ref 替代 v-hasPerm），收紧改动优先级审查
- 若 `targetRepo` 约束被突破（改了 opsdeck），补「仅改 targetRepo」的入口校验
- 若改动计划缺少逐模块差异（一刀切所有模块），补 `[[references/change-patterns-ref.md]]` 的差异化模式引用
- 若父组件和子组件对同一 perm 双重守卫，补「单层守卫」强制审查

## 使用示例

```text
权限设计已确认，帮我按集中式原则改 apex_dev 源码。
只改 targetRepo=apex_dev，不动 opsdeck。
```

```text
首页和租户管理的改动面较大，帮我确认哪些地方用 v-hasPerm、哪些用父层 v-if。
```
