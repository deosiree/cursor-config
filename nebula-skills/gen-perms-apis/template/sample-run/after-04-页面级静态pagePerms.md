# after-04：页面级静态 pagePerms（正面样本）

> 摘自 apex_dev 租户管理改动后实码。  
> 权威参考：`[[../../references/page-perms-static-budget.md]]`

## 改动清单

| 文件 | 改动 |
|------|------|
| `tenant.models.ts` | `TenantPagePerms` + `DEFAULT_TENANT_PAGE_PERMS` |
| `index.vue` | 单一 `tenantPagePerms` computed；`:perms` 下传；API 守卫 |
| `TenantTable.vue` | 收 boolean `perms`；OpItem 去掉 `:perm`，改 `v-if` |

## 1. 类型：`tenant.models.ts`

```typescript
export interface TenantPagePerms {
  query: boolean;
  add: boolean;
  bindDevice: boolean;
  bindResource: boolean;
  edit: boolean;
  lock: boolean;
  unlock: boolean;
  updateStatus: boolean;
  delete: boolean;
}

export const DEFAULT_TENANT_PAGE_PERMS: TenantPagePerms = {
  query: false,
  add: false,
  bindDevice: false,
  bindResource: false,
  edit: false,
  lock: false,
  unlock: false,
  updateStatus: false,
  delete: false,
};
```

## 2. 父页：静态预算

```typescript
import type { TenantPagePerms } from "./tenant.models";

const tenantPagePerms = computed<TenantPagePerms>(() => ({
  query: checkHasPerm("sys:tenant:query"),
  add: checkHasPerm("sys:tenant:add"),
  bindDevice: checkHasPerm("sys:tenant:bindDevice"),
  bindResource: checkHasPerm("sys:tenant:bindResource"),
  edit: checkHasPerm("sys:tenant:edit"),
  lock: checkHasPerm("sys:tenant:lock"),
  unlock: checkHasPerm("sys:tenant:unlock"),
  updateStatus: checkHasPerm("sys:tenant:updateStatus"),
  delete: checkHasPerm("sys:tenant:delete"),
}));
```

删除：`canQuery`、`canConfig`、`canBindDevice`、`canBindResource`、`tenantActionPerms`。

## 3. 模板：v-if 读 pagePerms

```vue
<el-card v-if="tenantPagePerms.query">
  <el-button @click="handleQuery">搜索</el-button>
  <el-button v-if="tenantPagePerms.add" @click="handleOpenCreateDialog">新增</el-button>
  <el-button v-if="tenantPagePerms.delete" @click="handleDelete()">删除</el-button>
  <TenantTable :perms="tenantPagePerms" ... />
</el-card>
<PageNoPermission v-else />
```

无 `v-hasPerm` 撒点。

## 4. 子组件：boolean `perms` prop

```typescript
// TenantTable.vue
import { DEFAULT_TENANT_PAGE_PERMS, type TenantPagePerms } from "../tenant.models";

interface Props {
  perms?: TenantPagePerms;
}
const perms = computed(() => props.perms ?? DEFAULT_TENANT_PAGE_PERMS);
```

```vue
<OpItem v-if="perms.edit" ... />
<OpItem v-if="perms.lock && row.ownerStatus === 'active'" ... />
<OpItem v-if="perms.delete" ... />
```

## 5. API 守卫：同一来源

```typescript
if (!tenantPagePerms.value.bindDevice) return;
if (!tenantPagePerms.value.add) void fetchActivationMode();
if (!tenantPagePerms.value.query) void handleQuery();
```

## 性能对比（定性）

| 维度 | before-04 | after-04 |
|------|-----------|----------|
| 每 perm 类型调用次数 | 多次（computed + v-hasPerm + OpItem×行） | computed 重算时各 1 次 |
| 行内 OpItem | 每行 onBeforeMount checkHasPerm | 仅 v-if boolean，无二次鉴权 |
| 数据源 | 分散 canXxx + actionPerms 字符串 | 单一 tenantPagePerms |
| 类型位置 | 可能在组件内 export | `tenant.models.ts` |

## 复制到其他模块

用户管理已落地：[`user.models.ts`](../../../../Repertory/Sieyuan/nebula/apex_dev/src/views/system/user/user.models.ts) + `userPagePerms` + `:perms`。  
菜单管理等复杂列表页：复制 **模式 S**，类型放 `{module}.models.ts`，perm 字段按设计方案替换。
