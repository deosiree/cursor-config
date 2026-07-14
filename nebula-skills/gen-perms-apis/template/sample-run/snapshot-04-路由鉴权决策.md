# snapshot-04：路由鉴权决策

> 关键决策节点：page vs directory、子路由继承、何时 404。

## 节点 type 职责

| type | 用途 | 能否挂 function perm | 路由鉴权 |
|------|------|---------------------|---------|
| `directory` | 菜单文件夹 | **否** | 命中 → fuzzyRejected |
| `page` | 可访问页面 | **是** | 命中 → 进入 collectPerms |

## 子路由继承规则

```
子 URL（未独立配菜单）
  → resolveScope 迭代剥离末段
  → 须命中 type=page 的父节点
  → matchMode=fuzzy，继承父 page 的 perms
```

**反例**：子 URL 剥离后只落到 directory → `fuzzyRejected` / 空 perms（基座或拦或不拦）；与用户是否有 role perm 无关。勿靠子应用守卫补 `/404`。

## 设计期决策表

| 问题 | 决策 |
|------|------|
| detail 页要不要单独配菜单 page？ | 可选；不配则依赖父 page 剥离继承 |
| perm 挂在 directory 下？ | **禁止**；改挂 page 子节点 |
| 列表页 route_path 用什么？ | 与前端列表路由一致，type=page |
| 只有 directory 没有 page？ | 子路由无法通过路由鉴权 |

## routeAuthPlan 输出模板

```yaml
routeAuthPlan:
  parentPageRoutePath: /Opsdeck/projectManage
  menuNodeType: page
  directoryOnlyRisk: 若仅配置 /Opsdeck 为 directory 且无 page 子节点，/Opsdeck/detail 将 fuzzyRejected
```

## 排障分流（30 秒）

1. `getScope()?.fuzzyRejected` → 路由鉴权问题 → 改菜单 type/结构
2. `matchMode==='fuzzy'` 且按钮正常 → 预期子路由继承
3. `getAllowed()` 不含 perm 且 fuzzyRejected=false → 权限鉴权问题 → function/role

## 相关

- RED：`[[before-04-路由鉴权单次模糊匹配.md]]`
- GREEN：`[[after-04-路由鉴权迭代剥离.md]]`
- Feature skill：`[[../../feature-skills/路由鉴权迭代剥离匹配/SKILL.md]]`
