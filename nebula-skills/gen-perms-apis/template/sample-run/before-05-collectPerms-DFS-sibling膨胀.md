# before-05：collectPerms DFS sibling perm 膨胀（RED）

> 本文件沉淀 collectPerms 改造前口径。  
> 对应 write-skill「真实历史样本型模板 — 基于 RED 写 before」。  
> 已被 `after-05-collectPerms-直接function子节点.md` 取代。

## 旧算法

```ts
for (const child of node.children) {
  if (isFunctionMenuType(child.type)) {
    // 收集 child.perm
  } else {
    RoutePermDict.collectPerms(child, perms); // ← 跨 page 边界 DFS
  }
}
```

## 典型菜单结构

```
/Apex/system (page 或 directory，map 中带整棵 children)
├── reportA (page)
│   ├── sys:reportA:view (function)
│   └── sys:reportA:export (function)
└── reportB (page)
    ├── sys:reportB:view (function)
    └── sys:reportB:delete (function)
```

## 失败场景

| 访问 URL | resolveScope 命中 | 旧 collectPerms 结果 | 用户感知 |
|---------|------------------|---------------------|---------|
| `/Apex/system/reportA` | 祖先 `/Apex/system`（reportA 未单独进 map） | reportA + reportB 全部 function | reportA 页能看到 reportB 按钮 |
| `/Apex/system/reportA` | leaf `/Apex/system/reportA` | 仅 reportA function | 正常 |

## 与路由鉴权层混淆

- `fuzzyRejected` 可挡 **directory** 祖先，但挡不住 **page 祖先嵌套多子 page**
- 排障易误判为「role 给了过多 perm」，实际是 **scope.perms 收集范围过大**

## 迁移指向

- GREEN：`[[after-05-collectPerms-直接function子节点.md]]`
- 决策：`[[snapshot-05-collectPerms作用域决策.md]]`
- 权威：`[[../../references/route-scope-auth-chain.md]]`
