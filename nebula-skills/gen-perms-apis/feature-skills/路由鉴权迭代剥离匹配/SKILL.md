---
name: 路由鉴权迭代剥离匹配
description: 排查 RoutePermDict.resolveScope：迭代剥离路径匹配、directory 节点拒绝（fuzzyRejected）、子路由继承 page 父节点、/404 短路；路由 URL 拦截在基座。触发词：子路由鉴权、fuzzyRejected、directory 拒绝、路由命中目录节点、剥离路径继续匹配、基座路由鉴权。
---

# 路由鉴权迭代剥离匹配

## TL;DR

**resolveScope / 菜单命中排障专用**（不是 role perm 不足）。顺序：`fuzzyRejected` → `matchedNodeType` → `matchMode` → `collectPerms` 直接层 → 再查 `getAllowed()`。

- **URL 级 404**：查 **microfb 基座**守卫（菜单 routePath + 白名单），**不要**在子应用 `beforeEach` 加 `fuzzyRejected → next('/404')`
- **能进页但按钮全灭 / fuzzyRejected**：修菜单 type/`route_path`（permissions.ts 算法口径仍正确）

典型修复：子路由补父 page `route_path`；directory 改 page；function 挂 page 直接子节点。

权威链：`[[../../references/route-scope-auth-chain.md]]`；collectPerms 样本：`[[../../template/sample-run/snapshot-05-collectPerms作用域决策.md]]`

## RED

- 没有本 skill 时，agent 容易把「菜单未命中 page」误判为「权限不足」，或建议恢复已删除的 `fuzzyMatchByPrefix`，或**错误地在子应用守卫加回 `/404`**。
- 典型失败场景：
  1. **子路由按钮全灭**：`/Opsdeck/projectManage/detail` 未独立配菜单，剥离未命中 page 父节点 → `perms: {}`
  2. **误命中 directory**：剥离后唯一候选为 `type=directory` → `fuzzyRejected: true`、`perms` 空；URL 拦截若发生在基座，勿在子应用再拦
  3. **`/404` 仍走鉴权**：错误页参与迭代匹配，DEV 日志出现「剥离路径继续匹配: /404 → /」
  4. **只查 perm 不查 type**：用户有 role perm 但 `fuzzyRejected`，agent 仍查 `getAllowed()`
  5. **误改子应用守卫**：把注释掉的 `fuzzyRejected → next('/404')` 再打开，导致个人中心等基座白名单路由被误杀

### 涉及文件

| 文件 | 职责 |
|------|------|
| `apex_dev/src/services/permissions.ts` | `RoutePermScope`、`findMatchingNodes`、`resolveScope` 迭代剥离 + directory 拒绝（**算法正确，保留**） |
| `opsdeck/src/services/permissions.ts` | 与 apex 同口径（enum 兼容） |
| `apex_dev/src/router/index.ts` / `opsdeck/.../router` | **仅** `RoutePermDict.load(to)` + `next()`；`fuzzyRejected` 跳转代码应保持注释/删除 |
| `microfb/src/plugins/permission.ts` | **路由鉴权**：`isValidSubAppPath` / 菜单匹配 + 白名单 → `/404` |
| `apex_dev/src/directive/permission/index.ts` | `logPermAuth` 含 `类型` 字段 |

权威参考：`[[../../references/route-scope-auth-chain.md]]`

## 输入

- `异常现象`：必填（404 / 按钮全灭 / DEV warn）
- `当前 URL`：必填
- `预期父 page routePath`：可选（子路由继承场景）

## GREEN

🔴 **CHECKPOINT · 菜单命中门禁**：排障前先读 `RoutePermDict.getScope()`。若 `fuzzyRejected === true` → **停止查 role perm**，先修菜单 type/route_path。若现象是「整页基座 404」→ 先查 microfb 白名单/菜单 path，**禁止**建议子应用加守卫跳转。

### 失败兜底（if-then）

| 触发条件 | 一线修复 | 仍失败兜底 |
|---------|---------|-----------|
| 子路由按钮全灭、`perms: {}` | 查剥离是否命中 **page** 父节点 | 补父 page 的 `route_path` 或独立 page 菜单 |
| `fuzzyRejected` + DEV「目录节点拒绝」 | 命中节点 `type=directory` | 改 type=page 或调整 route_path 剥离边界 |
| 访问即基座 404（个人中心等） | 查 microfb 白名单 / 菜单 path | **不要**在子应用 `fuzzyRejected` 跳转 |
| 有 perm 仍按钮全灭 + fuzzyRejected | 先确认菜单命中，非 getAllowed | 勿查角色勾选 |
| reportA 见 reportB 按钮 | scope 命中非 leaf page 或 collectPerms 误合并 | 拆 sibling page；function 仅挂各自 page 直接子节点 |
| `/404` 仍打剥离日志 | 短路未生效 | 确认 resolveScope 对 `/404`/`/401` 提前 return |

### findMatchingNodes

```
输入：path, routeProjectMap
输出：MenuNode[]

filter map keys: key === path || key.endsWith(`-${path}`)
return 对应节点数组
```

### resolveScope 迭代流程

```
归一化 routePath（normalizeMenuRoutePath + 去 query + 合并 /）
if routePath in ['/404','/401'] → 空 scope 短路
currentPath = routePath, matchMode = 'exact'

loop:
  candidates = findMatchingNodes(currentPath, map)

  if candidates.length === 1:
    if node.type === DIRECTORY → fuzzyRejected, 空 perms, return
    else → collectPerms, return scope（含 matchedNodeType）

  if candidates.length > 1:
    params 消歧 → 唯一命中 → 同上 type 检查
    仍歧义 → ambiguous 合并 perm

  if candidates.length === 0:
    if currentPath === '/' → 空 scope
    currentPath = strip 末段（[/?:][^/?:]*$）
    matchMode = 'fuzzy'
    DEV warn: 剥离路径继续匹配
    → continue loop
```

### 路径剥离正则

```ts
currentPath.replace(/[/?:][^/?:]*$/, "") || "/"
```

保证 `/Opsdeck/project` 与 `/Opsdeck/projectManage` 不会在错误边界剥离。

### 基座路由鉴权 vs 子应用权限作用域

| 检查项 | 基座路由鉴权 | 子应用（RoutePermDict） |
|--------|-------------|------------------------|
| 入口 | `microfb` `permission.ts` | `load` → `getScope()` / `getAllowed()` |
| 失败 | 整页 `/404` | `fuzzyRejected` / 空 perms → 按钮隐藏 |
| 修复 | 菜单 path、白名单 | 菜单 type=page、父 route_path、function 挂载 |
| 反模式 | — | 子应用 `fuzzyRejected → next('/404')` |

### collectPerms 与 resolveScope 衔接

路由命中 leaf **page** 后：

```ts
const perms = {};
RoutePermDict.collectPerms(node, perms); // 仅 node 直接 function 子节点
return { ..., perms };
```

- 勿假设 map 节点 children 嵌套 page 会自动合并 sibling perm
- 详见 `[[../../template/sample-run/after-05-collectPerms-直接function子节点.md]]`

### logPermAuth 日志

| matchMode | 日志 key | 附加字段 |
|-----------|----------|---------|
| `exact` | `路由` | `类型: matchedNodeType` |
| `fuzzy` | `最长前缀路由` | `类型: matchedNodeType` |

DEV warn 关键字：

- `[RoutePermDict] 剥离路径继续匹配`
- `[RoutePermDict] 路由命中目录节点拒绝`

## 输出

排障结论模板：

- `routeAuthPass`：基座是否放行该 URL（若可知）
- `scopeHitPass`：`true` / `false`（=!fuzzyRejected 且 scope 有 page 命中）
- `matchMode` / `matchedNodeType` / `fuzzyRejected`
- `resolvedParentRoutePath`：剥离后命中的菜单 path
- `suggestedMenuFix`：如「将 function 挂到 type=page 节点」「补父 page route_path」
- `guardChangeRejected`：是否拒绝了「子应用加 `/404`」建议（应为 true）

## 反例黑名单（不要做）

| # | 反模式 | 后果 |
|---|--------|------|
| 1 | 404/按钮全灭时先查角色 perm / getAllowed | 误判为权限不足，漏修菜单 type |
| 2 | 建议恢复 `fuzzyMatchByPrefix` | 与 apex_dev canonical 算法冲突 |
| 3 | directory 节点挂 function perm | fuzzyRejected → 空 perms / 基座可能 404 |
| 4 | 假设 collectPerms DFS 合并 sibling page | reportA 误显 reportB 按钮 |
| 5 | 修复 `/404` 短路为「继续鉴权」 | DEV 无意义剥离日志、行为漂移 |
| 6 | 子路由只配 directory 不配 page 父 route_path | 剥离后 perms 空对象 |
| 7 | **在子应用 beforeEach 加 `fuzzyRejected → next('/404')`** | 误杀个人中心等基座白名单路由 |

## REFACTOR

- 若 agent 仍混淆基座路由鉴权与子应用 scope → 先问「404 还是进页后按钮全灭」
- 若 collectPerms 与 sibling 膨胀反复出现 → 引用 snapshot-05 决策树
- 若 opsdeck 与 apex_dev 行为不一致 → 对照两仓 `permissions.ts` resolveScope 同步性

## 使用示例

```text
/Opsdeck/projectManage/detail?id=PROJECT--3100 按钮全灭，
/Opsdeck/projectManage 正常。请排查子路由是否继承父 page 鉴权。
```

```text
DEV 报「路由命中目录节点拒绝」，按钮全灭，是不是要在子应用守卫 next('/404')？
```

预期：否。修菜单 type；URL 拦截归基座。

```text
resolveScope 对 /404 还在打「剥离路径继续匹配」日志，是否正常？
```
