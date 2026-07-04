---
name: 梳理权限点与apis
description: 梳理页面/组件/权限点与 API，设计权限点、菜单补丁、源码改动、页面无权限空态、路由作用域鉴权（RoutePermDict）、OpenCLI 端到端与菜单 E2E 验证。触发词：梳理权限点、gen-perms-apis、新模块配置权限、RoutePermDict、PageNoPermission、页面无权限空态、菜单管理e2e、权限E2E。父 agent 负责路由与人工门禁。
---

# 梳理权限点与 APIs（Agent Skill 总入口）

## RED

- 没有这个父 agent 时，用户会把"分析现状、设计权限点、生成菜单补丁、改源码、端到端验证"混在一次请求里
- agent 容易直接跳到某个功能节点，跳过 `analysis_required` 判断
- 常见失败：
  - 在盘点文档还没产出时就设计权限点
  - 在权限设计还没确认时就生成菜单补丁
  - 把需要多轮人工确认的问题压成一次性执行
  - 把需要端到端验证的问题收缩成只改源码
  - 漏掉 `targetRepo` 默认约束，错误改动 opsdeck
  - 复杂页撒 `v-hasPerm` 或 OpItem `:perm` 二次鉴权，同一 perm 调用几十次
  - 新模块只设计 perm code，不设计 `route_path` / `params` 消歧
  - 排障仍查 `userInfo.permsMap` 而非 `RoutePermDict.getScope()`
  - 菜单导入后未刷新 routeProjectMap，scope 为空导致按钮不显示

## 适用场景

- 需要盘点某个仓库的路由、组件、`v-hasPerm` 与真实 API 调用
- 已有盘点结果，需要设计新的权限点与 API 映射
- 需要生成增量菜单树 YAML 补丁
- 需要按集中式原则改动源码（复杂页 pagePerms 静态预算；简单页 v-hasPerm）
- 缺页面门控 perm 时需 `PageNoPermission` 整页空态（禁止表格「暂无数据」冒充无权限）
- 需要通过 SSH + OpenCLI 做端到端权限验证
- 需要通过 OpenCLI 双会话（admin 配置角色 + 测试用户验证）做自动化权限 E2E 测试，结果落盘 CSV
- 权限运行时异常需要排障（isOwner / computed 缓存 / 登录时序）
- 任务需要多轮推进，而不是一次性固定走完整条链
- 需要按默认 6 模块对比菜单树与源码 API 缺口（个人中心除外）→ 进入 `[[feature-skills/检查-菜单树API缺口]]`

## 输入契约

至少要拿到：

- `仓库路径`：必填
- `目标结果`：必填（盘点 / 设计 / 补丁 / 改码 / 验证 / 排障）
- `targetRepo`：可选，默认 `apex_dev`
- `api契约`：可选，默认 `{nebula根}/docs/api/seccenter.swagger.json`（示例：`docs/api/seccenter.swagger.json`）
- `补充契约路径`：可选
- `关注模块 / 关注路由`：可选
- `是否允许多轮人工确认`：可选，默认允许多轮

若用户没有明确回答 `是否允许多轮人工确认`，默认按以下策略：

- 可以继续做只读分析、状态判断和意图路由
- 不可以擅自把多步执行压成一次性方案
- 只要后续节点需要裁决权限粒度、跨模块归属、豁免策略或改动范围，就进入人工提问

## Agent 工作循环

每一轮都遵循：

1. 观察：当前仓库状态、已有产物、用户目标
2. 判断：属于哪个 intention 节点
3. 选择当前意图 skill
4. 验证事实是否足够
5. 继续、切换节点或提问

每一轮必须显式产出：

- `currentUnderstanding`
- `repoStateFacts`
- `goalUnderstanding`
- `analysisRequirement`（`required` / `optional`）
- `chainConfidence`（`high` / `medium` / `low`）
- `selectedIntentionSkill`
- `whyThisIntentionSkill`
- `alternativeIntentionSkills`
- `missingFacts`
- `humanQuestions`
- `nextIterationAction`

## 状态分类

父 agent 必须先把当前任务归到以下之一：

1. `no_analysis_yet` — 尚未产出任何盘点文档
2. `analysis_complete` — 已有盘点文档，可进入设计
3. `design_complete` — 权限设计已确认，可进入菜单补丁或源码改动
4. `patch_generated` — 菜单补丁已生成，可进入合并或导入验证
5. `code_changed` — 源码已改动，可进入端到端验证
6. `verification_needed` — 需要 OpenCLI 验证或运行时排障
7. `page_empty_state_needed` — 有路由/门控 perm 设计，但 UI 仍显示「暂无数据」或 inline 空态不一致
8. `unclear_or_mixed` — 状态不明确，需先分析

## 意图 skill 调用规则

意图 skill 位于 `[[intention-skills/]]`，父 agent 只直接消费这一层：

- 当前没有盘点文档、用户也说不清现状 → 必须先进入 `[[intention-skills/分析-perms-apis现状]]`
- 用户只想还原现状、摸清权限覆盖 → 也进入 `[[intention-skills/分析-perms-apis现状]]`
- 已有盘点文档，需要设计新权限点 → 进入 `[[intention-skills/策略-设计权限点]]`
- 想看总方案、改动面对比、推荐路径 → 进入 `[[intention-skills/编排-权限点配置全流程]]`
  - 若盘点事实不足，先补 `[[intention-skills/分析-perms-apis现状]]`
- 权限设计已确认，要落地源码改动 → 进入 `[[intention-skills/迁移-源码改动落地]]`
  - 若设计尚未确认，先补 `[[intention-skills/策略-设计权限点]]`
  - 若用户明确整页无权限空态 / `PageNoPermission` → 优先 `[[intention-skills/编排-页面无权限空态落地]]`
- 问无 query 时显示什么、整页空态策略 → `[[intention-skills/策略-页面权限空态]]`
- 要接入 `PageNoPermission`、统一「暂无页面访问权限」→ `[[intention-skills/编排-页面无权限空态落地]]`
- 只扫描「暂无数据」反模式 → `[[feature-skills/盘点-页面权限空态反模式]]`
- 要做 OpenCLI 自动化权限 E2E 测试（双会话配置+验证+CSV）→ 进入 `[[intention-skills/编排-权限E2E测试]]`
  - 若用户明确「菜单管理 / 8 场景 / S1~S8」→ 编排节点内直接路由到 `[[feature-skills/菜单管理功能项依赖链验证]]` 并执行 node 脚本
  - 若测试权限点清单未确认，先补 `[[intention-skills/策略-设计权限点]]`
- 当前已明确只差某项能力，只需选择某一个功能 skill → 进入 `[[intention-skills/路由-选择功能子skill]]`
  - 若能力缺口判断依赖当前链路事实，先补对应意图 skill
- 用户要求全局/按范围检查菜单树 API 遗漏、或对比源码与 YAML 缺口 → 进入 `[[feature-skills/检查-菜单树API缺口]]`
  - 与 `扫描源码权限点与API` 区分：范围检查 = 轻量 diff 报告；全量扫描 = 完整盘点文档
- 用户要在**新模块**按路由作用域方案配置权限（route_path + params + 权限标识）→ 进入 `[[intention-skills/编排-新模块权限配置]]`
  - 若盘点事实不足，先补 `[[intention-skills/分析-perms-apis现状]]`
  - 权威参考：`[[references/route-scope-auth-chain.md]]`；清单：`[[template/new-module-perm-config-checklist.md]]`

## 人工介入门禁

以下情况必须先问人：

- 无法确认当前处于哪个阶段（无盘点文档、设计未确认、还是改动未验证）
- 权限粒度决策涉及产品判断（页面级 vs 操作级、跨模块归属）
- 接口在默认契约和补充契约中均未命中，且无法从源码推断
- `targetRepo` 不明确且用户未显式指定
- 用户目标同时混入 skill 改造与业务代码修改

若 `是否允许多轮人工确认 = 否`，也不要跳过上述门禁；此时应输出：

- 当前能确认的最小事实集
- 仍阻断路由的缺口
- 需要用户一次性补齐的关键问题

## GREEN

- 顶层只做会话级判断、多轮路由、人工门禁与节点切换
- 真实分析、策略、编排与功能路由下沉到 `intention-skills/`
- 源码级执行能力下沉到 `feature-skills/`
- `分析-perms-apis现状` 既是可直接使用的意图 skill，也是其他意图节点的公共前置能力

## 核心约束（下沉到各层）

以下约束在本父 agent 中声明，下沉到各意图/功能 skill 执行：

1. **targetRepo 默认 apex_dev**：每次只改一个仓库，默认仅改 apex_dev，不动 opsdeck
2. **复杂页 pagePerms 静态预算；简单页才 v-hasPerm**：列表页/多行 OpItem 用单一 `xxxPagePerms` computed + boolean props，禁止 OpItem `:perm` 二次鉴权；仅 1–2 个独立按钮时可用 `v-hasPerm`（见 `[[references/page-perms-static-budget.md]]`）
3. **菜单补丁 ID 必须回填**：`patch_children_add` 中的 function 必须先查询或创建获取 ID 后回填
4. **菜单导入先 dry_run**：正式导入前必须先 `dry_run: true` 验证
5. **API 反查三类硬链路**：`业务层→gateway→api→契约`、`业务层→api→契约`、`子组件 emit→父组件→gateway/api→契约`
6. **页面门控空态**：缺 `view`/`query` 等 pageGate perm 时必须 `PageNoPermission`，禁止用 `el-table` 默认「暂无数据」代替；对照 `[[template/sample-run/after-02-页面空态/]]`
7. **路由作用域鉴权**：`checkHasPerm` 真相源为 `RoutePermDict`（`routeProjectMap` + 当前路由 `params` 漏斗）；禁止以 `userInfo.permsMap` 为排障主路径；新模块必须设计 `route_path` + 可选 `params` + function `code`；见 `[[references/route-scope-auth-chain.md]]`

## 使用示例

```text
使用 $梳理权限点与apis 扫描 apex_dev，
先帮我盘点所有路由的权限点和 API 现状。
```

预期：进入 `[[intention-skills/分析-perms-apis现状]]`

```text
已有盘点文档，帮我设计首页、租户管理、安全配置的新权限点。
```

预期：进入 `[[intention-skills/策略-设计权限点]]`

```text
给我全流程方案：从分析现状到菜单补丁、源码改动、端到端验证。
```

预期：进入 `[[intention-skills/编排-权限点配置全流程]]`，必要时先补分析

```text
权限设计已确认，帮我按集中式原则改 apex_dev 源码。
```

预期：进入 `[[intention-skills/迁移-源码改动落地]]`

```text
我不需要总方案，只想知道这一步该进哪个功能 skill。
```

预期：进入 `[[intention-skills/路由-选择功能子skill]]`

```text
用 OpenCLI 帮我验证一下登录后 isOwner 是否正常绕过权限。
```

预期：路由到 `[[feature-skills/OpenCLI端到端验证]]` 或 `[[feature-skills/权限运行时排障]]`

```text
我要对 sys:dashboard:view、sys:tenant:query、sys:tenant:add 做 E2E 测试，
admin 配置"权限测试角色"，13813815913 验证，结果落盘 CSV。
```

预期：进入 `[[intention-skills/编排-权限E2E测试]]`

```text
直接用菜单管理跑一遍 E2E，8 个场景全过一遍。
```

预期：进入 `[[intention-skills/编排-权限E2E测试]]` → `[[feature-skills/菜单管理功能项依赖链验证]]`，执行 `scripts/run-all.node.js`

```text
用默认 6 模块检查菜单树 API 有没有遗漏，个人中心不用管。
```

预期：进入 `[[feature-skills/检查-菜单树API缺口]]`，执行 `scripts/check-menu-api-gap.node.js`

```text
租户无 query 时显示暂无数据，应改为暂无页面访问权限整页空态。
```

预期：进入 `[[intention-skills/编排-页面无权限空态落地]]`；对照 `[[template/sample-run/before-02-页面空态/]]` / `[[template/sample-run/after-02-页面空态/]]`

```text
帮我在新模块 /Apex/foo 按路由作用域方案配置权限点，从分析到菜单导入。
```

预期：进入 `[[intention-skills/编排-新模块权限配置]]`；产出 routePath + paramsDecision + functionPermList 三件套

```text
按钮有 perm 但不显示，菜单已导入，帮我按 RoutePermDict 排障。
```

预期：路由到 `[[feature-skills/权限运行时排障]]`；查 `getScope/getAllowed`，不查 permsMap

## REFACTOR

- 如果父级仍表现成一次性 router，继续收紧 `analysis_required` / `analysis_optional` 判定
- 如果下游节点重复猜链路，优先补强 `分析-perms-apis现状` 的复用字段
- 如果意图节点选错率高，优先补根层路由判定表和 should-not-trigger 用例
- 如果主文件开始承载低频解释、长示例，继续下沉到 `references/` 或 `template/`