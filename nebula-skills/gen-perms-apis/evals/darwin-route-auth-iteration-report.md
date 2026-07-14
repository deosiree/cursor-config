# Darwin 路由鉴权迭代报告（2026-07-08）

## 迭代目标

将 gen-perms-apis 套件从「路由 scope + perm 标识」升级为「路由鉴权 + 权限鉴权」双层模型，同步 apex_dev resolveScope 迭代剥离重构。

## 改动摘要

| 层级 | 文件 | 改动 |
|------|------|------|
| reference | `references/route-scope-auth-chain.md` | 7 步漏斗、RoutePermScope 新字段、路由鉴权 vs 权限鉴权 |
| feature | `feature-skills/路由鉴权迭代剥离匹配/SKILL.md` | 新建；旧「前缀模糊匹配」标记废弃 |
| intention | 父 SKILL、路由-选择功能子skill、策略-设计权限点、编排-新模块 | 约束、路由、routeAuthPlan |
| feature | 权限运行时排障 + perm-runtime-debugging | fuzzyRejected 分支 |
| sample-run | before/after/snapshot-04-路由鉴权* | 3 份 few-shot |
| sample-run | after-03、new-module-perm-config-checklist | 联动更新 |
| evals | evals.json | +4 should_trigger、+3 output_acceptance |
| README | 核心约束 #9、套件结构、使用示例 | 同步 |

## Eval 覆盖（新增 4 条）

| # | 场景 | 期望关键词 |
|---|------|-----------|
| 1 | 子路由按钮全灭 | 迭代剥离、page 父节点 |
| 2 | directory 拒绝 → 404 | fuzzyRejected、type=page |
| 3 | directory 挂 perm 设计 | 拒绝 |
| 4 | /404 短路 | 不参与鉴权 |

## 验收自检

- [x] 套件内无正向推荐 `fuzzyMatchByPrefix`（仅 before-04 历史对比）
- [x] reference 与 apex_dev resolveScope 逐步对齐
- [x] 父 agent → intention → feature 路由链覆盖 3 类问题
- [x] evals 新增用例已写入 evals.json
- [x] README 套件结构与磁盘目录一致

## 建议

**KEEP。** 主路径「新模块 RoutePermDict 配置 + 路由鉴权排障」文档已闭环。下一轮若继续，可选 full_test 实跑新增 4 条 eval 验证 dim8。

## 后续口径修正（2026-07-14）

子应用不再在 `beforeEach` 做 `fuzzyRejected → next('/404')`（apex_dev/opsdeck 已注释该逻辑）；URL 级路由鉴权归 **microfb**。`permissions.ts` 的 resolveScope / fuzzyRejected / collectPerms 算法文档**保留**。详见 `route-scope-auth-chain.md`「职责拆分」。

---

## Phase 2：collectPerms 单层收集（2026-07-08 晚）

详见 [`darwin-collectPerms-iteration-report.md`](darwin-collectPerms-iteration-report.md)。

- apex_dev/opsdeck `collectPerms` 改为仅直接 function 子节点
- 套件补 before/after/snapshot-05 + 约束 #9/#10 + eval +3
- **KEEP**

