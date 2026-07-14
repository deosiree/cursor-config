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
   → visiblePermSet 来自命中节点**直接** function 子节点的 perm
```

## 运行时链路

```
[基座] beforeEach → 菜单/白名单 → 非法 next('/404')   ← 路由鉴权层

[子应用] beforeEach
  → RoutePermDict.load(to)
  → resolveScope（迭代剥离 + directory 拒绝）
  → fuzzyRejected 时 perms 为空（子应用不 next('/404')）
  → const perms = {}; collectPerms(命中节点, perms)  // 就地写入 → scope.perms
  → rebuildAllowed
  → checkHasPerm / v-hasPerm          ← 权限鉴权层
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

> **不改** `src/services/permissions.ts`——新模块接入时基础设施已就绪。  
> 但须理解**路由鉴权层**（迭代剥离、directory 拒绝）；详见 `[[after-04-路由鉴权迭代剥离.md]]`。

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

URL `/Apex/workspace?type=platform` 只解析平台工作区 page 的**直接** function perm。

## 与 before-03 的关键差异

| 维度 | before-03（permsMap） | after-03（RoutePermDict） |
|------|----------------------|--------------------------|
| 真相源 | `userInfo.permsMap` 全局 | `routeProjectMap` 当前命中节点的直接 function perm |
| 路由参数 | 不参与 | `params` 消歧 |
| 显示状态 | permsMap[perm].isVisible | scope 内 function meta |
| owner 后门 | hasPermissionBypass | RoutePermDict.pass |
| 菜单同步 | 更新 permsMap | patchMap → routeProjectMap |
| 排障入口 | ui.permsMap | getScope() / getAllowed() |

## 执行清单

完整步骤见 `[[../../template/new-module-perm-config-checklist.md]]`。

编排入口：`[[../../intention-skills/编排-新模块权限配置/SKILL.md]]`
