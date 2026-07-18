# Darwin Phase 1 · evaluate-only 基线（工作台验数播种）

日期：2026-07-18  
模式：`evaluate-only` · `eval_mode=dry_run`（未 spawn 独立子 agent full_test）  
结论：**STOP 等人审**；未进入 Phase 2 优化循环。

## 评分卡（9 维）

| # | 维度 | 权重 | 分(1-10) | 加权 | 短评 |
|---|------|------|----------|------|------|
| 1 | Frontmatter质量 | 7 | 8.5 | 5.95 | description 含做什么+触发词，无空话尾巴 |
| 2 | 工作流清晰度 | 12 | 9.0 | 10.80 | 分析→编排→四步+验证，输入输出表齐全 |
| 3 | 失败模式编码 | 12 | 8.0 | 9.60 | feature 含触发/一线/仍失败三段表 |
| 4 | 检查点设计 | 6 | 8.0 | 4.80 | 分析/编排含 🔴 CHECKPOINT · 🛑 STOP |
| 5 | 可执行具体性 | 17 | 8.5 | 14.45 | 种子路径、SQL、ps1、验收查询可直接跑 |
| 6 | 资源整合度 | 4 | 9.0 | 3.60 | references/scripts/assets/few-shot 齐 |
| 7 | 整体架构 | 12 | 8.0 | 9.60 | 与 db-回滚边界清晰；无冗长 AI 腔 |
| 8 | 实测表现 | 23 | 6.5 | 14.95 | **dry_run**：3 条 test-prompts 路由合理；未实跑 shell |
| 9 | 反例与黑名单 | 6 | 8.0 | 4.80 | references 反例 + should-not-trigger |

**总分 = 78.5 / 100**

## dry_run 路由推演（dim8）

| prompt id | 预期路由 | 判定 |
|-----------|----------|------|
| 1 全流程灌 admin | 分析 → 编排（backup + apply seed + 验证） | 符合 |
| 2 只补人员 | 执行-创建验数任务 → 验证；不进 db-回滚 restore | 符合 |
| 3 getTaskPending 201 | 下发到翻译阶段修 entry_state → 验证 | 符合 |

⚠️ dry_run 占比 100% → 分数仅作结构基线；若要抬 dim8，需用户授权后对 prompt1 做一次 full_test（真实 apply + 验收 SQL）。

## 结构短板（供后续 Phase 2，须人审后才改）

1. dim8：缺 full_test  
2. dim3：主 SKILL 失败分支弱于 feature（可下沉已够用）  
3. custom 档案缺少独立种子模板（仅约定用户自备 SQL）

## 🔴 CHECKPOINT · 🛑 STOP

请确认：

1. 套件结构与四步拆分是否符合你的「要记住的整个过程」  
2. 是否进入 Phase 2 优化（例如补 full_test、custom 模板）  
3. 或保持 78.5 基线、日常直接使用  

回复「继续优化」才进入 Phase 2；否则本基线冻结。
