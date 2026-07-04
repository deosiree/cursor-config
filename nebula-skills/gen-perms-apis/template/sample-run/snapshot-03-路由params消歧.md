# snapshot-03：路由 params 消歧关键决策

> 沉淀自 commit `1851a7dd` 的 `RoutePermDict.resolveScope` 漏斗逻辑。  
> Darwin keep 决策：本快照作为「params 何时必填」的裁决依据。

## 决策 1：何时必须配置 page params

| 条件 | 决策 | 理由 |
|------|------|------|
| routeProjectMap 中仅 1 个 key 匹配 path | params **可选** | 单候选直接 collectPerms |
| 多个 key 匹配同一 path | params **必填** | 否则进入 ambiguous 宽松合并 |
| URL 固定带 query 区分业务 | params **必填** | query 参与 actual 比对 |
| hidden page 且 path 全局唯一 | params **可省略** | 如 `/Apex/profile` |

**人工门禁**：设计阶段若发现「同 path 多 page」，必须先问用户 params 键值，不得默认省略。

## 决策 2：ambiguous 时的行为

源码行为（`permissions.ts` resolveScope 第 5 步）：

1. DEV 环境 `console.warn` 候选 keys
2. 用户通知：「当前路由不唯一，鉴权可能不准确…」
3. `ambiguous: true`，OR 合并**全部**候选子树 perm
4. allowed 可能偏大（按钮误显示）或偏小（误隐藏）

**修复路径**：为每个冲突 page 补 distinct `params`，确保 URL 可唯一命中。

## 决策 3：function 必须挂在正确 page 子树

改造前 permsMap 全局扁平，function 挂错 page 不影响 isVisible 判定。

改造后 `collectPerms` 只遍历**当前命中 route 节点**的子树：

- function 挂在 page A 下 → 只有访问 page A 对应 URL 时才进入 allowed
- 挂错 page → 有 role perm 但按钮仍不显示

**设计门禁**：补丁 YAML 中每个 function 的 `parent_id` 必须指向正确的 page id。

## 决策 4：菜单同步时机

| 操作 | 是否更新 routeProjectMap |
|------|------------------------|
| 菜单补丁 dry_run | 否 |
| 菜单补丁正式导入 | 是（下次菜单加载 / patchMap） |
| syncMenuCacheOnly | 是（显式 patchMap） |
| 仅改源码 v-hasPerm | 否（但需菜单有对应 function） |

导入后未 relogin / 未刷新菜单缓存 → `getScope()` 可能仍为空 scope。

## 决策 5：排障口径迁移（keep）

| 改造前（revert 信号） | 改造后（keep） |
|---------------------|---------------|
| 查 `userInfo.permsMap` | 查 `RoutePermDict.getScope()` |
| 查 `permsMap[perm].isVisible` | 查 scope.perms[perm] meta + getAllowed() |
| relogin 更新 permsMap | relogin / syncMenuCacheOnly 更新 routeProjectMap |
| hasPermissionBypass | RoutePermDict.pass |

**Revert 条件**：任一排障节点仍把 permsMap 作为主真相源写入 GREEN 路径。

## Darwin keep/revert 记录

| 轮次 | 检查项 | 结果 |
|------|--------|------|
| baseline | permsMap 作为主真相源 | FAIL（12+ 处） |
| trial-1 | 新 eval 4/4 + 排障口径迁移 | PASS |
| trial-2 | 零 permsMap 主路径（除 before-03/迁移说明） | PASS |

验收：trial-2 新 eval 4/4 PASS，排障 eval 零 permsMap 主路径引用 → **KEEP**
