---
name: git-commit-batching-workflow
description: Orchestrate S1-S9 to produce commit batching plans across repos with git scan, session context, external docs, and publishable push-command plans.
---

# git-commit-batching-workflow（父编排）

## 职责（单写点）
仅编排步骤，不承载子步骤实现细节。

## START 输入
```text
仓库：<repo1>[,<repo2>,...]
工作区根：<monorepo 根路径>
修改主题：<主题1；主题2；主题3>（允许使用 `；` / `;` / `，` / `,` 任意分隔，解析器必须保证不丢段）
推送参数：<remote，可选>
分支名：<branch，可选>
会话来源：<session_source|可选，default current>
会话 ID：<session_id|可选，cursor 对应 Request ID>
会话取样范围：<lookback_scope|可选：full|recent_n_turns>
外部文档：<external_doc_paths|可选，多个 markdown 路径>
外部文档角色：<doc_role|可选：requirements|constraints|decision_log|other>
外部文档可信度：<trust_level|可选：high|medium|low>
artifact_root：<artifact 存放根目录，可选>（默认：../commit-workflow-artifacts/）
run_id：<本次 workflow 运行标识，可选>（默认：自动生成且每次调用必须唯一，用于强制创建全新 run 目录；禁止把旧目录当作缓存复用。）
```

## 父编排器顺序（todolist，必经确认）

> 门控规则：进入某个子步骤流水线之前，执行方需先将对应条目勾选为已完成；未勾选视为未进入该步骤。

- [ ] `executor(S0)`：落盘并准备 `${artifact_root}/${run_id}/S0/start_inputs.yaml` 与 `${artifact_root}/${run_id}/S0/executor_state.yaml`
- [ ] `S1`：产出 `${artifact_root}/${run_id}/S1/ctx_pack.yaml`
- [ ] `S2`：产出 `${artifact_root}/${run_id}/S2/limit_subject.yaml`
- [ ] `S3`：产出 `${artifact_root}/${run_id}/S3/scan_changes*.yaml`
- [ ] `S4`：产出 `${artifact_root}/${run_id}/S4/session_context.yaml`
- [ ] `S5`：产出 `${artifact_root}/${run_id}/S5/external_context.yaml`
- [ ] `S6`：产出 `${artifact_root}/${run_id}/S6/map_*.yaml`（由编排保留合并语义）
- [ ] `S7`：产出 `${artifact_root}/${run_id}/S7/summary_parts.yaml`
- [ ] `S8`：产出 `${artifact_root}/${run_id}/S8/plan_batches.yaml`
- [ ] `S9`：产出 `commands_publish`，并写入 `${artifact_root}/${run_id}/S0/end_outputs.md`

| 步骤 | 路径 | 主产物 |
|---|---|---|
| S0-executor | `executor/SKILL.md` | `${artifact_root}/${run_id}/S0/start_inputs.yaml`、`${artifact_root}/${run_id}/S0/executor_state.yaml` |
| S1 | `s1-repo-targets/SKILL.md` | `${artifact_root}/${run_id}/S1/ctx_pack.yaml` |
| S2 | `s2-subject-limit-detector/SKILL.md` | `${artifact_root}/${run_id}/S2/limit_subject.yaml` |
| S3 | `s3-git-change-scan/SKILL.md` | `${artifact_root}/${run_id}/S3/scan_changes*.yaml` |
| S4 | `s4-session-context-reader/SKILL.md` | `${artifact_root}/${run_id}/S4/session_context.yaml` |
| S5 | `s5-external-markdown-ingest/SKILL.md` | `${artifact_root}/${run_id}/S5/external_context.yaml` |
| S6 | `s6-session-capability-merge/SKILL.md` | `${artifact_root}/${run_id}/S6/map_*.yaml` |
| S7 | `s7-commit-summary-assembler/SKILL.md` | `${artifact_root}/${run_id}/S7/summary_parts.yaml` |
| S8 | `s8-commit-batch-plan/SKILL.md` | `${artifact_root}/${run_id}/S8/plan_batches.yaml` |
| S9 | `s9-git-publish-command-emitter/SKILL.md` | `commands_publish` |

## 全局约束
1. 不执行 `git commit` / `git push`。
2. 文件清单每行一个路径。
3. 规则单写点：S2 负责 `subject_limit`，S7 负责 summary 裁剪，S8 只消费结果，S9 只生成可复制发布命令。
4. `推送参数` 不传时默认 `origin`；`分支名` 不传时默认当前分支（由执行方在仓库内解析）。
5. 默认开启中间产物 offload：
   - S0（START）与 S1~S8 的结构化中间结果写入 artifact 文件
   - 子 skill **不透传**结构化中间大对象；后续步骤按固定文件路径从 artifact 中读取
   - S8/S9 的渲染仍以契约模板为准（最终用户看到的仍是完整 S8/S9 渲染块）
6. 最终用户可读文本必须由 S9 写入 `${artifact_root}/${run_id}/S0/end_outputs.md`（而不是依赖对话上下文累积拼接）。
7. executor 必须先落盘并更新：`${artifact_root}/${run_id}/S0/executor_state.yaml`，否则本次运行应视为低置信并建议重跑。

## 入口执行器（必经）
父级入口调用时必须先完成「落盘与调度」并确保 executor 状态机可追溯；执行器状态机契约见：`artifact/states/EXECUTOR_STATE_MACHINE.yaml`。

## Artifact 命名（子 skill 需自包含遵循）
- artifact_root：父 START 输入或默认路径
- run_id：父 START 输入或自动生成；若未显式传入，则必须为本次调用生成“新目录唯一”的 run_id（包含 uuid/nonce），禁止复用旧 run_id
- 约定每一步写入一个或多个固定文件（后续步骤按固定路径读取）
  - `${artifact_root}/${run_id}/S0/start_inputs.yaml`
  - `${artifact_root}/${run_id}/S0/end_outputs.md`
  - `${artifact_root}/${run_id}/S1/ctx_pack.yaml`
  - `${artifact_root}/${run_id}/S2/limit_subject.yaml`
  - `${artifact_root}/${run_id}/S3/scan_changes.yaml`
  - `${artifact_root}/${run_id}/S3/scan_capability_candidates.yaml`
  - `${artifact_root}/${run_id}/S4/session_context.yaml`
  - `${artifact_root}/${run_id}/S5/external_context.yaml`
  - `${artifact_root}/${run_id}/S6/map_capabilities.yaml`
  - `${artifact_root}/${run_id}/S6/map_coupling_bundles.yaml`
  - `${artifact_root}/${run_id}/S6/map_conflicts.yaml`
  - `${artifact_root}/${run_id}/S6/map_confidence.yaml`
  - `${artifact_root}/${run_id}/S6/map_notes.yaml`
  - `${artifact_root}/${run_id}/S7/summary_parts.yaml`
  - `${artifact_root}/${run_id}/S8/plan_batches.yaml`

## 执行器落盘目录约定（artifact/）
- 模板目录：`artifact/templates/`（包含每个 `Sx` artifact 的「可被 YAML parser 解析」的空骨架；run 时整体拷贝到 `${artifact_root}/${run_id}` 并覆盖写入）
- 状态机：`artifact/states/EXECUTOR_STATE_MACHINE.yaml`（定义模板拷贝覆盖、start_inputs 写入、按 `S1~S9` 顺序执行与 artifact 校验的状态）
- 契约索引：`artifact/yamls/ARTIFACT_CONTRACTS.yaml`（定义 artifact 关键顶层键存在性与 YAML 可解析性约束，用于低置信度/人工确认判定）

## 契约索引（单写点）
所有 **执行契约以各子 `SKILL.md` 为准**：字段命名、透传包、冲突与置信度、首行/正文分工、S9 命令输出均在对应子 skill 内自包含定义。`README.md` 仅作人类导航与解释，不作为执行依赖。
