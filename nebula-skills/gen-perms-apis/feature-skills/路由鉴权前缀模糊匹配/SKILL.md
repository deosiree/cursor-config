---
name: 路由鉴权前缀模糊匹配
description: 当精确匹配与后缀匹配均无候选时，对 routeProjectMap 做最长前缀模糊匹配回退（fuzzyMatchByPrefix），使子路由可继承父路由鉴权；命中后走现有 params 消歧与 ambiguous 兜底流程，并通过 matchMode 标记供 logPermAuth 动态切换日志标签。
---

# 路由鉴权前缀模糊匹配

## RED

- 没有本 skill 时，`resolveScope` 在精确/后缀匹配无候选后直接返回空 scope，子路由鉴权失败。
- 典型场景：`/Opsdeck/projectManage/detail?id=PROJECT--3100` 是 `/Opsdeck/projectManage` 的子路由，但未独立配置为菜单节点 → `candidates.length === 0` → 返回 `{ perms: {} }` → 页面按钮全被隐藏。
- 风险：若模糊匹配策略不当（如命中过短的前缀 `/`），可能误授权。

### 涉及文件

| 文件 | 关键行 | 职责 |
|------|--------|------|
| `opsdeck/src/services/permissions.ts` | L220–241 | `fuzzyMatchByPrefix` 最长前缀匹配 |
| `opsdeck/src/services/permissions.ts` | L267–285 | `resolveScope` 回退接入 + DEV warn |
| `opsdeck/src/services/permissions.ts` | L22–31 | `RoutePermScope.matchMode` 字段 |
| `opsdeck/src/services/permissions.ts` | L292–299, L333–343, L378–385 | return scope 携带 `matchMode` |
| `opsdeck/src/directive/permission/index.ts` | L38–46 | `logPermAuth` 动态标签 |

## 输入

- `异常现象`：必填（如"子路由页面按钮全部消失"）
- `当前 URL`：必填
- `父路由 path`：必填（预期的父菜单节点 routePath）

## GREEN

### fuzzyMatchByPrefix 算法

```
输入：routePath（归一化后的当前路由 path）, map（routeProjectMap）
输出：最长前缀匹配的 MenuNode 候选数组；无命中返回 []

遍历 Object.values(map):
  nodePath = normalize(node.routePath)
  skip if nodePath === "/" || nodePath === routePath
  if routePath.startsWith(nodePath + "/"):
    if nodePath.length > bestLen → 重置 best = [node], bestLen = nodePath.length
    else if nodePath.length === bestLen → best.push(node)
返回 best
```

关键行为：
- 跳过 `/`（防止所有路由都模糊命中根节点）
- 跳过与当前 routePath 完全相同的节点（精确匹配已在前面处理）
- 取 **最长前缀**：`/Opsdeck/projectManage` > `/Opsdeck`（越具体越优先）
- 等长前缀全部收集：如两个项目都配置了同一 path，两个候选都会保留

### resolveScope 接入流程

```
精确匹配 + 后缀匹配（key === routePath || key.endsWith("-" + routePath)）
  └─ candidates.length > 0 → matchMode = 'exact'，走单候选/多候选消歧
  └─ candidates.length === 0
       └─ fuzzyMatchByPrefix(routePath, map)
            └─ fuzzy.length === 0 → 返回空 scope（无权限）
            └─ fuzzy.length > 0
                 ├─ DEV: console.warn 标记模糊命中
                 ├─ matchMode = 'fuzzy'
                 ├─ candidates = fuzzy
                 └─ 继续走单候选 / params 消歧 / ambiguous 兜底
```

### logPermAuth 日志格式

| matchMode | 日志 key | value |
|-----------|----------|-------|
| `'exact'` 或 undefined | `路由` | `{ 路径, 参数 }` |
| `'fuzzy'` | `最长前缀路由` | `{ 路径, 参数 }` |

DEV 环境示例输出：
```
[perm:checkHasPerm] {
  鉴权耗时: "0.123ms",
  最长前缀路由: { 路径: "/Opsdeck/projectManage", 参数: {} },
  ...
}
```

## 输出

- `matchMode`：`'exact'` | `'fuzzy'`
- `routePath`：命中的菜单节点路径（fuzzy 时为父路由 path）
- `params`：消歧后的 params
- `ambiguous`：是否多候选且无法唯一区分
- `perms`：收集到的权限码集合
- DEV console.warn（fuzzy 命中时）

## REFACTOR

- 若前缀匹配误命中过短的路径（如 `/Opsdeck` 而非 `/Opsdeck/projectManage`），检查 `fuzzyMatchByPrefix` 是否跳过了 `/` 以及最长前缀逻辑是否生效
- 若 map 规模增大导致遍历性能问题，可考虑预建前缀树（Trie），当前 map 规模（< 100 节点）线性遍历足够
- 若需要支持多级前缀（如 `/Opsdeck/projectManage/detail` → `/Opsdeck/projectManage` → `/Opsdeck` 链式回退），当前只做单级最长前缀匹配，需扩展为递归回退
- 若 `logPermAuth` 需要在 ambiguous 场景展示候选列表，scope 需新增 `candidates` 字段

## 使用示例

```text
/Opsdeck/projectManage/detail?id=PROJECT--3100 页面的按钮全部消失了，
但 /Opsdeck/projectManage 页面按钮正常。请排查是否路由鉴权未命中父路由。
```

```text
DEV 控制台看到了 "[RoutePermDict] 前缀模糊匹配命中" 的 warn，
但命中的父路由不是我预期的那个，帮我检查为什么。
```
