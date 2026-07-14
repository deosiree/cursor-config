# after-03-opsdeck：路由作用域鉴权（RoutePermDict）

> opsdeck 与 apex_dev 同步口径（2026-07-08）：迭代剥离 + directory 拒绝 + collectPerms 单层。  
> 权威参考：`[[../../references/route-scope-auth-chain.md]]`  
> 源码：`opsdeck/src/services/permissions.ts`、`opsdeck/src/router/index.ts`

## 与 apex_dev 差异（仅 type 枚举）

| 概念 | apex_dev | opsdeck |
|------|----------|---------|
| 目录 | `MenuTypeEnum.DIRECTORY` = `"directory"` | `MenuTypeEnum.CATALOG` = `2` 或 `"directory"` |
| 页面 | `MenuTypeEnum.PAGE` = `"page"` | wire `3` / 稳定 `"page"` |
| 功能项 | `MenuTypeEnum.FUNCTION` | wire `4` / `"function"` |
| directory 拒绝 | `node.type === DIRECTORY` | `isDirectoryNode`（CATALOG / 2 / directory） |

算法一致；两仓守卫均为**仅 `load`**，路由 URL 鉴权归基座。

## 典型场景：子路由 detail 继承父 page

```
URL: /Opsdeck/projectManage/detail?id=PROJECT--3100
菜单: 仅配置 /Opsdeck/projectManage (type=page) + function 子节点

resolveScope:
  exact 无候选 → 剥离 → fuzzy 命中 /Opsdeck/projectManage
  collectPerms(父 page) → ops:project:view 等
  fuzzyRejected: false
```

验证（浏览器 console 或单测）：

```js
RoutePermDict.getScope();
// { matchMode: 'fuzzy', routePath: '/Opsdeck/projectManage', perms: { 'ops:project:view': [...] } }
```

## 典型场景：directory 命中（scope 失败）

```
URL: /Opsdeck/dataCenter
菜单: type=CATALOG(2) 的 dataCenter 节点

resolveScope → fuzzyRejected: true, perms: {}
子应用 beforeEach → 仍 next()（不跳转）
URL 级 404（若发生）→ microfb 菜单匹配 / 白名单
```

排障时**先查 fuzzyRejected / 基座是否放行**，勿查角色 perm；**禁止**建议子应用加 `next('/404')`。

## collectPerms 单层（reportA / reportB）

与 apex_dev 相同：命中 leaf page `/Apex/system/reportA` 时，**不会**合并 reportB 的 function perm。

每个 routable URL 需独立 `type=page` entry；function 挂 page **直接** children。

## 验证命令

```bash
cd opsdeck
pnpm run test:unit src/services/__tests__/permissions.test.ts
```

4 条用例：子路由剥离、directory 拒绝、/404 短路、sibling 不串 perm。

## 编排入口

- 新模块：`[[../../intention-skills/编排-新模块权限配置/SKILL.md]]`（`targetRepo=opsdeck`）
- 路由鉴权排障：`[[../../feature-skills/路由鉴权迭代剥离匹配/SKILL.md]]`
