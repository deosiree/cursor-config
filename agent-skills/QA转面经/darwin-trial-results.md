# Darwin 受控试跑 · QA转面经

> 最近再评估：**2026-05-25 · v2 · 总分 89.6**（dry_run）· 详见 [darwin-baseline-report.md](darwin-baseline-report.md)

## 评分卡（再试跑）

```
┌──────────────────────────┬────────┬──────────────┬──────────────┐
│ QA转面经                 │ 89.6   │ 具体性 8.5   │ 实测 9.0     │
├──────────────────────────┼────────┼──────────────┼──────────────┤
│ vs 首基线 74.0           │ +15.6  │ 检查点 9.5   │ eval: dry_run│
└──────────────────────────┴────────┴──────────────┴──────────────┘
```

## test-prompts 试跑（4/4 pass · dry_run）

| ID | 结果 |
|----|------|
| happy-path-mcp | pass — 指定 structureId 直载框架说明 |
| framework-recommend | pass — 推荐 2～3 + awaiting_choice |
| extract-inplace | pass — 提炼入库不改名 |
| boundary-n8 | pass — 检查点 A |

## evals 对齐

`evals/evals.json` 含 `should-trigger-recommend`、`boundary-await-choice`；与 test-prompts 一致。

## 现行架构（v2）

- `references/框架结构库/{structureId}/` + 样本原文件名
- 未指定 → 推荐 2～3 个 → 等人选后再写
- `references/方法论库/SKILL.md` + 费曼理解校验
- 已删除：`参考框架库/`、领域默认、`darwin-optimize-前端面试向.md`

## 历史

- Round1 前端领域默认：**superseded**
- `test-run/`：历史摘录，见 [test-run/README.md](test-run/README.md)

## 下一步（可选）

1. 真实 QA 产出 1 篇面经 → `eval_mode=full_test` 复检 dim8  
2. `template/snapshot/` 补前端/OperationColumn 完整样本（R2）
