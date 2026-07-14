# after-04：路由鉴权迭代剥离（GREEN）

> 本文件沉淀 apex_dev resolveScope 重构后的口径，并对齐「路由 URL 鉴权归基座」。  
> 对应 write-skill「真实历史样本型模板 — 基于 GREEN 写 after」。  
> 权威参考：`[[../../references/route-scope-auth-chain.md]]`

## 双层顺序（基座 + 子应用）

```
[基座 microfb]
  beforeEach → 菜单 routePath / 白名单 → 非法 next('/404')

[子应用]
  beforeEach → RoutePermDict.load(to) → resolveScope
            → fuzzyRejected 时 perms 为空（不跳转）
            → rebuildAllowed → checkHasPerm / v-hasPerm
```

## resolveScope 迭代剥离

```
归一化 path → /404|/401 短路
loop:
  findMatchingNodes(currentPath)
  1 候选 → type=directory? fuzzyRejected : collectPerms
  多候选 → params 消歧 → 同上
  0 候选 → strip 末段 [/?:][^/?:]*$ → matchMode=fuzzy → loop
  到 / 仍无 → 空 scope
```

## RoutePermScope 新增字段

| 字段 | 示例 | 含义 |
|------|------|------|
| `matchMode` | `'fuzzy'` | 经剥离后命中 |
| `matchedNodeType` | `'page'` | 命中节点 type |
| `fuzzyRejected` | `true` | 未命中合法 page（诊断用；子应用不据此 `/404`） |

## 子应用守卫（权威写法）

```ts
// apex_dev/src/router/index.ts（opsdeck 同口径）
RoutePermDict.load(to);
// 子应用不知道菜单白名单（如个人中心），所以改为基座鉴权
// 禁止写：if (RoutePermDict.getScope()?.fuzzyRejected) next("/404")
next();
```

## 示例子路由继承（预期通过）

| 访问 URL | 菜单 page | resolveScope 结果 |
|---------|----------|------------------|
| `/Opsdeck/projectManage/detail?id=x` | `/Opsdeck/projectManage` (type=page) | matchMode=fuzzy, perms 来自父 page |

DEV 日志：

```
[RoutePermDict] 剥离路径继续匹配: /Opsdeck/projectManage/detail → /Opsdeck/projectManage
```

## 示例 directory 拒绝（scope 失败）

| 访问 URL | 剥离后命中 | 结果 |
|---------|-----------|------|
| `/Opsdeck/unknown/detail` | directory `/Opsdeck` | fuzzyRejected；perms={}；URL 是否 404 由**基座**菜单匹配决定 |

DEV 日志：

```
[RoutePermDict] 路由命中目录节点拒绝: /Opsdeck/unknown/detail → /Opsdeck(directory)
```

## logPermAuth

fuzzy 命中时 DEV 输出：

```
[perm:checkHasPerm] {
  最长前缀路由: { 路径: "/Opsdeck/projectManage", 参数: {}, 类型: "page" },
  ...
}
```

## 新模块配置说明

- **仍不改** `permissions.ts` 做业务模块接入
- 设计菜单时必须保证 **type=page** 且子路由可剥离命中
- **不要**为「路由鉴权」去改子应用 `router/index.ts` 加 `/404`
- 排障入口：`[[../../feature-skills/路由鉴权迭代剥离匹配/SKILL.md]]`

## 与 before-04 差异

| 维度 | before-04 | after-04（现行） |
|------|-----------|-----------------|
| 匹配 | 单次 fuzzyMatchByPrefix | 迭代剥离 + findMatchingNodes |
| type 检查 | 无 | directory → fuzzyRejected |
| URL 拦截 | 无 / 曾误放子应用 | **基座** menu path + 白名单 |
| 子应用守卫 | — | 仅 `load`，不加 `fuzzyRejected → /404` |
| /404 短路 | 无 | resolveScope 短路（防日志噪音） |
| collectPerms | DFS 跨 page 边界 | 仅直接 function 子节点 |
| 鉴权层次 | 仅 perm | 基座路由 + 子应用权限作用域 |
