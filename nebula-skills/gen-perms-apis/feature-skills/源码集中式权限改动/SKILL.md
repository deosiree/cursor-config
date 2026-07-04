---
name: 源码集中式权限改动
description: 按集中式原则改动源码：复杂页 pagePerms 静态预算、boolean props 下传、禁止 OpItem 二次鉴权；简单页可用 v-hasPerm。默认仅改 targetRepo（apex_dev）。
---

# 源码集中式权限改动

## RED

- 没有本 skill 时，agent 容易在复杂页撒 `v-hasPerm` 或传 `actionPerms` 字符串，导致同一 perm 调用几十次
- 常见失败：
  - 工具栏 `v-hasPerm` + `canQuery` computed **双挂同一 perm**
  - 子组件收 `actionPerms: { edit: 'sys:tenant:edit' }`，OpItem `:perm` 每行 `onBeforeMount` 再 `checkHasPerm`
  - 多个平行 `canXxx` computed 而不合并为 `xxxPagePerms`
  - 在简单页过度使用 pagePerms（2 个按钮也建整页字典）
  - API 守卫读 `canBindDevice`，UI 读 `v-hasPerm`，数据源不一致
  - 改动 opsdeck 或其他非 targetRepo 仓库

## 输入

- `权限设计方案`：必填
- `targetRepo`：默认 `apex_dev`
- `改动范围`：可选（指定模块或路由）

## GREEN

### 改动优先级

| 优先级 | 场景 | 做法 |
|--------|------|------|
| **P0 模式 S** | 列表页 / 多行 OpItem / 工具栏 5+ 控点 | 单一 `xxxPagePerms` computed + boolean props |
| P1 | 单元素、无行内二次鉴权 | `v-hasPerm` |
| P2 | 整块共享 perm | `v-if="xxxPagePerms.action"` |
| P3 | pageGate 缺失 | PageNoPermission |

> 权威规则：`[[../../references/page-perms-static-budget.md]]`  
> 租户样本：`[[../../template/sample-run/after-04-页面级静态pagePerms.md]]`

### 模式 S：pagePerms 静态预算（复杂页默认）

```typescript
import type { TenantPagePerms } from "./tenant.models";

const tenantPagePerms = computed<TenantPagePerms>(() => ({
  query: checkHasPerm("sys:tenant:query"),
  add: checkHasPerm("sys:tenant:add"),
  edit: checkHasPerm("sys:tenant:edit"),
  delete: checkHasPerm("sys:tenant:delete"),
}));
```

```vue
<!-- 父 index.vue -->
<el-button v-if="tenantPagePerms.add">新增</el-button>
<TenantTable :perms="tenantPagePerms" />

<!-- 子 TenantTable.vue -->
<OpItem v-if="perms.edit" ... />  <!-- 禁止 :perm -->
```

### 模式 P1：简单页 v-hasPerm

```vue
<el-button v-hasPerm="'sys:foo:add'">新增</el-button>
```

仅当：无表格行内 OpItem、perm 控点 ≤2。

### 模式 P3：PageNoPermission

```vue
<el-card v-if="tenantPagePerms.query">...</el-card>
<PageNoPermission v-else />
```

### ~~模式 C（已废弃反面）~~ actionPerms 字符串

```vue
<!-- ❌ 不要这样做 -->
<TenantTable :action-perms="{ edit: 'sys:tenant:edit' }" />
<OpItem :perm="actionPerms.edit" />
```

见 `[[../../template/sample-run/before-04-租户权限重复鉴权.md]]`。

### 禁止项

- ❌ 复杂页撒 `v-hasPerm`
- ❌ OpItem `:perm` + 字符串 actionPerms
- ❌ 同一 perm 的 canXxx + v-hasPerm 双挂
- ❌ 多个 canXxx 不合并进 xxxPagePerms
- ❌ 在 `.vue` 组件内 export `XxxPagePerms` 供编排层 import

### API 守卫

统一读 `xxxPagePerms.value.action`，与模板同源。

### 例外

菜单 PermissionConfigDialog 等已有合理独立子级 perm、且非 OpItem 字符串模式的，不强行套用租户 diff。

## 反例黑名单（不要做）

| # | 反模式 | 后果 |
|---|--------|------|
| 1 | 租户式列表页仍用 v-hasPerm 撒点 | 重复 checkHasPerm |
| 2 | actionPerms 传 perm 字符串 | OpItem 每行二次鉴权 |
| 3 | canQuery + v-hasPerm(query) 并存 | 同一 perm 算两遍 |
| 4 | 简单 2 按钮页也建 10 字段 pagePerms | 过度设计 |
| 5 | API 守卫用 canXxx、UI 用 v-hasPerm | 数据源分裂 |

## 输出

- `changePlan`：逐模块改动计划（标注模式 S / P1）
- `filesModified`：改动文件清单
- `diffSummary`：每处改动的简要说明

## REFACTOR

- 若 agent 在复杂页仍推荐 v-hasPerm 优先，引用 before-04 阻止
- 若子组件仍传 perm 字符串，强制改为 boolean pagePerms
- 若 pagePerms 与 RoutePermDict 混谈为「全局捞 perm」，澄清：pagePerms 是**调用次数**优化，真相源仍是 checkHasPerm

## 使用示例

```text
按集中式原则改 apex_dev 租户管理：用 tenantPagePerms 静态预算，
TenantTable 收 boolean pagePerms，去掉 OpItem :perm。
```

```text
安全配置只有 2 个按钮，是否还要 pagePerms？
```

预期：2 按钮 → 模式 P1 v-hasPerm；列表页+OpItem → 模式 S。
