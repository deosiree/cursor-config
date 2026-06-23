---
name: 源码集中式权限改动
description: 按集中式原则改动源码：v-hasPerm 优先于 v-if、父组件收敛、API 入口守卫、最小 diff。默认仅改 targetRepo（apex_dev）。
---

# 源码集中式权限改动

## RED

- 没有本 skill 时，agent 容易在多处子组件上喷洒 `v-hasPerm`，违反集中式原则
- 常见失败：
  - 用 `v-if` + computed ref 替代单个元素的 `v-hasPerm`，diff 面更大
  - 在子组件的多个元素上分别写 `v-hasPerm`，而不是父层一层 `v-if`
  - API 守卫写在多个子操作上而非入口处
  - 改动 opsdeck 或其他非 targetRepo 仓库
  - 父、子组件对同一 perm 双重守卫

## 输入

- `权限设计方案`：必填
- `targetRepo`：默认 `apex_dev`
- `改动范围`：可选（指定模块或路由）

## GREEN

### 改动优先级（从简到繁）

1. **单个元素** → `v-hasPerm="'perm'"`（不新增 ref 变量，最小 diff）
2. **多个兄弟元素共享同一 perm** → 父层一个 `v-if="canXxx"` + 一个 computed
3. **子组件需要感知权限** → 收 `props.perms`，由父组件传入

> 关键原则：能用 `v-hasPerm` 就不要用 `v-if`，因为 `v-if` 需要额外新增 computed ref 变量，改动面更大。

### 禁止项

- ❌ 用 `v-if` + ref 替代单个元素的 `v-hasPerm`
- ❌ 在多个子按钮上分别写 `v-hasPerm`，不在父层统一控制
- ❌ 父、子组件同时对同一 perm 加守卫
- ❌ 在组件内部多次调用 `checkHasPerm` 检查同一 perm
- ❌ 改动非 `targetRepo` 的仓库

### API 守卫位置

| 场景 | 守卫位置 |
|------|---------|
| 页面初始化 | `fetchData` / `loadData` / `onMounted` 入口一处 `checkHasPerm` |
| 表单提交 | `handleSave` / `handleSubmit` 入口一处 |
| 弹窗打开 | `openDialog` 内或弹窗组件 `v-if` 控制挂载 |
| 整块区域 | 父模板一个 `v-if="canXxx"` 包裹 |

### 典型模式

#### 模式 A：单元素 v-hasPerm

```vue
<el-button v-hasPerm="'sys:tenant:add'">新增租户</el-button>
```

#### 模式 B：父层 v-if 包裹整块

```vue
<template>
  <div v-if="canQuery" class="toolbar">...</div>
</template>
<script setup>
const canQuery = computed(() => checkHasPerm('sys:tenant:query'));
</script>
```

#### 模式 C：子组件收 props

```vue
<!-- 父组件 -->
<TenantTable :action-perms="{ canEdit, canDelete }" />

<!-- 子组件 -->
const props = defineProps<{ actionPerms: Record<string, boolean> }>();
```

#### 模式 D：整页 PageNoPermission（pageGate 缺失）

```vue
<el-card v-if="canQuery">...</el-card>
<PageNoPermission v-else />
```

- 缺 `view`/`query` 等 pageGate 时用，**禁止**空表格「暂无数据」
- 详见 `[[接入-PageNoPermission空态]]` 与 `[[../../template/sample-run/after-02-页面空态/]]`

### 例外

已有合理且独立的子级 perm（如菜单的 `PermissionConfigDialog`、用户表 `OpItem`），本批**不强行上提**，避免大范围 diff。

## 输出

- `changePlan`：逐模块改动计划
- `filesModified`：改动文件清单
- `diffSummary`：每处改动的简要说明

## REFACTOR

- 若 `v-if` + computed 被滥用于单元素替代 `v-hasPerm`，收紧优先链：「每处 `v-if` 必须说明为什么不能用 `v-hasPerm`」
- 若 `targetRepo` 约束被违反（错误改动 opsdeck），补入口校验
- 若父组件和子组件对同一 perm 双重守卫，补「单层守卫」原则的强制检查
- 若改动模式退化为一刀切（所有模块用同一模式），补逐模块差异化的改动模板

## 使用示例

```text
按集中式原则改 apex_dev 源码，首页用 v-hasPerm，
租户管理工具栏用 v-if 包整块。
```
