---
name: 编排-skill质量迭代
description: 对本「创建harness工作流」套件跑 Darwin：评估或优化父/子 SKILL，HL-4 触顶即停；不改业务仓。触发词：darwin、评估 harness skill、优化本套件、HL-4。
---

# 编排-skill质量迭代

## 目标

对**本套件**做质量闭环，防止同步收益后文档膨胀、路由糊掉。

## 模式

| 模式 | 动作 |
| --- | --- |
| `evaluate-only` | Phase 0.5–1：test-prompts + 9 维基线；不改文件 |
| `optimize` | 人确认基线后 Phase 2；每轮改 **一个** SKILL.md；连续 2 轮 Δ&lt;2 → HL-4 break |
| `after-sync` | 同步收益刚结束后的默认：先 evaluate-only，展示是否需要 optimize |

## 步骤

1. 确认范围：默认 **父 SKILL + 本次改动的 intention/feature**；禁止无差别全库乱改  
2. 复用或更新根目录 `[[../../test-prompts.json]]`（覆盖：无 harness / 旧升级 / 同步收益）  
3. 按 darwin-skill：结构评分 + 独立子 agent 实测（至少 1 次 full_test）  
4. 记录 `[[../../evals/results.tsv]]`  
5. 🔴 每人审一轮 keep/revert；不好则 `git revert`（不用 reset --hard）  

## 失败分支

| 触发 | 一线 | 兜底 |
| --- | --- | --- |
| dry_run 占比将 &gt;30% | 强制补 1 次 full_test | 结果标 ⚠️ 不可信 |
| 为凑分堆父 SKILL | 🛑 拒绝；改下沉 feature | revert |
| 优化业务仓 harness | 停止；那是创建/升级 intention | — |

## 输出

```yaml
route: "编排-skill质量迭代"
darwinMode: "evaluate-only|optimize|after-sync"
scope: []
scores: { before: 0, after: 0, delta: 0 }
hl4Hit: false
resultsPath: "evals/results.tsv"
stopOrCheckpoint: ""
```
