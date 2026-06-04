# 源码集中式权限改动 — few-shot 示例

> 来自 2026-06-03 会话：租户管理集中式改动

## 触发

```text
按集中式原则改 apex_dev 源码，首页用 v-hasPerm，租户工具栏用 v-if 包整块。
targetRepo=apex_dev。
```

## 改动前

```vue
<!-- tenant/index.vue（改动前） -->
<template>
  <div class="toolbar">
    <el-button @click="handleAdd">新增</el-button>
    <el-button @click="handleEdit">编辑</el-button>
    <el-button @click="handleDelete">删除</el-button>
    <el-input v-model="searchText" placeholder="搜索" />
  </div>
  <TenantTable :data="list" />
  <BindDeviceDialog v-model:visible="deviceVisible" />
</template>
```

工具栏所有按钮均无权限控制，`BindDeviceDialog` 无入口守卫。

## 改动后

```vue
<!-- tenant/index.vue（改动后） -->
<template>
  <!-- 工具栏：v-if 包裹整块（多按钮共享同一 perm） -->
  <div v-if="canQuery" class="toolbar">
    <el-button v-hasPerm="'sys:tenant:add'" @click="handleAdd">新增</el-button>
    <el-button v-hasPerm="'sys:tenant:edit'" @click="handleEdit">编辑</el-button>
    <el-button v-hasPerm="'sys:tenant:delete'" @click="handleDelete">删除</el-button>
    <el-input v-model="searchText" placeholder="搜索" />
  </div>
  <!-- 子组件收 props -->
  <TenantTable :data="list" :action-perms="{ canEdit, canDelete }" />
  <!-- 弹窗由父组件 v-if 控制 -->
  <BindDeviceDialog
    v-if="canBindDevice"
    v-model:visible="deviceVisible"
  />
</template>

<script setup>
const canQuery = computed(() => checkHasPerm('sys:tenant:query'));
const canEdit = computed(() => checkHasPerm('sys:tenant:edit'));
const canDelete = computed(() => checkHasPerm('sys:tenant:delete'));
const canBindDevice = computed(() => checkHasPerm('sys:tenant:bindDevice'));
</script>
```

## 改动原则体现

1. **v-hasPerm 优先**：新增/编辑/删除按钮各一个 `v-hasPerm`（单元素，不新增 ref）
2. **父层 v-if 收敛**：工具栏 `v-if="canQuery"` 包裹整块（多元素共享 query perm）
3. **子组件收 props**：`TenantTable` 收 `actionPerms`，不内部读 perm
4. **弹窗 v-if**：`BindDeviceDialog` 由父组件控制挂载
5. **最小 diff**：不改 `TenantTable` 和 `BindDeviceDialog` 内部实现
