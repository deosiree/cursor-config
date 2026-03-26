---
name: git-commit-batching-workflow-s3-git-change-scan
description: Scan uncommitted files and path-based capability candidates.
---

# S3：Git 变更扫描

## 职责（单写点）
只产出 `scan_*`（文件清单 + 启发式标签）。

## 输入
- `artifact_root`（父 START 输入或默认值）
- `run_id`（父 START 输入或自动生成）

## 输出（给 S4；无需透传对象，后续固定读取）
- 写入 `${artifact_root}/${run_id}/S3/scan_changes.yaml`
- 写入 `${artifact_root}/${run_id}/S3/scan_capability_candidates.yaml`

## 数据契约（透传 + 追加）
- 本步骤不向对话透传 `ctx_*` / `limit_subject` / `scan_*` 原对象
- 由执行方从固定 artifact 文件读取：
  - `${artifact_root}/${run_id}/S1/ctx_pack.yaml`
  - `${artifact_root}/${run_id}/S2/limit_subject.yaml`
- artifact 形式：由执行方写入 `${artifact_root}/${run_id}/S3/scan_changes.yaml` 与 `${artifact_root}/${run_id}/S3/scan_capability_candidates.yaml`
- 不做：不生成提交标题/正文、不合并会话语义（保持单一职责）。
