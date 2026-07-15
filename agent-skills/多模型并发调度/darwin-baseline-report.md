# Darwin 评估记录 · 多模型并发调度 v1.0.0

## Phase 0.5 · test-prompts（计划中）

| id | 覆盖点 |
|----|--------|
| tp-lane-001 | batch 任务 + 未指定模型 → 生成提案表 + CHECKPOINT |
| tp-lane-002 | complex 任务 → 推荐 primary tier |
| tp-lane-003 | 用户已指定模型 → 跳过提案 |
| tp-lane-004 | 小规模平分缩批（270 条 / 27 路） |
| tp-lane-005 | --check-pricing 检测过期定价 |

## Phase 1 · 基线（新建套件，dry_run）

评估对象：新建 `多模型并发调度` 套件（SKILL.md + 3 intention + 2 feature + lib/laneDispatcher.js + models.config.json）

| 维度 | 预估分 (1-10) | 理由 |
|------|---------------|------|
| 1 Frontmatter | 8 | 触发词覆盖 batch/complex/probe_only |
| 2 工作流 | 8 | 意图层 3 节点链路清晰 |
| 3 失败模式 | 7 | 5 条失败基线 + fallback 表 |
| 4 检查点 | 9 | 2 处 CHECKPOINT（模型确认） |
| 5 可执行性 | 7 | LanePoolDispatcher 代码可用 |
| 6 资源整合 | 8 | 共享 models.config.json |
| 7 架构 | 9 | intention/feature 已拆 |
| 8 实测 | 5 | 代码跑通，缺真实 API 用例 |
| 9 反例黑名单 | 8 | 独立章节 |

**粗算总分 ≈ 71.2 / 100**（dry_run）

## Phase 2 · 试跑（建议后续）

```text
status: pending_full_test
note: 用户批准后，可用 translate 3842 条输入跑 weighted-lanes 全模型并发，
      对比旧版 round-robin：预期吞吐 >500 条/min（旧版 374）
```

| timestamp | commit | skill | old_score | new_score | status | dimension | note | eval_mode |
|-----------|--------|-------|-----------|-----------|--------|-----------|------|-----------|
| 2026-07-15 | baseline | 多模型并发调度 | — | 71.2 | baseline | — | 新建套件 v1.0.0 | dry_run |

## 建议

- **立即可合并**：两套件结构完整、无空心化、callback 约束满足
- **后续优先**：translateCsv.js 中实际替换 runDagScheduler → LanePoolDispatcher，跑 full_test 积累实测数据
