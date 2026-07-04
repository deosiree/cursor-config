# before-04：租户权限重复鉴权（反面样本）

> 摘自 apex_dev 暂存区 **改动前** 的租户管理。  
> 对应 write-skill「真实历史样本型模板 — 基于 RED 写 before」。  
> **禁止**作为复杂列表页的改码口径。

## 问题摘要

同一页面可能触发 **几十次** `checkHasPerm`：

1. 父组件多个 `canXxx` computed 各调一次
2. 工具栏同一 perm 再挂 `v-hasPerm`（与 canQuery 重复）
3. 子组件收 **perm 字符串** `actionPerms`
4. 每个 OpItem `:perm` 在 `onBeforeMount` 再鉴权 × 行数

## 反面模式 1：canQuery + v-hasPerm 双挂

```vue
<!-- index.vue 模板（旧） -->
<el-card v-if="canQuery">
  <el-input v-hasPerm="'sys:tenant:query'" ... />
  <el-button v-hasPerm="'sys:tenant:query'">搜索</el-button>
  <el-button v-hasPerm="'sys:tenant:add'">新增</el-button>
  <span v-hasPerm="'sys:tenant:query'">
    <ColumnFilter ... />
  </span>
</el-card>
```

```typescript
const canQuery = computed(() => checkHasPerm("sys:tenant:query"));
const canConfig = computed(() => checkHasPerm("sys:tenant:add"));
const canBindDevice = computed(() => checkHasPerm("sys:tenant:bindDevice"));
// ... 多个平行 computed
```

`query` 在 `canQuery`、搜索框 `v-hasPerm`、列过滤 `v-hasPerm` 上**至少 3 次**。

## 反面模式 2：actionPerms 传字符串

```typescript
const tenantActionPerms = computed(() => ({
  edit: "sys:tenant:edit",
  lock: "sys:tenant:lock",
  delete: "sys:tenant:delete",
  // ...
}));
```

```vue
<TenantTable :action-perms="tenantActionPerms" />
```

子组件接口为 **string**，不是 boolean。

## 反面模式 3：OpItem 二次鉴权

```vue
<!-- TenantTable.vue（旧） -->
<OpItem :perm="actionPerms.edit" @click="..." />
<OpItem :perm="actionPerms.delete" @click="..." />
<!-- 每行 10+ OpItem -->
```

OpItem 内部（`OpItem.vue`）：

```typescript
onBeforeMount(() => {
  if (!resolveVisible(props.perm)) visible.value = false;
});
function resolveVisible(perm) {
  return checkHasPerm(perm);
}
```

100 行数据 × 10 操作 ≈ **1000 次** mount 期鉴权（另加父层 v-hasPerm）。

## 反面模式 4：API 守卫与 UI 各用各的 computed

```typescript
if (!canBindDevice.value) return;  // 守卫 A
if (!canConfig.value) void fetchActivationMode();  // 守卫 B
// 与 tenantActionPerms / v-hasPerm 无统一来源
```

## 对 skill 的教训

- 「v-hasPerm 优先于 v-if」**不能**作为复杂页全局第一原则
- 「子组件收 actionPerms 字符串」会触发 OpItem 二次鉴权
- 集中式 ≠ 把 perm 字符串下传，而是 **boolean pagePerms 静态预算**

正确做法见 `[[after-04-页面级静态pagePerms.md]]`。
