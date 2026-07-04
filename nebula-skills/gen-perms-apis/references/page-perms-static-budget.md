# 页面级静态 pagePerms 鉴权预算

> 权威样本：apex_dev 租户 [`tenant.models.ts`](../../../../Repertory/Sieyuan/nebula/apex_dev/src/views/tenant/tenant.models.ts) + 用户 [`user.models.ts`](../../../../Repertory/Sieyuan/nebula/apex_dev/src/views/system/user/user.models.ts) + 菜单 [`menu.models.ts`](../../../../Repertory/Sieyuan/nebula/apex_dev/src/views/system/menu/menu.models.ts)  
> 与 `[[route-scope-auth-chain.md]]` 配合：`checkHasPerm` 仍是真相源，本模式优化**调用次数**。

## 核心思想

在**父页面**用**单一静态预算**（`shallowRef` 或 setup 工厂，各 perm 只 `checkHasPerm` 一次）得到 boolean 字典，模板与子组件只读 boolean，**不再**在 HTML 撒 `v-hasPerm`、**不再**向 OpItem 传 `:perm` 字符串。

```typescript
import { shallowRef } from "vue";
import { checkHasPerm } from "@/directive/permission";
import type { RolePagePerms } from "./role.models";

/** setup 执行一次；勿用 computed 包 checkHasPerm（非响应式，会反复重算） */
const rolePagePerms = shallowRef<RolePagePerms>({
  query: checkHasPerm("sys:role:query"),
  add: checkHasPerm("sys:role:add"),
  edit: checkHasPerm("sys:role:edit"),
  delete: checkHasPerm("sys:role:delete"),
});
```

RoutePermDict 下 `checkHasPerm` 已是 O(1) `Set.has`，但**重复调用**仍会在复杂页造成几十次函数入口与 computed 依赖抖动。

**预算容器**：用 `shallowRef` / 工厂函数在 setup **只执行一次**，不要用 `computed(() => ({ ...checkHasPerm }))`——`checkHasPerm` 读 sessionStorage/RoutePermDict，**不是** Vue 响应式依赖，computed 可能被反复 invalidate，导致「4 个 perm 却打几十条 DEV 日志」。

## 适用边界

| 场景 | 推荐做法 |
|------|---------|
| 列表页 + 工具栏 5+ 控点 + 行内 OpItem | **pagePerms 静态预算**（模式 S） |
| 表格每行 10+ 操作项 | boolean `pagePerms` + 子组件 `v-if`，禁止 OpItem `:perm` |
| API 守卫（fetch/save/openDialog） | 读 `xxxPagePerms.value.action`，禁止平行 `canXxx` computed |
| 仅 1–2 个独立按钮、无行内二次鉴权 | 仍可用 `v-hasPerm`（简单独立页） |
| 本路由域内模态框（含嵌套 Dialog） | **同一 pagePerms 预算** + `:perms` 下传，禁止弹窗内独立 `v-hasPerm` / OpItem `:perm` |
| pageGate 缺失 | `PageNoPermission` 兄弟分支（不变） |

## 模板层

```vue
<!-- 父 index.vue -->
<el-card v-if="tenantPagePerms.query">...</el-card>
<el-button v-if="tenantPagePerms.add">新增</el-button>
<TenantTable :perms="tenantPagePerms" />
```

**禁止**同一 perm 上同时存在 `canQuery` computed + `v-hasPerm="'sys:tenant:query'"`。

## 子组件层

```vue
<!-- TenantTable.vue -->
<OpItem v-if="perms.edit" ... />  <!-- 无 :perm -->
```

Props 类型为 **boolean 字典**，定义在 **`{module}.models.ts`**，子组件 prop 统一命名为 **`perms`**：

```typescript
// tenant.models.ts（或 user.models.ts）
export interface TenantPagePerms {
  query: boolean;
  add: boolean;
  edit: boolean;
  delete: boolean;
  // ...
}

export const DEFAULT_TENANT_PAGE_PERMS: TenantPagePerms = { /* 全 false */ };
```

```typescript
// TenantTable.vue — 不从组件 export 类型
import { DEFAULT_TENANT_PAGE_PERMS, type TenantPagePerms } from "../tenant.models";

interface Props {
  perms?: TenantPagePerms;
}
const perms = computed(() => props.perms ?? DEFAULT_TENANT_PAGE_PERMS);
```

**禁止**在 `.vue` 组件内 export `XxxPagePerms` 供编排层 import。

### OpItem 反模式

[`OpItem.vue`](../../../../Repertory/Sieyuan/nebula/apex_dev/src/components/OperationColumn/OpItem.vue) 在 `onBeforeMount` 内对 `:perm` 调用 `checkHasPerm`：

- 10 个 OpItem × N 行 ≈ **10N 次**鉴权
- 父组件若还撒 `v-hasPerm`，同一 perm 再算一遍

**正确**：父 pagePerms 预算一次 → 子组件 `v-if="perms.edit"` → OpItem **不传** `:perm`。

## 类型与 prop 约定

| 约定 | 说明 |
|------|------|
| 类型位置 | `{Module}PagePerms` + `DEFAULT_{MODULE}_PAGE_PERMS` 放 **`{module}.models.ts`** |
| 父页 import | `import type { TenantPagePerms } from "./tenant.models"`（在 `index.vue`） |
| 子组件 prop | 统一 **`:perms`**（boolean 字典），不用 `:page-perms` |
| 子集类型 | 如 `UserToolbarPerms = Pick<UserPagePerms, ...>` 一并放 models |

对照：租户 → `tenant.models.ts`；用户 → `user.models.ts`；菜单 → `menu.models.ts`（8 perm，含 `configApi`）。

### 模态框延伸

同一路由域内所有 Dialog 纳入父页 `xxxPagePerms` 预算，通过 `:perms` 下传；嵌套 Dialog 继续透传：

```vue
<!-- menu/index.vue -->
<PermissionConfigDialog :perms="menuPagePerms" ... />
<ApiWhitelistDialog :perms="menuPagePerms" ... />

<!-- PermissionConfigDialog.vue -->
<ApiConfigDialog :perms="dialogPerms" ... />
```

弹窗 handler 入口须读 `dialogPerms.value.xxx` 守卫，与列表页 handler 一致。

菜单 8 perm 完整清单：`query` / `add` / `edit` / `delete` / `whitelist` / `import` / `export` / `configApi`。

## API 守卫

```typescript
async function handleOpenBindDeviceDialog(row) {
  if (!tenantPagePerms.value.bindDevice) return;
  // ...
}

onMounted(() => {
  if (tenantPagePerms.value.add) void fetchActivationMode();
  if (tenantPagePerms.value.query) void handleQuery();
});
```

合并原 `canQuery` / `canConfig` / `canBindDevice` 等零散 computed，避免同一 perm 多处 `checkHasPerm`。

## 与旧 skill 口径的差异

| 旧口径（已废弃为复杂页默认） | 新口径 |
|---------------------------|--------|
| v-hasPerm 优先于 v-if | 复杂页 pagePerms + v-if |
| 子组件收 `actionPerms` 字符串 | 子组件收 `perms` boolean（`:perms` prop） |
| OpItem `:perm="'sys:xxx'"` | OpItem 无 perm，外层 v-if |
| 多个 `canXxx` computed | 单一 `xxxPagePerms` computed |

反面样本：`[[../template/sample-run/before-04-租户权限重复鉴权.md]]`  
正面样本：`[[../template/sample-run/after-04-页面级静态pagePerms.md]]`  
决策节点：`[[../template/sample-run/snapshot-04-pagePerms决策.md]]`

## 改码检查清单

- [ ] 父页仅 **一个** `xxxPagePerms` computed 含本页全部 perm
- [ ] 模板无分散 `v-hasPerm`（复杂页）
- [ ] 子组件 props 为 boolean，非 perm 字符串
- [ ] OpItem / 行内操作无 `:perm`
- [ ] API 守卫读 `pagePerms.value.xxx`
- [ ] 无 `canXxx` 与 `v-hasPerm` 对同一 perm 双挂
- [ ] `XxxPagePerms` 在 `{module}.models.ts`，非 `.vue` 组件内
- [ ] 子组件 prop 名为 `perms`（`:perms="xxxPagePerms"`）
- [ ] pageGate 仍用 `query`/`view` + PageNoPermission
- [ ] 本路由域模态框已纳入 pagePerms 预算并 `:perms` 下传（含嵌套 Dialog）
