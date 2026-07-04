# 路由作用域鉴权链路（RoutePermDict）

> 权威来源：`apex_dev` 提交 `1851a7dd`（2026-07-03）  
> 源码入口：[`apex_dev/src/services/permissions.ts`](../../../../Repertory/Sieyuan/nebula/apex_dev/src/services/permissions.ts)

## 核心公式

```
allowed = visiblePermSet ∩ user.permissions

visiblePermSet = 当前路由 scope 下 FUNCTION 子节点的 perm
                 且 isVisible !== false
                 且 !(isSystemOnly === true && !user.isSystem)
```

`checkHasPerm(perm)` 唯一真相源：`RoutePermDict.has(perm)`（`isOwner` 先走 `RoutePermDict.pass`）。

## 鉴权漏斗（5 步）

### 1. 路由守卫 load

`router.beforeEach` 调用 `RoutePermDict.load(to)`，解析当前页 `RoutePermScope` 并预算 `allowed` 集合。

### 2. routePath 匹配

从 `Storage.routeProjectMap` 中按 key 后缀匹配当前归一化 path：

- key 等于 `routePath`，或
- key 以 `-{routePath}` 结尾（多项目前缀）

归一化口径与 `normalizeMenuRoutePath` 一致。

### 3. params 消歧

多个候选 route 节点时，用菜单节点 `params` 与 URL `route.query` / `route.params` 逐项比对：

| 菜单 params | URL 条件 | 结果 |
|------------|---------|------|
| 空对象 | URL 也无 query/params | 命中 |
| `{ type: platform }` | URL 含 `?type=platform` 或同名动态段 | 命中 |
| 有字段但 URL 不匹配 | — | 排除 |

**无法唯一命中** → `ambiguous: true`，宽松 OR 合并全部候选 perm，并通知管理员检查菜单配置。

### 4. collectPerms

DFS 遍历命中 route 节点子树，收集 `type=function` 节点的 `perm`（支持 string 或 string[]）及 `isVisible` / `isSystemOnly` meta。

### 5. rebuildAllowed

过滤 `visiblePermSet` 后与 `user.permissions` 取交集，写入 `allowed` Set。`checkHasPerm` / `v-hasPerm` 均为 O(1) `Set.has`。

## 公开 API

| 方法 | 用途 |
|------|------|
| `RoutePermDict.load(route, userInfo?)` | 路由守卫入口，解析 scope + 预算 allowed |
| `RoutePermDict.has(requiredPerms, userInfo?)` | `checkHasPerm` 真相源 |
| `RoutePermDict.pass(user?)` | `isOwner` 后门 |
| `RoutePermDict.patchMap(menuTree)` | 菜单 CRUD / 缓存同步后更新 routeProjectMap |
| `RoutePermDict.getScope()` | 调试：当前 routePath / params / ambiguous / perms |
| `RoutePermDict.getAllowed()` | 调试：当前页 allowed perm 集合 |

## 与菜单树字段映射

| 菜单树字段 | RoutePermDict 用途 |
|-----------|-------------------|
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

1. **每个业务 page** 在菜单树中有唯一可解析的 `route_path`（+ 必要时 `params`）
2. **每个 perm** 作为该 page 下 function 子节点的 `code`
3. **源码** 用相同 `code` 挂 `v-hasPerm`；pageGate 用 `checkHasPerm`
4. **不要**为新模块改 `permissions.ts`（基础设施已就绪）
5. **排障** 查 `getScope()` / `getAllowed()`，不要查 `userInfo.permsMap`

## opsdeck 对齐说明

`opsdeck` 已接入 `RoutePermDict`（与 apex_dev 同 `permissions.ts` 链路），但菜单 enum 模型不同：

| 项 | apex_dev | opsdeck |
|----|----------|---------|
| function 类型 | 稳定字符串 `"function"` | wire 数字 `4` 或 `"function"` |
| `isFunctionMenuType` | `menu.enum.ts` 完整导出 | 须导出兼容函数（见 opsdeck `src/enums/system/menu.enum.ts`） |
| skill 默认改码 target | apex_dev | 不默认改 opsdeck |
| 菜单缓存 patchMap | `menu-cache-refresh.ts` | 依赖基座写入 routeProjectMap |

opsdeck 报 `isFunctionMenuType` 导出缺失 → 补 enum  helper，**不要**改 `permissions.ts` 业务逻辑。

## 迁移说明（历史对比）

改造前（`before-03`）：

```
checkHasPerm = user.permissions 命中
            + userInfo.permsMap[perm].isVisible / isSystemOnly（全局扁平）
```

改造后：

```
checkHasPerm = RoutePermDict.pass(isOwner)
            || RoutePermDict.has(perm)  // 当前路由 scope 下的 allowed
```

`userInfo.permsMap` **不再**是 `checkHasPerm` 真相源。排障/E2E 文档中若仍写 permsMap 为主路径，视为过期口径。

## DEV 调试

```js
// 需在 apex_dev 页面控制台，且已 navigate 到目标路由
import { RoutePermDict } from '@/services/permissions';

console.log('scope:', RoutePermDict.getScope());
console.log('allowed:', RoutePermDict.getAllowed() ? [...RoutePermDict.getAllowed()] : null);

// 检查 ambiguous
console.log('ambiguous:', RoutePermDict.getScope()?.ambiguous);
```

若 `scope` 为 null 或 `allowed` 为空但 `user.permissions` 含目标 perm：

1. 检查 `routeProjectMap` 是否有当前 path 的 route 节点
2. 检查 function 是否挂在该 page 子树下（不是挂错 page）
3. 多候选时检查 page `params` 是否与 URL 一致
4. 检查 function `is_visible` / `is_system_only`

## 相关文档

- `[[new-module-perm-config-checklist.md]]`（上级 template/）
- `[[perm-runtime-debugging.md]]`
- `[[menu-yaml-spec.md]]`
- `[[../template/sample-run/after-03-路由作用域鉴权.md]]`
