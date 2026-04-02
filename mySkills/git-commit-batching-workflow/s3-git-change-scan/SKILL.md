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

## `scan_changes.yaml` 默认对比基与路径状态（供 S6/S8）

- **默认对比基（强约定）**：未在 START/S4 中显式指定其它对比引用时，本次扫描中的变更均视为相对 **当前分支 `HEAD`（最近一次已提交快照）** 的差异，即与「本分支上一次提交」为基准的 `git diff` / `git status` 语义一致（含已暂存与未暂存的具体规则由执行方在实现中统一，但须在 artifact 中可核对）。
- 写入 `scan_changes` 时须在可解析结构内声明对比基引用，推荐顶层键：`diff_baseline_ref`，取值 `HEAD`（或执行环境解析后的等价不可变 SHA，任选其一，但须在 `map_notes` 或本文件中自解释）。
- `scan_changes.changed_files[]` 中 **推荐**为每条路径附带 Git 状态码（如 `status: M|A|D|R|??|…` 等与 `git status --porcelain` 一致或经归一后的枚举），供 S6 **默认推断**演进/绿场倾向，**无需**用户口头声明。
