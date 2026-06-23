# 集中式权限改动规则

## 核心原则

> **能用 `v-hasPerm` 就不用 `v-if`。** `v-if` 需要额外新增 computed ref 变量，改动面更大。

## 改动优先级（从简到繁）

### 1. 单元素：v-hasPerm（最优）

```vue
<el-button v-hasPerm="'sys:tenant:add'">新增租户</el-button>
```

- ✅ 不新增 ref 变量
- ✅ 最小 diff
- ✅ 指令内部处理显隐

### 2. 多元素共享同一 perm：父层 v-if

```vue
<template>
  <div v-if="canQuery" class="toolbar">
    <el-button>查询</el-button>
    <el-button>导出</el-button>
  </div>
</template>
<script setup>
const canQuery = computed(() => checkHasPerm('sys:tenant:query'));
</script>
```

- ⚠️ 需要新增一个 computed ref
- 适用场景：整块区域共享同一 perm

### 3. 子组件需要感知权限：props

```vue
<!-- 父组件 -->
<TenantTable :action-perms="{ canEdit, canDelete }" />

<!-- 子组件 -->
const props = defineProps<{ actionPerms: Record<string, boolean> }>();
```

- ⚠️ 需要修改子组件接口
- 适用场景：子组件需要根据权限调整行为

### 4. 整页无权限：PageNoPermission 兄弟分支

```vue
<el-card v-if="canQuery">...</el-card>
<PageNoPermission v-else />
```

- 适用场景：缺 **pageGate** perm（`view` / `query`），影响整块页面内容
- **不同于**工具栏 `v-if="canQuery"`：后者是有 query 时显示工具栏；无 query 时应走 `PageNoPermission`，而非空表格
- 须保留 `fetchData` 入口守卫；对照 `[[../template/sample-run/after-02-页面空态/]]`

## 禁止项

| 禁止 | 原因 |
|------|------|
| 用 `v-if` + ref 替代单个元素的 `v-hasPerm` | diff 面更大 |
| 在多个子按钮上分别写 `v-hasPerm` | 应上提到父层 |
| 父、子组件同时对同一 perm 加守卫 | 冗余且容易不一致 |
| 组件内多次 `checkHasPerm` 检查同一 perm | 用 computed 缓存 |
| 改动非 `targetRepo` 的仓库 | 默认仅改 apex_dev |

## API 守卫位置

| 场景 | 守卫位置 | 示例 |
|------|---------|------|
| 页面初始化 | `fetchData` / `loadData` / `onMounted` | `if (!checkHasPerm('sys:dashboard:view')) return` |
| 表单提交 | `handleSave` / `handleSubmit` | `if (!checkHasPerm('sys:tenant:edit')) return` |
| 弹窗打开 | `openDialog` 或弹窗 `v-if` | `const canOpen = checkHasPerm(...)` |

## 例外

已有合理且独立的子级 perm（如菜单的 `PermissionConfigDialog`、用户表 `OpItem`），**不强行上提**。

## microfb vs apex 责任边界

| 层 | 责任 |
|----|------|
| microfb 基座 | Header 显隐（NavbarActions 的权限入口） |
| apex 子应用 | 页面内部守卫（页面级 `v-if`、API 守卫） |

不要在同一功能上双重实现。基座负责 UI 显隐，子应用负责页面拦截。
