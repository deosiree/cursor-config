---
name: git-commit-batching-workflow-s5-external-markdown-ingest
description: Ingest external markdown summaries and normalize them into structured external hints for merge.
---

# S5：外部 Markdown 接入

## 职责（单写点）
只读取外部文档并产出 `external_*`，不做语义合并。

## 输入
- `artifact_root`（父 START 输入或默认值）
- `run_id`（父 START 输入或自动生成）
- 由执行方从固定 artifact 文件读取对齐控制参数：
  - `${artifact_root}/${run_id}/S0/start_inputs.yaml`（读取 `external_doc_paths/doc_role/trust_level`）
- 由执行方从固定 artifact 文件读取对齐上下文：
  - `${artifact_root}/${run_id}/S4/session_context.yaml`
  - `${artifact_root}/${run_id}/S3/scan_changes.yaml`（用于判断外部文档与 git 事实是否明显矛盾）

## 输出（给 S6；默认使用 artifact offload）
- 写入 `${artifact_root}/${run_id}/S5/external_context.yaml`（无外部文档时也写入空结构）

## `external_context.docs[].confidence` 计算（自包含）
- 输入：`trust_level` 是外部调用方/文档给予的“可信度信号”（不是最终置信度）。
- `confidence.level` 启发式（示例）：
  - `high`：角色为 `constraints/requirements/decision_log` 且解析到明确约束句；同时信号 `trust_level=high`。
  - `medium`：存在可用约束或决策线索，但存在一定缺失；或 `trust_level=medium`。
  - `low`：解析不完整、无明确约束、或文档与 session/scan 事实存在明显不一致（此时理由必须写进 reasons）。
- `confidence.reasons`：必须给出至少 1 条原因（短句即可）。

## 不做
- 不执行 git/shell
- 不生成 `map_*`
- 不写标题/正文
