# after-03：路由作用域鉴权（RoutePermDict）

> 本文件沉淀自 commit `1851a7dd` 落地后的 apex_dev 口径。  
> 对应 write-skill「真实历史样本型模板 — 基于 GREEN 写 after」。  
> 权威参考：`[[../../references/route-scope-auth-chain.md]]`

## 新 checkHasPerm 判定顺序

```
1. 未传 perm → 通过
2. RoutePermDict.pass(userInfo) → isOwner 通过
3. RoutePermDict.has(requiredPerms, userInfo)
   → allowed = visiblePermSet ∩ user.permissions
   → visiblePermSet 来自当前路由 scope 的 FUNCTION 子树
```

## 运行时链路

```
router.beforeEach
  → RoutePermDict.load(to)
  → resolveScope(routePath + params 漏斗)
  → collectPerms(routeProjectMap 节点子树)
  → rebuildAllowed
  → checkHasPerm / v-hasPerm
```

## 新模块配置示例：/Apex/report

### 1. 设计三件套

| 字段 | 值 |
|------|-----|
| routePath | `/Apex/report` |
| paramsDecision | 不需要（全项目唯一 page 使用该 path） |
| functionPermList | `sys:report:view`, `sys:report:query`, `sys:report:export` |

### 2. 菜单补丁 YAML

```yaml
patch_children_add:
  - name: 报表管理
    route_path: /Apex/report
    id: 20001
    parent_id: 1
    children:
      - name: 查看报表
        code: sys:report:view
        type: function
        id: 20002
        parent_id: 20001
        apis:
          - /seccenter/v2/report/detail
      - name: 查询报表
        code: sys:report:query
        type: function
        id: 20003
        parent_id: 20001
        apis:
          - /seccenter/v2/report/list
      - name: 导出报表
        code: sys:report:export
        type: function
        id: 20004
        parent_id: 20001
        apis:
          - /seccenter/v2/report/export
```

### 3. 源码改动（apex_dev）

```vue
<!-- src/views/report/index.vue -->
<template>
  <el-card v-if="canQuery">
    <el-button v-hasPerm="'sys:report:export'">导出</el-button>
    <!-- 列表区域 -->
  </el-card>
  <PageNoPermission v-else />
</template>

<script setup>
import { computed } from 'vue';
import { checkHasPerm } from '@/directive/permission';

const canQuery = computed(() => checkHasPerm('sys:report:query'));

async function fetchData() {
  if (!checkHasPerm('sys:report:query')) return;
  // ...
}
</script>
```

> **不改** `src/services/permissions.ts`——基础设施已在 commit 1851a7dd 就绪。

### 4. 验证

```js
// 导航到 /Apex/report 后
RoutePermDict.getScope();
// { routePath: '/Apex/report', params: {}, ambiguous: false, perms: {...} }

RoutePermDict.getAllowed();
// Set { 'sys:report:view', 'sys:report:query', 'sys:report:export' } ∩ user.permissions

checkHasPerm('sys:report:query'); // true/false
```

## 同 path 多 page 示例（需 params）

两个 page 都用 `/Apex/workspace`，靠 query 区分：

```yaml
patch_children_add:
  - name: 平台工作区
    route_path: /Apex/workspace
    params:
      type: platform
    id: 20010
    parent_id: 1
    children:
      - name: 查看平台工作区
        code: sys:workspace:platform:view
        type: function
        id: 20011
        parent_id: 20010
  - name: 租户工作区
    route_path: /Apex/workspace
    params:
      type: tenant
    id: 20012
    parent_id: 1
    children:
      - name: 查看租户工作区
        code: sys:workspace:tenant:view
        type: function
        id: 20013
        parent_id: 20012
```

URL ` /Apex/workspace?type=platform` 只解析平台工作区子树的 perm。

## 与 before-03 的关键差异

| 维度 | before-03（permsMap） | after-03（RoutePermDict） |
|------|----------------------|--------------------------|
| 真相源 | `userInfo.permsMap` 全局 | `routeProjectMap` 当前路由子树 |
| 路由参数 | 不参与 | `params` 消歧 |
| 显示状态 | permsMap[perm].isVisible | scope 内 function meta |
| owner 后门 | hasPermissionBypass | RoutePermDict.pass |
| 菜单同步 | 更新 permsMap | patchMap → routeProjectMap |
| 排障入口 | ui.permsMap | getScope() / getAllowed() |

## 执行清单

完整步骤见 `[[../../template/new-module-perm-config-checklist.md]]`。

编排入口：`[[../../intention-skills/编排-新模块权限配置/SKILL.md]]`
