# before-03：旧鉴权链路（permsMap 时代）

> 本文件沉淀自 commit `1851a7dd` **之前** 的 apex_dev 口径。  
> 对应 write-skill「真实历史样本型模板 — 基于 RED 写 before」。  
> **仅供历史对比，不得作为新模块配置的执行口径。**

## 历史 checkHasPerm 判定顺序

```
1. 未传 perm → 通过
2. hasPermissionBypass(userInfo) → isOwner 通过
3. permissions 为空 → 拒绝
4. userHasPerm(perm):
   - permissions 未命中 → 拒绝
   - permsMap[perm] 不存在 → 拒绝
   - permsMap[perm].isVisible === false → 拒绝
   - permsMap[perm].isSystemOnly && !user.isSystem → 拒绝
   - 通过
```

## 历史核心链路（perm-runtime-debugging 改造前）

```
sessionStorage.userInfo.isOwner
    → hasPermissionBypass(userInfo)
    → checkHasPerm(perm)
    → v-hasPerm / v-if / computed
```

显示状态兜底来自 **`userInfo.permsMap`（全局扁平字典）**，与当前路由无关。

## 历史排障口径（已过期）

### 新 perm 不生效

> 根因：权限在 `permsMap` 中不存在。

排查步骤：

```js
const ui = JSON.parse(sessionStorage.getItem('userInfo'));
const pm = ui.permsMap;
console.log('Contains sys:dashboard:view:', pm ? 'sys:dashboard:view' in pm : 'permsMap not found');
```

### E2E 双会话验证

```js
// OpenCLI eval 片段（改造前）
JSON.stringify({
  perms: u.permissions,
  permsMapKeys: u.permsMap ? Object.keys(u.permsMap) : null
})
```

> test 用户必须 logout → confirm → relogin **更新 permsMap**

### checkHasPerm 公式（E2E 编排策略改造前）

> `checkHasPerm` = `permissions` 命中 + `permsMap[perm].isVisible` 显示兜底

## 历史方案的局限

| 问题 | 表现 |
|------|------|
| 全局 permsMap | 同 code 在不同 page 的 isVisible 冲突时无法区分 |
| 无 route params 消歧 | 多 page 共享 path 时鉴权不准 |
| 与菜单树子树脱节 | function 挂在哪个 page 下不影响运行时判定 |
| 菜单变更后 | 仅更新 permsMap，无 routeProjectMap 漏斗 |

## 改造触发 commit

```
1851a7dd fix(services): 鉴权链路更新为路由路径+路由参数+权限标识

+ src/services/permissions.ts   (RoutePermDict 新增)
+ router.beforeEach → RoutePermDict.load
+ checkHasPerm → RoutePermDict.has / pass
+ menu-cache-refresh → RoutePermDict.patchMap
- src/utils/permission-bypass.ts (并入 RoutePermDict.pass)
```

## 对 skill 的启示

- 排障/E2E 文档凡以 permsMap 为**主真相源**的，必须迁移到 RoutePermDict
- 新模块配置必须设计 `route_path` + 可选 `params`，而非仅设计 perm code
- permsMap 可保留在本 before 文档作迁移对照，不可出现在 GREEN 执行路径
