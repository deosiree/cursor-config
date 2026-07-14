# Darwin /goal 收手评估报告（2026-07-08）

## 停止条件判定

| 条件 | 状态 | 证据 |
|------|------|------|
| 主路径节点 ≥ 85 | ✅ | 父 agent **86**、编排-新模块 **87.5**、源码集中式 **89**（full_test） |
| HL-4 连续 2 轮 Δ < 2 | ✅ | r8：0.5 + 1.0；pagePerms 报告 r9 后再次 HL-4；**r10 主路径 Δ ≈ 0** |

**结论：双停止条件均已满足，进入 Phase 3 收手。**

---

## 本轮（r10）执行摘要

| 节点 | Before | After | Δ | 改动 | eval_mode |
|------|--------|-------|---|------|-----------|
| 路由鉴权迭代剥离匹配 | 74.0 | **83.5** | +9.5 | TL;DR + CHECKPOINT + if-then + 反例黑名单 + test-prompts.json | dry_run |
| 父 agent SKILL.md | 86.0 | **86.0** | 0 | collectPerms #9 已在 Phase 2 完成，无新增 hill-climbing | dry_run |
| 编排-新模块权限配置 | 87.5 | **87.5** | 0 | routeAuthPlan + collectPerms 已在 Phase 1–2 完成 | dry_run |
| 角色菜单权限树快速配置 | 84.5 | **84.5** | 0 | r9 已补齐 dim3/4/9；再改文案预期 Δ < 0.5 | dry_run |

### r10 dry_run 自检（test-prompts × 3）

| id | prompt 主题 | PASS |
|----|------------|------|
| 1 | 子路由按钮全灭 | ✅ 剥离 + page 父节点 |
| 2 | directory → 404 | ✅ fuzzyRejected |
| 3 | reportA/reportB sibling | ✅ collectPerms 直接层 |

### 前序迭代（本 /goal 周期内已完成，不再重复改）

- Phase 1 路由鉴权：`darwin-route-auth-iteration-report.md`
- Phase 2 collectPerms：`darwin-collectPerms-iteration-report.md`
- evals.json：路由 4 + collectPerms 3 + output_acceptance 5

---

## 套件分数带（当前）

| 层级 | 分数 | 代表节点 |
|------|------|---------|
| **主路径** | **86–89** | 父 agent、编排-新模块、源码集中式、用户/菜单/角色/安全配置 full_test |
| **改码链路** | **84.5–85** | 迁移-源码改动、pagePerms reference |
| **E2E 叶子** | **81–84.5** | 双会话 OpenCLI 81、编排-E2E 82、双会话初始化 83.5、角色权限树 84.5 |
| **新 feature** | **83.5** | 路由鉴权迭代剥离匹配（r10 后） |
| **dim8 实测** | 部分 full_test | 改码链路已测；**新模块配置 / 路由排障 eval 仍 100% dry_run** |

---

## 现在最值得优化的点（按杠杆排序）

### 1. dim8 full_test — 最高杠杆（非 hill-climbing）

对下列 prompt 各跑 **1 次** with-skill vs baseline，补 dim8 可信度（权重 23%）：

- 「帮我在新模块 `/Apex/foo` 按路由作用域配置权限，report sibling 不串 perm」
- 「子路由 detail 按钮全灭，请按路由鉴权排障」

**预期收益**：验证文档闭环是否转化为实跑质量，而非 +0.5 文案分。

### 2. opsdeck `after-03` 独立 sample-run — 中等杠杆

reference 已有 opsdeck 表，但缺少与 apex_dev 对称的 few-shot。降低 opsdeck 子路由踩坑率，**不直接涨 rubric 分**。

### 3. 角色菜单权限树快速配置（84.5）— 低杠杆

距 85 差 0.5，结构簇已齐；缺的是 **OpenCLI 实跑一条** 而非再堆 CHECKPOINT。

### 4. E2E 叶子簇（81–83.5）— 低优先级

OpenCLI 双会话 / 编排-E2E 非用户主诉求（新模块 RoutePermDict + pagePerms 改码）；继续 hill-climbing 预期 Δ < 2。

---

## 建议：**收手**

| 维度 | 理由 |
|------|------|
| 用户主诉求 | 新模块 RoutePermDict + 路由鉴权 + collectPerms + pagePerms 改码 → **主链路均已 ≥85** |
| HL-4 | r8 已触发；r10 主路径 Δ=0；再改 markdown 符合「连续 2 轮 Δ < 2」 |
| 边际成本 | 角色树 84.5→85 需实跑验证，不是文档微调；E2E 叶子到 85 需多轮 OpenCLI 环境成本 |
| 风险 | 过度 hill-climbing 引入冗余段落，dim7 反降（花叔禁用词 / AI 腔） |

### 若只再投 1 轮，选什么？

**full_test 一条**（编排-新模块 + collectPerms sibling 场景），**不要**继续改 SKILL 文案。

### 若长期维护

- 新 runtime 行为变更 → 只改 `route-scope-auth-chain.md` + evals，再 evaluate-only
- 角色权限树 / E2E 叶子 → 随 OpenCLI 脚本迭代时顺带 full_test，不单独开 Darwin 轮

---

## darwin-results.tsv 追加行

见 `evals/darwin-results.tsv` r10 段。
