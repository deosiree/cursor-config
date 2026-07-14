# Darwin collectPerms 单层收集迭代报告（2026-07-08）

## 迭代目标

同步 gen-perms-apis 与 apex_dev/opsdeck `collectPerms` 单层收集改动：消除「DFS 子树」过期口径，补 sibling perm 膨胀 few-shot 与 eval。

## 改动摘要

| 层级 | 文件 | 改动 |
|------|------|------|
| reference | `route-scope-auth-chain.md` | 就地写入、反例表、leaf page、DEV perms keys |
| sample-run | before/after/snapshot-05 | sibling perm 膨胀三角样本 |
| sample-run | after-03、snapshot-03 | 子树 → 直接 function 术语 |
| intention | 父 SKILL #9、策略-设计权限点、编排-新模块 | collectPerms 作用域 / routeAuthPlan |
| feature | 权限运行时排障、路由鉴权迭代剥离匹配 | allowed 偏大分支 |
| reference | perm-runtime-debugging.md | 链路图 + 决策树 |
| evals | evals.json | +3 should_trigger、+2 output_acceptance |
| README | 约束 #10、套件结构、使用示例 | 同步 |

## Eval 覆盖（新增 3 条）

| # | 场景 | 期望关键词 |
|---|------|-----------|
| 1 | reportA 见 reportB 按钮 | leaf page、collectPerms 直接层 |
| 2 | collectPerms void 就地写入 | resolveScope → scope.perms → allowed |
| 3 | function 挂 directory | 拒绝、page 直接子节点 |

## dry_run 自检（7 条路由/权限 + 3 条 collectPerms）

- 路由鉴权 4 条（前序迭代）：PASS（文档已对齐）
- collectPerms 3 条：PASS（evals.json 已写入）

## 验收自检

- [x] 无「collectPerms(child) 递归」正向推荐（仅 before-05）
- [x] after-03 / perm-runtime-debugging 与 L481-509 一致
- [x] 父 SKILL #9 + README #10
- [x] before-05 → after-05 → snapshot-05 三角样本

## 决策

**KEEP。** collectPerms 与路由鉴权双层文档已闭环。dim8 full_test 可选下一轮。

## 与前序迭代关系

- Phase 1（2026-07-08 早）：路由鉴权迭代剥离 → `darwin-route-auth-iteration-report.md`
- Phase 2（本报告）：collectPerms 单层收集
