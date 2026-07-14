# 新模块权限配置清单

> 配合 `[[../references/route-scope-auth-chain.md]]` 使用。  
> 触发编排：`[[../intention-skills/编排-新模块权限配置/SKILL.md]]`

## 输入（开始前确认）

- [ ] `仓库路径`（默认 `apex_dev`）
- [ ] `目标模块` / `route_path`（如 `/Apex/foo`）
- [ ] `api契约` 路径
- [ ] `targetRepo=apex_dev`（不动 opsdeck）

## Phase A — 分析现状

- [ ] 扫描目标路由页面组件及子孙组件
- [ ] 列出已命中 `v-hasPerm` 与未命中但调用 API 的交互
- [ ] 完成三类 API 反查（gateway / 直连 api / emit 抬升）
- [ ] 产出盘点文档

**产物**：`{模块}-route-component-perm-api.md`

## Phase B — 设计权限点（三件套强制）

### B1. routePath

- [ ] 确认前端路由 path 与菜单 `route_path` 一致
- [ ] path 归一化口径与 `normalizeMenuRoutePath` 一致（无尾斜杠）
- [ ] 承载 perm 的菜单节点 **type=page**（非 directory）
- [ ] 若有 detail 等子路由，确认可剥离命中该 page（见 `snapshot-04-路由鉴权决策.md`）

### B2. paramsDecision

| 场景 | 决策 | 菜单配置 |
|------|------|---------|
| 全项目仅此一个 page 用该 path | 不需要 params | `params` 省略或 `{}` |
| 多个 page 共享同一 path | **必须** params 消歧 | 每个 page 写不同 `params` |
| URL 带固定 query（如 `?type=platform`） | params 记录 query 键值 | 与 URL 完全一致 |

- [ ] 记录 `paramsDecision` 及理由
- [ ] 若可能 ambiguous，在设计阶段预警

### B3. functionPermList

每个 perm 一行：

| 权限标识 code | 权限名称 | 粒度 | pageGate? | 管控 API |
|--------------|---------|------|-----------|---------|
| `sys:foo:view` | 查看 | page | 是 | ... |
| `sys:foo:add` | 新增 | 操作 | 否 | ... |

- [ ] pageGate（`view`/`query`）与操作级 perm 分开
- [ ] 豁免 direct/no-auth 接口
- [ ] 跨模块 API 挂在触发页面模块

**产物**：权限设计方案（含 `routePathParamsPlan`）

## Phase C — 菜单补丁

- [ ] page 节点：`route_path` + 可选 `params` + `id` + `parent_id`
- [ ] function 子节点：`code` + `type: function` + `id` + `parent_id` + `apis`
- [ ] 每个 function **先 API 查/建获取 id**，严禁 `id: 0`
- [ ] 每个节点 **parent_id 非 null**
- [ ] 先 `dry_run` 导入，再正式导入

**产物**：`{日期}菜单树_权限补丁.yaml`

## Phase D — 源码改动（targetRepo=apex_dev）

- [ ] 单元素 → `v-hasPerm="'sys:foo:action'"`
- [ ] 整块区域 → 父层 `v-if="canXxx"` + 一个 computed
- [ ] pageGate 缺失 → `PageNoPermission` 整页空态（非表格暂无数据）
- [ ] API 守卫在入口一处（`fetchData` / `handleSave` / `openDialog`）
- [ ] **不改** `src/services/permissions.ts`

**产物**：源码 diff + 改动计划

## Phase E — 同步与验证

### 菜单同步

- [ ] 导入后触发菜单缓存刷新（或用户重新登录）
- [ ] 确认 `RoutePermDict.patchMap` 已更新 `routeProjectMap`

### 运行时验证

```js
// 导航到目标路由后
RoutePermDict.getScope()   // routePath / params / ambiguous
RoutePermDict.getAllowed() // 当前页可用 perm
checkHasPerm('sys:foo:view')
```

- [ ] `ambiguous` 为 false
- [ ] `getAllowed()` 含已授权 perm
- [ ] `v-hasPerm` 按钮显隐正确
- [ ] pageGate 无 perm 时显示 `PageNoPermission`

### E2E（可选）

- [ ] admin 配置角色勾选新 perm
- [ ] test 用户 `sessionStorage.clear()` 后重新登录
- [ ] 逐页验证 + CSV 落盘

## 常见失败与修复

| 现象 | 根因 | 修复 |
|------|------|------|
| 有 perm 但按钮不显示 | scope 未含该 perm（挂错 page 子树） | 检查 function 父 page |
| 通知「当前路由不唯一」 | ambiguous，params 未配或 URL 不匹配 | 补 page params |
| allowed 为空 | routeProjectMap 无该 path | 导入菜单 + patchMap |
| 改码后仍不生效 | 未重新登录 / 未刷新菜单缓存 | relogin 或 syncMenuCacheOnly |
| 排障查 permsMap | 过期口径 | 改查 getScope/getAllowed |
| fuzzyRejected / 基座 404 / 按钮全灭 | 剥离命中 directory 或无 page 父节点 | 改菜单 type=page；**勿**改子应用守卫加 `/404`；见 after-04 |

## 最小触发示例

```text
使用 $梳理权限点与apis，帮我在新模块 /Apex/foo 按路由作用域方案配置权限点，
从分析到菜单补丁再到源码改动。
```

预期：进入 `编排-新模块权限配置`，产出三件套 + 清单逐项勾选。
