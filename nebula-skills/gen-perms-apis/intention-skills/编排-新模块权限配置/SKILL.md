---
name: 编排-新模块权限配置
description: 当需要在新模块按路由作用域方案（route_path + params + 权限标识）配置权限点、菜单补丁与源码时使用。触发词：新模块配置权限、给 XX 模块加权限点、route_path + params、RoutePermDict。
---

# 编排-新模块权限配置

## RED

- 没有本节点时，用户说「新模块配置权限」容易走旧全流程或 permsMap 时代排障口径
- 常见失败：
  - 只设计 perm code，不设计 `route_path` / `params` 消歧
  - function 挂错 page 子树，导致 `getAllowed()` 不含目标 perm
  - 菜单导入后未刷新 routeProjectMap，scope 仍为空
  - 为新模块重复改 `permissions.ts`（基础设施已就绪）
  - 排障查 `userInfo.permsMap` 而非 `RoutePermDict.getScope()`
  - 同 path 多 page 未配 params → `ambiguous=true` 按钮误显隐

## GREEN

- 本节点负责**单新模块**从分析到可验证的最短编排
- 权威参考：`[[../../references/route-scope-auth-chain.md]]`
- 执行清单：`[[../../template/new-module-perm-config-checklist.md]]`
- 样本对照：`[[../../template/sample-run/after-03-路由作用域鉴权.md]]` / `[[../../template/sample-run/mvp-03-新模块最小闭环.md]]`

### 固定序列

| 阶段 | intention / feature | 产物 |
|------|---------------------|------|
| 1. 分析 | `[[../分析-perms-apis现状]]` → `[[../../feature-skills/扫描源码权限点与API]]` | 盘点文档 |
| 2. 设计 | `[[../策略-设计权限点]]` → `[[../../feature-skills/设计权限点与API映射]]` | 三件套 + perm→API 表 |
| 3. 补丁 | `[[../../feature-skills/生成菜单树权限补丁]]` | 增量 YAML |
| 4. 导入 | `[[../../feature-skills/菜单树导入验证]]` | dry_run + 正式导入 |
| 5. 改码 | `[[../迁移-源码改动落地]]` → `[[../../feature-skills/源码集中式权限改动]]` | 源码 diff（复杂页见 `[[../../references/page-perms-static-budget.md]]`） |
| 6. 验证 | `[[../../feature-skills/权限运行时排障]]` 或 `[[../../feature-skills/OpenCLI端到端验证]]` | scope/allowed 确认 |

### 设计三件套（强制门禁）

🔴 **CHECKPOINT · 设计阶段门禁**：以下三项未齐 → **禁止**进入补丁，必须先补设计或问人：

1. **routePath** — 与前端路由及菜单 `route_path` 一致
2. **paramsDecision** — 是否需要 params 消歧及键值（见 `[[../../template/sample-run/snapshot-03-路由params消歧.md]]`）
3. **functionPermList** — 每个 perm 的 code、粒度、pageGate、管控 API

### 跨仓库说明（apex_dev / opsdeck）

| 仓库 | RoutePermDict | 菜单 enum | skill 改码默认 |
|------|--------------|-----------|---------------|
| apex_dev | 已落地（1851a7dd） | 稳定字符串 `function` | **是**（targetRepo 默认） |
| opsdeck | 已接入 RoutePermDict | wire 数字 `4` + `"function"` | **否**（除非用户显式指定） |

opsdeck 配权限仍走本编排（菜单 + 源码 v-hasPerm），但 `permissions.ts` 基础设施两边已有；opsdeck 若报 `isFunctionMenuType` 缺失 → 检查 `src/enums/system/menu.enum.ts` 是否导出该函数。

### 失败兜底（if-then）

| 触发条件 | 一线修复 | 仍失败兜底 |
|---------|---------|-----------|
| `getScope()` 为 null | 菜单正式导入 + relogin / 基座 syncMenuCache | 查 microfb 是否写入 `routeProjectMap` |
| `ambiguous: true` | 补 page `params` 与 URL 对齐 | 回退 `策略-设计权限点` 重裁决 |
| 有 role perm 但按钮不藏 | function 是否挂在**正确 page 子树** | 对照 YAML parent_id |
| 排障查 permsMap | **停止**，改查 `getAllowed()` | 读 `route-scope-auth-chain.md` |
| agent 要改 permissions.ts | **阻止**，引用源码约束 | 只改 pagePerms / v-hasPerm / 菜单树 |

### 源码约束

- perm code 必须与菜单 function `code` 一致
- **复杂页**（列表 + 行内 OpItem）：`xxxPagePerms` 静态预算 + boolean props，禁止 OpItem `:perm`（见 `[[../../references/page-perms-static-budget.md]]`）
- **简单页**（≤2 控点）：仍可用 `v-hasPerm`
- pageGate 用 `xxxPagePerms.query` + `PageNoPermission`
- **禁止**为新模块修改 `src/services/permissions.ts`
- 默认 `targetRepo=apex_dev`，不动 opsdeck

### 验证约束

导航到目标路由后检查：

```js
RoutePermDict.getScope()    // ambiguous 应为 false
RoutePermDict.getAllowed()  // 应含已授权 perm
```

**禁止**以 `userInfo.permsMap` 作为验证真相源。

## 输入契约

- `仓库路径`：必填
- `目标模块` / `route_path`：必填（如 `/Apex/foo`）
- `targetRepo`：默认 `apex_dev`
- `api契约`：可选
- `是否跳过改码`：可选，默认否
- `是否做 E2E`：可选，默认否（验证阶段用 getScope 即可）

## 输出契约

- `orchestrationGoal`
- `targetModule` / `routePath`
- `routePathParamsPlan`（三件套）
- `phaseResults`（每阶段产物路径）
- `verificationResult`（scope / allowed / ambiguous）
- `pendingHumanDecisions`
- `nextIterationAction`

## Guardrails

- 不允许跳过三件套直接进入补丁
- 不允许 function id 为 0 或 parent_id 为 null
- 不允许未正式导入菜单就宣称权限生效
- 不允许排障路径引用 permsMap 为主真相源
- 同 path 多 page 必须先裁决 params，不得默认省略

## 反例黑名单（不要做）

| # | 反模式 | 后果 |
|---|--------|------|
| 1 | 只设计 perm code，不写 route_path / params | scope 解析错误或不唯一 |
| 2 | 为新模块改 `permissions.ts` | 重复基础设施，diff 面爆炸 |
| 3 | 默认改 opsdeck 源码 | 违反 targetRepo 约束 |
| 4 | 菜单 dry_run 后直接宣称生效 | routeProjectMap 未更新 |
| 5 | 用 permsMap 验证按钮显隐 | 过期口径，排障方向错误 |
| 6 | 同 path 多 page 省略 params | ambiguous 告警，按钮误显隐 |

## REFACTOR

- 若用户同时要配置多个新模块，拆分为多次本编排或升级到 `[[../编排-权限点配置全流程]]`
- 若盘点事实不足，回退补 `[[../分析-perms-apis现状]]`
- 若 ambiguous 告警出现，回退设计阶段补 params
- 若 agent 试图改 permissions.ts，引用 `[[../../references/route-scope-auth-chain.md]]` 阻止

## 使用示例

```text
帮我在新模块 /Apex/report 按路由作用域方案配置权限点，从分析到菜单导入。
```

```text
给 /Apex/workspace 加权限，这个 path 平台端和租户端各有一个 page，靠 type 区分。
```

```text
新模块源码已改完 v-hasPerm，但按钮不显示，菜单补丁已导入，帮我按 RoutePermDict 排障。
```
