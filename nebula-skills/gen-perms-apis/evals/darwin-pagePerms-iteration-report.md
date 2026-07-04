# Darwin pagePerms + 收手评估报告（2026-07-04）

## 停止条件

| 条件 | 状态 |
|------|------|
| 主路径节点 ≥ 85 | ✅ 父 agent 86、编排-新模块 87.5、源码集中式 ~85 |
| HL-4 连续 2 轮 Δ < 2 | ✅ 路由作用域 r8 已触发（Δ=0.5~1.0） |

## 本轮变更（pagePerms 静态鉴权）

| 产物 | 状态 |
|------|------|
| page-perms-static-budget.md + before/after/snapshot-04 | ✅ KEEP |
| centralized-diff-rules / 源码集中式 / 迁移-源码改动落地 | ✅ 模式 S 默认 |
| evals 2 条 pagePerms + output_acceptance | ✅ |
| darwin-results.tsv evaluate-only 行 | ✅ |

### pagePerms 节点估分（dry_run）

| 节点 | 估分 | 短板 |
|------|------|------|
| 源码集中式权限改动 | **85.0** | dim4 无显性 CHECKPOINT |
| 迁移-源码改动落地 | **84.5** | dim8 未 full_test |
| 父 agent（约束 #2 已修订） | **86.0** | 维持 |

## 追加一轮（角色权限树 r9）

| 节点 | Before | After | Δ | 改动 |
|------|--------|-------|---|------|
| 角色菜单权限树快速配置 | 79 | **84.5** | +5.5 | CHECKPOINT×2 + if-then + 反例黑名单 |

未达 85，但 dim3/4/9 簇已补齐；继续微调文案预期 Δ < 2（HL-4 将再次触发）。

## 套件现状（加权）

| 层级 | 分数带 | 代表节点 |
|------|--------|---------|
| 主路径 | **86–88** | 父 agent、编排-新模块、源码集中式 |
| 改码链路 | **84–85** | 迁移-源码改动、pagePerms reference |
| E2E 叶子 | **83–84.5** | 双会话初始化 83.5、角色权限树 84.5 |
| dim8 实测 | ⚠️ | 100% dry_run，无 full_test |

## 现在最值得优化的点

1. **dim8 full_test（最高杠杆、非 hill-climbing）** — 对「新模块配置权限」或「租户 pagePerms 改码」跑 1 次带 skill vs 不带 skill 对比，否则 dim8（权重 23%）不可信
2. **角色菜单权限树快速配置**（84.5）— 距 85 差 0.5，再堆文案无意义；缺的是实跑验证而非结构
3. **opsdeck after-03 few-shot** — reference 已有，独立 sample-run 可降 opsdeck 踩坑率（非评分瓶颈）

## 建议：**收手**

理由：

- 用户主诉求（RoutePermDict 新模块 + pagePerms 复杂页改码）主链路均已 ≥85
- HL-4 已在路由作用域迭代触发；pagePerms 为 evaluate-only KEEP，未引入退步
- 角色权限树 r9 后 84.5，再 hill-climbing 预期 Δ < 2，符合 HL-4 收手信号
- 下一轮若继续，应选 **full_test 补 dim8** 或 **Phase 2.5 探索**（非再改 SKILL 文案）

若只再投 1 轮：**full_test 一条**（编排-新模块 或 源码集中式 的典型 prompt），而非继续改 markdown。
