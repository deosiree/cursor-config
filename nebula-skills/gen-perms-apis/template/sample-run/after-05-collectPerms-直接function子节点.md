# after-05：collectPerms 直接 function 子节点（GREEN）

> 本文件沉淀 apex_dev collectPerms 单层收集口径。  
> 权威参考：`[[../../references/route-scope-auth-chain.md]]`

## 算法

```ts
private static collectPerms(node: MenuNode, perms: Record<string, PermMeta[]>): void {
  for (const child of node.children ?? []) {
    if (!isFunctionMenuType(child.type)) continue;
    // 写入 child.perm → perms[code]
  }
}
```

非 function 子节点（page/directory）**不递归**。

## 数据流（void 就地写入）

```
resolveScope:
  const perms = {}
  collectPerms(hitNode, perms)   // 填充 perms
  return { ..., perms }

load(scope) → rebuildAllowed(scope.perms) → allowed → has(perm)
```

消费方不直接调 `collectPerms`；用 `getScope().perms` / `getAllowed()` / `checkHasPerm`。

## reportA / reportB 示例

| 命中节点 | collectPerms 结果 |
|---------|------------------|
| leaf page `/Apex/system/reportA` | `sys:reportA:view`, `sys:reportA:export` |
| 祖先 `/Apex/system`（children 为嵌套 page） | `{}`（page 子节点无 perm 字段） |

## 配置要求

1. 每个 routable URL → routeProjectMap 独立 **`type=page`** entry
2. function → page **直接** children（YAML `parent_id` = page id）
3. 勿指望祖先节点 children 嵌套 page 自动继承 perm

## 验证

```js
const scope = RoutePermDict.getScope();
console.log('hit:', scope?.routePath);
console.log('perm keys:', Object.keys(scope?.perms ?? {}));
// 键数应 ≈ 当前页 function 数，不应含 sibling page 的 perm
```

## 与 before-05 差异

| 维度 | before-05 | after-05 |
|------|-----------|----------|
| 非 function 子节点 | DFS 递归 | continue 跳过 |
| 祖先 page 命中 | sibling perm 合并 | 空或仅直接层 |
| 配置依赖 | 易掩盖缺 leaf page | 强制 leaf page entry |
