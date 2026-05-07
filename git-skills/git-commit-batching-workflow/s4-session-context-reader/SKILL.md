---
name: git-commit-batching-workflow-s4-session-context-reader
description: Read current or specified session context and normalize it into structured session hints for downstream merge.
---

# S4：会话上下文读取

## 职责（单写点）
只产出 `session_*`，不做能力合并、不做提交文案。

## 输入
- `artifact_root`（父 START 输入或默认值）
- `run_id`（父 START 输入或自动生成）

## 输出（给 S5 / S6；默认使用 artifact offload）
- 写入 `${artifact_root}/${run_id}/S4/session_context.yaml`

## 数据契约（透传 + 追加）
- 本步骤不向对话透传 `scan_*` / `ctx_*` / `session_context` 原对象
- 由执行方从固定 artifact 文件读取输入上下文：
  - `${artifact_root}/${run_id}/S0/start_inputs.yaml`（读取 `session_source/session_id/lookback_scope` 等控制参数）
  - `${artifact_root}/${run_id}/S3/scan_changes.yaml`
  - `${artifact_root}/${run_id}/S3/scan_capability_candidates.yaml`
- artifact 形式：由执行方写入 `${artifact_root}/${run_id}/S4/session_context.yaml`（格式为可被执行方读取的结构化文本；需保持与合并逻辑所需语义一致）。

## `session_context.constraints` 口径（自包含）
- `constraints` 必须以“约束语句”形式表达：例如“禁止将 X 作为同一能力域拆成两个批次”“必须同批提交 Y 和 Z”等。
- 鼓励在可得时写入 **对比与演进类约束**（例如对比分支/合并基、或「须对照某次 diff 摘要撰写四段式」），供 S6 写入 `map_notes`、S8 生成 **改前/改后** 轮廓；不得在此步骤编造未给出的对比细节。
- 若约束来自用户明确确认：标记为更高权重（在 `confidence.reasons` 中解释）。

## `session_context.confidence` 计算（自包含）
- `trace.completeness`：
  - `full`：摘要足以形成硬约束（哪些能力必须同批/哪些必须拆开/哪些不确定）
  - `partial`：信息不全但能提供弱提示
  - `unknown`：读取/提取失败或无法判断
- `confidence.level`：
  - `high`：completeness=full 且 open_questions 为空或极少
  - `medium`：completeness=partial，或 open_questions 存在但不阻断关键决策
  - `low`：completeness=unknown，或 open_questions 多且需人工确认
- `confidence.reasons`：必须给出至少 1 条原因（简短、可读）。

## 不做
- 不执行 git/shell
- 不读取外部 markdown 文件；不做 `map_*` 合并，不生成提交文案
