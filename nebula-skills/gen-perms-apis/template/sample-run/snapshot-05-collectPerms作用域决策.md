# snapshot-05：collectPerms 作用域决策

> 区分「菜单 YAML page 子树」与「运行时 collectPerms 作用域」。

## 术语对照

| 术语 | 含义 | 用于 |
|------|------|------|
| **page 子树**（菜单 YAML） | function 的 `parent_id` 归属哪棵 page | 补丁设计、parent_id 校验 |
| **collectPerms 作用域** | 命中 route 节点的**直接** function 子节点 | runtime `scope.perms` |

二者**不等价**：YAML 上 function 挂在 page A 下，但若 scope 命中祖先节点，旧 DFS 会把 sibling page 的 function 也收进来；现算法只收直接 function。

## 设计决策

| 问题 | 决策 |
|------|------|
| 每个 URL 要不要独立 page entry？ | **要**（leaf page in routeProjectMap） |
| function 挂 directory 下？ | **禁止**；挂 page 直接子级 |
| 只靠祖先 path 继承 sibling perm？ | **禁止**；靠 resolveScope 命中 leaf page |

## routeAuthPlan 扩展字段

```yaml
routeAuthPlan:
  leafPageEntryRequired: true
  leafPageRoutePath: /Apex/system/reportA
  functionPlacement: direct_child_of_page
```

## 排障 30 秒（allowed 偏大）

1. `getScope().routePath` — 是 leaf page 还是祖先 path？
2. `Object.keys(scope.perms).length` — 是否 > 当前页 function 数？
3. routeProjectMap 是否有该 URL 的独立 page key？
4. function `parent_id` 是否指向正确 page？

## 相关

- RED：`[[before-05-collectPerms-DFS-sibling膨胀.md]]`
- GREEN：`[[after-05-collectPerms-直接function子节点.md]]`
- 路由鉴权：`[[snapshot-04-路由鉴权决策.md]]`
