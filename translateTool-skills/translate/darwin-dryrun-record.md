# Darwin 记录 · translate en2ru

## Phase 0.5 · test-prompts

见 [`test-prompts.json`](test-prompts.json)（计划中已设计；若 Plan 模式未写出 JSON，执行 Agent 时补写）。

| id | 覆盖点 |
|----|--------|
| tp-en2ru-001 | happy path：xlsx 英译俄 |
| tp-en2ru-002 | 误触发：翻英文 → 必须 zh2en |
| tp-en2ru-003 | 占位符 `%1`/`%2` |

## Phase 1 · 基线（改造前，dry_run）

评估对象：改造前 `SKILL.md`（仅 zh2en）+ 无 en2ru 实现。

| 维度 | 预估分 (1-10) | 理由 |
|------|---------------|------|
| 1 Frontmatter | 4 | 无英译俄触发词 |
| 2 工作流 | 6 | zh2en 步骤清晰，无 en2ru 分支 |
| 3 失败模式 | 3 | 无三段式 fallback |
| 4 检查点 | 2 | 无 🔴 全量前确认 |
| 5 可执行性 | 5 | 有 CLI，缺 mode 参数 |
| 6 资源整合 | 5 | prompts 仅 zh2en |
| 7 架构 | 5 | 单体脚本过重但可用 |
| 8 实测 | 2 | en2ru 请求会走错/失败 |
| 9 反例黑名单 | 2 | 无「不要做什么」 |

粗算总分约 **36–42 / 100**（dry_run，`eval_mode=dry_run`）。

## Phase 2 · 试跑（待 Agent 模式）

```text
status: blocked_by_plan_mode
note: 用户批准 Agent 后执行 --limit 20 full_test
```

| timestamp | commit | skill | old_score | new_score | status | dimension | note | eval_mode |
|-----------|--------|-------|-----------|-----------|--------|-----------|------|-----------|
| 2026-07-14 | baseline | translate | - | ~40 | baseline | - | en2ru 未实现 | dry_run |

## Phase 3 · 全量

按用户要求：**暂不执行** 5378 条全量。
