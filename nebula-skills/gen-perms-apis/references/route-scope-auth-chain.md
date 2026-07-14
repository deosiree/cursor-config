# 路由作用域鉴权链路（RoutePermDict）

> 权威来源：`apex_dev` 提交 `1851a7dd`（路由作用域）+ 2026-07 路由鉴权迭代剥离重构 + 基座接管路由鉴权  
> 源码入口：[`apex_dev/src/services/permissions.ts`](../../../../Repertory/Sieyuan/nebula/apex_dev/src/services/permissions.ts)  
> opsdeck 同步：[`opsdeck/src/services/permissions.ts`](../../../../Repertory/Sieyuan/nebula/opsdeck/src/services/permissions.ts)（2026-07-08 迭代剥离对齐）  
> 子应用守卫：[`apex_dev/src/router/index.ts`](../../../../Repertory/Sieyuan/nebula/apex_dev/src/router/index.ts)（仅 `load`，不做 `/404`）  
> 基座路由鉴权：[`microfb/src/plugins/permission.ts`](../../../../Repertory/Sieyuan/nebula/microfb/src/plugins/permission.ts)

## 职责拆分（基座 vs 子应用）

| 层 | 职责 | 做法 | 禁止 |
|----|------|------|------|
| **microfb 基座** | **路由鉴权**（能否进该 URL） | `isValidSubAppPath` / 菜单 routePath 匹配 + 白名单（如 `/Apex/profile`）；失败 `next('/404')` | 不要假设子应用会再拦一层 |
| **子应用**（apex_dev / opsdeck） | **权限作用域预算** | `beforeEach` 只调 `RoutePermDict.load(to)`，供 `checkHasPerm` / `v-hasPerm` | **不要**再写 `fuzzyRejected → next('/404')` |
| **permissions.ts** | resolveScope / collectPerms 算法 | 迭代剥离、directory → `fuzzyRejected`、collectPerms 单层 | 新模块业务接入时仍不改此文件 |

**原因**（源码注释口径）：子应用不知道菜单白名单（如个人中心），路由级 404 由基座统一做。

`fuzzyRejected` **仍然正确且有用**：表示当前 URL 未命中合法 page（菜单设计问题）→ `perms` 为空、按钮全灭；只是**拦截跳转不在子应用守卫**。

## 路由鉴权 vs 权限鉴权

| 层次 | 问题 | 真相源 | 失败表现 |
|------|------|--------|---------|
| **路由鉴权** | 当前 URL 能否进入（菜单/白名单）？ | 基座 `permission.ts`；诊断可辅看子应用 `fuzzyRejected` / `matchedNodeType` | 基座 `next('/404')`；子应用侧常见 `perms` 为空 / 按钮全灭 |
| **权限鉴权** | 用户在当前 scope 下是否拥有 perm？ | `RoutePermDict.has(perm)` → `allowed` | 按钮隐藏 / `PageNoPermission` |

**顺序**：先路由鉴权（基座），后权限鉴权（子应用 scope）。菜单 type/结构错误时，`fuzzyRejected` 与空 `perms` 仍是排障主信号。

## 核心公式（权限鉴权层）

```
allowed = visiblePermSet ∩ user.permissions

visiblePermSet = 命中 route 节点**直接** function 子节点的 perm
                 且 isVisible !== false
                 且 !(isSystemOnly === true && !user.isSystem)
```

`checkHasPerm(perm)` 唯一真相源：`RoutePermDict.has(perm)`（`isOwner` 先走 `RoutePermDict.pass`）。

## RoutePermScope 字段

| 字段 | 含义 |
|------|------|
| `routePath` | 命中的菜单节点 path（fuzzy 时为剥离后命中的父 page path） |
| `params` | 消歧后的 params |
| `ambiguous` | 多候选且无法唯一消歧 |
| `perms` | 收集到的 perm → meta 映射 |
| `visiblePermSet` | load 时预计算的可见 perm 集合 |
| `matchMode` | `exact`（首段 path 即命中）/ `fuzzy`（经剥离后命中） |
| `matchedNodeType` | 命中节点 type（`page` / `directory` 等） |
| `fuzzyRejected` | 命中 directory / 路由鉴权语义失败；`perms` 为空；**子应用不据此跳转**，基座负责 URL 拦截 |

## 鉴权漏斗（7 步）

### 0. path 归一化

- 取 `route.path`，剥离 query（`split('?')[0]`）
- 调用 `normalizeMenuRoutePath`
- 合并连续 `/`、去掉末尾 `/`（根路径保留 `/`）

### 1. 子应用守卫：仅 load（不做路由 404）

子应用 `router.beforeEach` **只**调用 `RoutePermDict.load(to)`，解析 `RoutePermScope` 并预算 `allowed`，然后 `next()`。

```ts
// apex_dev / opsdeck 现行口径（权威）
router.beforeEach((to, _from, next) => {
  RoutePermDict.load(to);
  // 子应用不知道菜单白名单（如个人中心），所以改为基座鉴权
  // 禁止恢复：if (scope?.fuzzyRejected) next("/404")
  next();
});
```

**基座路由鉴权**（`microfb/src/plugins/permission.ts`）：登录态校验后，用菜单缓存 routePath + 子应用白名单判断路径是否合法；非法 → `next("/404")`。

### 1.5. 错误页短路

`routePath === '/404'` 或 `'/401'` → 直接返回空 scope，**不参与**菜单鉴权迭代。

### 2. 迭代匹配环（resolveScope 核心）

从完整 `routePath` 开始循环，每轮调用 `findMatchingNodes(currentPath, map)`：

```
findMatchingNodes(path, map):
  keys = map 中 key === path 或 key.endsWith(`-${path}`)
  return keys 对应的 MenuNode[]
```

| 候选数 | 行为 |
|--------|------|
| 1 | → Step 2a（type 检查）→ Step 4 |
| >1 | → Step 3 params 消歧 → 唯一则 Step 2a → Step 4；否则 ambiguous 合并 |
| 0 | → Step 2b 剥离末段路径，`matchMode = 'fuzzy'`，回到 Step 2 |
| 剥离到 `/` 仍无候选 | → 返回空 scope |

**路径剥离**（Step 2b）：

```ts
currentPath = currentPath.replace(/[/?:][^/?:]*$/, "") || "/";
```

分隔符 `/`、`?`、`:` 保证 `/Opsdeck/project` 不会误剥离成 `/Opsdeck/projectManage` 的前缀。

### 2a. directory 节点拒绝（路由鉴权）

单候选或 params 消歧后唯一候选时，若 `node.type === MenuTypeEnum.DIRECTORY`：

- 设置 `fuzzyRejected: true`、`matchedNodeType`
- 返回空 `perms`（不进入 collectPerms）
- DEV：`[RoutePermDict] 路由命中目录节点拒绝`

**设计含义**：directory 是菜单文件夹，不承载 page 级 perm；子 URL 不能只靠 directory 前缀通过路由鉴权。

### 3. params 消歧

多个候选 route 节点时，用菜单节点 `params` 与 URL `route.query` / `route.params` 逐项比对：

| 菜单 params | URL 条件 | 结果 |
|------------|---------|------|
| 空对象 | URL 也无 query/params | 命中 |
| `{ type: platform }` | URL 含 `?type=platform` 或同名动态段 | 命中 |
| 有字段但 URL 不匹配 | — | 排除 |

**无法唯一命中** → `ambiguous: true`，OR 合并各 candidate **直接** function perm，并通知管理员检查菜单配置。

### 4. collectPerms

仅收集命中 route 节点**直接** `type=function` 子节点的 `perm` 及 `isVisible` / `isSystemOnly` meta。**不**跨 page/directory 边界向下 DFS，避免祖先节点（如 `/Apex/system`）误合并 sibling page（reportA/reportB）的全部 function perm。

**就地写入（void 函数）**：

```ts
const perms: Record<string, PermMeta[]> = {};
RoutePermDict.collectPerms(node, perms); // 往 perms 对象里填，无 return
return { ..., perms, ... };              // 同一对象进入 scope.perms
// load → rebuildAllowed 读 scope.perms → allowed → has()
```

**反例（旧 DFS 时代）**：

| 访问 URL | 命中节点 | 旧 collectPerms | 现 collectPerms |
|---------|---------|--------------|----------------|
| `/Apex/system/reportA` | 祖先 `/Apex/system`（children 含 reportA+reportB page） | 合并 reportA+reportB 全部 function | 空（page 子节点无 perm 字段） |
| `/Apex/system/reportA` | leaf page `/Apex/system/reportA` | 仅 reportA function | 仅 reportA function（不变） |

**配置要求**：每个可访问 URL 须在 routeProjectMap 有独立 **`type=page`** entry；function 须为该 page 的**直接**子节点（YAML `parent_id` 指向 page id）。

### 5. rebuildAllowed

过滤 `visiblePermSet` 后与 `user.permissions` 取交集，写入 `allowed` Set。

### 6. 路由拦截落点（基座，非子应用）

URL 级 404 由 **microfb** 守卫完成。子应用侧 `fuzzyRejected` 只影响 scope/perms（按钮、pageGate），**不要**在子应用再加 `next('/404')`。

## 公开 API

| 方法 | 用途 |
|------|------|
| `RoutePermDict.load(route, userInfo?)` | 路由守卫入口，解析 scope + 预算 allowed |
| `RoutePermDict.has(requiredPerms, userInfo?)` | `checkHasPerm` 真相源 |
| `RoutePermDict.pass(user?)` | `isOwner` 后门 |
| `RoutePermDict.patchMap(menuTree)` | 菜单 CRUD / 缓存同步后更新 routeProjectMap |
| `RoutePermDict.getScope()` | 调试：routePath / params / ambiguous / perms / matchMode / matchedNodeType / fuzzyRejected |
| `RoutePermDict.getAllowed()` | 调试：当前页 allowed perm 集合 |

## 设计期 checklist（路由鉴权 + collectPerms）

1. **function perm 只挂在 page 节点下**，不在 directory 上挂 function
2. **function 为 page 直接子节点**（非跨层挂在 directory 下）
3. **每个 routable URL 有独立 leaf page entry**（如 `/Apex/system/reportA`），勿只配祖先 path
4. **子路由**（detail 等）须能剥离命中 **page** 父节点，不能只落到 directory
5. 菜单 YAML 明确 `type: page | directory`
6. page 的 `route_path` 与子路由前缀一致
7. 新模块仍**不改** `permissions.ts`；排障见 `[[../feature-skills/路由鉴权迭代剥离匹配/SKILL.md]]` 与 `[[../template/sample-run/snapshot-05-collectPerms作用域决策.md]]`

## 与菜单树字段映射

| 菜单树字段 | RoutePermDict 用途 |
|-----------|-------------------|
| page.`type` | `page` 可承载 perm；`directory` 命中 → fuzzyRejected |
| page.`route_path` | 写入 routeProjectMap key，匹配当前 URL path |
| page.`params` | 多 page 同 path 时消歧（对象 / 数组 / JSON 字符串） |
| function.`code` | 权限标识，进入 scope.perms |
| function.`is_visible` | 过滤 visiblePermSet |
| function.`is_system_only` | 非平台租户时排除 |
| function.`apis` | 后端 API 登记（不参与前端 has 计算） |

### params 格式（与 parseMenuParams 对齐）

```yaml
# 对象
params:
  type: platform

# 数组（菜单表单常见）
params:
  - key: type
    value: platform

# JSON 字符串
params: '{"type":"platform"}'
```

## routeProjectMap 维护

| 时机 | 动作 |
|------|------|
| 登录后菜单加载 | 基座/子应用写入 `Storage.routeProjectMap` |
| 菜单管理 CRUD | `RoutePermDict.patchMap(menuTree)` |
| `syncMenuCacheOnly` | 拉取菜单树后 `writeMenuCache` + `patchMap` |

菜单补丁导入成功后，用户需**重新登录或触发菜单缓存刷新**，否则 scope 可能仍为旧树。

## 新模块配置要点

1. **每个业务 page** 在菜单树中有唯一可解析的 `route_path`（+ 必要时 `params`），且 **type=page**
2. **每个 perm** 作为该 page 下 function 子节点的 `code`
3. **源码** 用相同 `code` 挂 `v-hasPerm`；pageGate 用 `checkHasPerm`
4. **不要**为新模块改 `permissions.ts`（基础设施已就绪）
5. **排障** 先查 `fuzzyRejected` / `matchedNodeType`，再查 `getAllowed()`；不要查 `userInfo.permsMap`

## opsdeck 对齐说明

`opsdeck` 已接入 `RoutePermDict`（与 apex_dev 同 `permissions.ts` 链路），但菜单 enum 模型不同：

| 项 | apex_dev | opsdeck |
|----|----------|---------|
| function 类型 | 稳定字符串 `"function"` | wire 数字 `4` 或 `"function"` |
| `isFunctionMenuType` | `menu.enum.ts` 完整导出 | 须导出兼容函数（见 opsdeck `src/enums/system/menu.enum.ts`） |
| skill 默认改码 target | apex_dev | 不默认改 opsdeck |
| 菜单缓存 patchMap | `menu-cache-refresh.ts` | 依赖基座写入 routeProjectMap |

opsdeck 报 `isFunctionMenuType` 导出缺失 → 补 enum helper，**不要**改 `permissions.ts` 业务逻辑。

## 迁移说明（历史对比）

改造前（`before-03`）：

```
checkHasPerm = user.permissions 命中
            + userInfo.permsMap[perm].isVisible / isSystemOnly（全局扁平）
```

改造后（after-03 + 基座路由鉴权）：

```
[基座 microfb]
  beforeEach → 菜单/白名单路径校验 → 非法 next('/404')

[子应用 apex/opsdeck]
  beforeEach → RoutePermDict.load → resolveScope（迭代剥离 + directory 拒绝）
           → fuzzyRejected 时 perms 为空（不 next('/404')）
           → checkHasPerm = RoutePermDict.pass(isOwner) || RoutePermDict.has(perm)
```

`userInfo.permsMap` **不再**是 `checkHasPerm` 真相源。排障/E2E 文档中若仍写 permsMap 为主路径，或要求子应用守卫加 `fuzzyRejected → /404`，视为过期口径。

## DEV 调试

```js
// 需在 apex_dev 页面控制台，且已 navigate 到目标路由
import { RoutePermDict } from '@/services/permissions';

const scope = RoutePermDict.getScope();
console.log('scope:', scope);
console.log('allowed:', RoutePermDict.getAllowed() ? [...RoutePermDict.getAllowed()] : null);
console.log('fuzzyRejected:', scope?.fuzzyRejected);
console.log('matchedNodeType:', scope?.matchedNodeType);
console.log('matchMode:', scope?.matchMode);
console.log('ambiguous:', scope?.ambiguous);
console.log('perms keys:', Object.keys(scope?.perms ?? {}));
// 对比：当前页菜单 function 数量 vs scope.perms 键数（偏大 → 可能命中祖先节点）
```

`logPermAuth`（`directive/permission/index.ts`）在 DEV 输出含 `类型: matchedNodeType`；fuzzy 时标签为 `最长前缀路由`。

### 排障分流

| 现象 | 先查 | 结论 |
|------|------|------|
| 访问即 404 | 基座 `isValidSubAppPath` / 菜单白名单；辅查子应用 `fuzzyRejected` | 路由鉴权在基座；菜单 type/结构或白名单缺失 |
| 能进页但按钮全灭 + `fuzzyRejected` | `matchedNodeType` / 菜单 type | directory 命中等 → 改菜单；**勿**给子应用加 `/404` 守卫 |
| 子路由按钮全灭 | `matchMode` + `routePath` | 是否剥离命中 page 父节点 |
| 有 perm 但按钮不藏 | `getAllowed()` | 权限鉴权层 → function 挂载 / role |
| allowed 偏大 / sibling 按钮误显 | `scope.routePath` + `Object.keys(scope.perms)` | 是否命中 leaf page；见 snapshot-05 |
| `/404` 页鉴权日志噪音 | routePath 短路 | 预期行为，无需修复 |

## 相关文档

- `[[../feature-skills/路由鉴权迭代剥离匹配/SKILL.md]]`
- `[[new-module-perm-config-checklist.md]]`（上级 template/）
- `[[perm-runtime-debugging.md]]`
- `[[menu-yaml-spec.md]]`
- `[[../template/sample-run/after-03-路由作用域鉴权.md]]`
- `[[../template/sample-run/after-04-路由鉴权迭代剥离.md]]`
- `[[../template/sample-run/snapshot-04-路由鉴权决策.md]]`
- `[[../template/sample-run/before-05-collectPerms-DFS-sibling膨胀.md]]`
- `[[../template/sample-run/after-05-collectPerms-直接function子节点.md]]`
- `[[../template/sample-run/snapshot-05-collectPerms作用域决策.md]]`
