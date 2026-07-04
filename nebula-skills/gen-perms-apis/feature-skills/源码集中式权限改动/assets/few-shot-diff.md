# 源码集中式权限改动 — few-shot 示例

> 租户/用户样本：见 `[[../../../template/sample-run/after-04-页面级静态pagePerms.md]]`。  
> 以下为简单页 v-hasPerm 示例 + 复杂页 pagePerms 摘要。

## 触发（简单页）

```text
安全配置只有 2 个按钮，按集中式原则加 v-hasPerm。
targetRepo=apex_dev。
```

## 简单页：v-hasPerm

```vue
<el-button v-hasPerm="'sys:security:save'">保存</el-button>
<el-button v-hasPerm="'sys:security:reset'">重置</el-button>
```

无 pagePerms、无 OpItem 行内二次鉴权 → 模式 P1 适用。

---

## 触发（复杂页 — 租户）

```text
按集中式原则改 apex_dev 租户管理：tenantPagePerms 静态预算，
类型放 tenant.models.ts，TenantTable 收 :perms，去掉 OpItem :perm。
```

## 租户 pagePerms（模式 S 摘要）

```typescript
// tenant.models.ts
export interface TenantPagePerms { /* ... */ }

// index.vue
import type { TenantPagePerms } from "./tenant.models";
const tenantPagePerms = computed<TenantPagePerms>(() => ({
  query: checkHasPerm("sys:tenant:query"),
  add: checkHasPerm("sys:tenant:add"),
  edit: checkHasPerm("sys:tenant:edit"),
  delete: checkHasPerm("sys:tenant:delete"),
}));
```

```vue
<TenantTable :perms="tenantPagePerms" />
<!-- TenantTable.vue -->
<OpItem v-if="perms.edit" ... />
```

---

## 触发（复杂页 — 用户）

```text
按集中式原则改 apex_dev 用户管理：userPagePerms 放 user.models.ts，
子组件统一 :perms。
```

```typescript
// user.models.ts — UserPagePerms + DEFAULT_USER_PAGE_PERMS + UserToolbarPerms
import type { UserPagePerms } from "./user.models";
```

## 改动原则体现

1. **模式 S**：单一 `xxxPagePerms`，每 perm 预算一次
2. **类型在 models**：`{module}.models.ts`，禁止组件 export
3. **boolean props**：子组件收 `:perms`，非 actionPerms 字符串
4. **禁止 OpItem :perm**：行内操作仅 `v-if="perms.xxx"`
5. **反面**：before-04（v-hasPerm 撒点 + actionPerms 字符串）
