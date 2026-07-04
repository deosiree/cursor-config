# 集中式权限改动规则

## 核心原则

> **复杂列表页**：用 **单一 `xxxPagePerms` computed** 静态预算本页 perm，模板/子组件/API 只读 boolean。  
> **简单页**（≤2 个独立按钮、无行内 OpItem）：仍可用 `v-hasPerm`。

权威参考：`[[page-perms-static-budget.md]]`  
反面样本：`[[../template/sample-run/before-04-租户权限重复鉴权.md]]`

## 改动优先级（从简到繁）

### P0：模式 S — pagePerms 静态预算（复杂页默认）

适用：列表页、工具栏 5+ 控点、表格行内 OpItem。

```typescript
const tenantPagePerms = computed<TenantPagePerms>(() => ({
  query: checkHasPerm("sys:tenant:query"),
  add: checkHasPerm("sys:tenant:add"),
  edit: checkHasPerm("sys:tenant:edit"),
  delete: checkHasPerm("sys:tenant:delete"),
}));
```

```vue
<el-button v-if="tenantPagePerms.add">新增</el-button>
<TenantTable :perms="tenantPagePerms" />
<!-- 子组件：v-if="perms.edit"，OpItem 不传 :perm -->
```

- 每个 perm 类型在 computed 重算时**只调用一次** `checkHasPerm`
- 类型放 `{module}.models.ts`，子组件 prop 统一 `:perms`
- 禁止 `canQuery` + `v-hasPerm` 对同一 perm 双挂
- 禁止子组件收 perm **字符串** 或 OpItem `:perm`

### P1：单元素 v-hasPerm（简单页）

```vue
<el-button v-hasPerm="'sys:foo:add'">新增</el-button>
```

- 无表格行内 OpItem、无子组件二次鉴权
- 不新增 computed

### P2：整块区域 v-if（读 pagePerms 字段）

```vue
<div v-if="tenantPagePerms.query" class="toolbar">...</div>
```

- 与 P0 共用同一 `xxxPagePerms`，禁止另建 `canQuery` computed

### P3：整页无权限 PageNoPermission

```vue
<el-card v-if="tenantPagePerms.query">...</el-card>
<PageNoPermission v-else />
```

- pageGate 缺失时用，禁止空表格「暂无数据」
- 对照 `[[../template/sample-run/after-02-页面空态/]]`

## 禁止项

| 禁止 | 原因 |
|------|------|
| 复杂页撒 `v-hasPerm` | 与 pagePerms/canXxx 重复调用 |
| 子组件 props 传 perm 字符串 + OpItem `:perm` | 每行 onBeforeMount 二次鉴权 |
| `canXxx` 与 `v-hasPerm` 双挂同一 perm | 重复触发 |
| 多个平行 `canXxx` computed 而不合并 pagePerms | 维护分散、调用重复 |
| 父、子对同一 perm 不同源守卫 | 不一致 |
| 改动非 `targetRepo` 的仓库 | 默认仅改 apex_dev |

## API 守卫位置

| 场景 | 守卫位置 | 示例 |
|------|---------|------|
| 页面初始化 | `onMounted` / `fetchList` | `if (!tenantPagePerms.value.query) return` |
| 表单提交 | `handleSave` / `handleSubmit` | `if (!pagePerms.value.edit) return` |
| 弹窗打开 | `openDialog` 入口 | `if (!pagePerms.value.add) return` |

守卫与 UI **必须**读同一 `xxxPagePerms` 对象。

## 例外

菜单 `PermissionConfigDialog`、用户表等**已有独立子级 perm 且非 OpItem 字符串 props 模式**的模块，不强行套用租户 diff；新模块优先模式 S。

## microfb vs apex 责任边界

| 层 | 责任 |
|----|------|
| microfb 基座 | Header 显隐（NavbarActions） |
| apex 子应用 | 页面 pagePerms + API 守卫 |

不要在同一功能上双重实现。
