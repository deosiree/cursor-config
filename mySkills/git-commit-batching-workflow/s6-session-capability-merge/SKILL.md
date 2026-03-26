---
name: git-commit-batching-workflow-s6-session-capability-merge
description: Merge git scan, session context, and external docs into final capability mapping with source trace.
---

# S6：能力映射合并

## 职责（单写点）
只产出 `map_*`，作为提交分批与文案的语义来源。

## 批次拆分启发式（与 S8 对齐）

- 输出 `map_capabilities` 时，**尽量一行对应一个可独立提交的语义单元**；S8 将按行（或按 `source_refs` 聚类）拆 `plan` 批次。
- 若一行下文件过多或跨多个无关目录，在 `map_notes` 中提示 **再拆子批**（建议按目录或依赖层级切分，保持可独立回滚）。
- **变更事实**仍以 `scan_changes` 为准；拆批不得掩盖 `MM/MD`，须在 `map_notes` 提示先整理暂存区。

## 能力域拆分协议（自包含）

为避免一个 commit 囊括多个可解耦能力、导致推送批次失去意义，本步骤对 `map_capabilities` 输出施加默认细拆策略；当出现“强耦合 bundle”时，才允许同一批次承载多个主能力 tag。

- 默认细拆策略：
  - `map_capabilities[].capability_tags` **必须只包含 1 个元素**（作为该条的“主能力 tag”）。
  - 同一条 `map_capabilities` 仍然应尽量对应一个可独立回滚的语义单元。
- 若同一份路径集合同时命中多个能力 tag：
  - 必须将其拆分为 **多条 `map_capabilities`**（每条对应 1 个主能力 tag）。
  - 若需要拆分文件集合，则按“最小可独立回滚集”原则分割 `paths`，并为每条独立写明理由（写入 `map_notes`）。
- 强耦合 bundle（允许同批合并，例外口径二选一/并集）：
  - 触发条件 A（硬条件）：拆分会导致 `build/test` 不通过、或形成中间态不可运行/不可落地。
  - 触发条件 B（语义硬条件）：这是一个 feature 与其 tests/或其直接依赖被“添加又使用”，逻辑上是同一意图（语义上必须一起提交以避免回归语义断裂）。
  - 因以上二者都算，所以在需要同批合并时，必须在 `map_coupling_bundles` 写明 `merge_reason` 与 `coupling_evidence`（证据必须可追溯到 scan/session/external 的事实描述）。
  - `requires_user` 用于标记：证据不足或存在可替代拆分方案时，需要人工确认。

## 批次粒度结果（与 S8 的关系）
- 默认情况下，S8 的每个批次只消费 **单主能力 tag 对应的那条 `map_capabilities`**。
- 当 S6 输出 `map_coupling_bundles` 时：S8 将按 `capability_entry_ids` 将对应多条 `map_capabilities` **聚合到同一批次**，并在批次块内展示合并原因（用于解释为什么“看似可解耦”但仍必须同批）。

## 输入
- `artifact_root`（父 START 输入或默认值）
- `run_id`（父 START 输入或自动生成）
- S6 从固定 artifact 文件读取合并输入：
  - `${artifact_root}/${run_id}/S1/ctx_pack.yaml`
  - `${artifact_root}/${run_id}/S2/limit_subject.yaml`
  - `${artifact_root}/${run_id}/S3/scan_changes.yaml`
  - `${artifact_root}/${run_id}/S3/scan_capability_candidates.yaml`
  - `${artifact_root}/${run_id}/S4/session_context.yaml`
  - `${artifact_root}/${run_id}/S5/external_context.yaml`

## 输出（给 S7 / S8；无需透传对象，固定路径写文件）
合并规则（内置）：
- 硬约束冲突优先入 `map_conflicts`，不静默覆盖
- 路径/状态事实只信任 `scan_changes`
- 语义标签优先级：用户会话确认 > 外部决策文档 > 路径启发式

## `map_confidence` 与 `map_conflicts` 规则（自包含）
- `map_conflicts[].requires_user`：
  - 若冲突涉及“硬约束语义”（例如必须同批/必须拆批）且无法由规则直接消解：`true`
  - 若冲突仅涉及“语义标签强度”而存在唯一可归因方案（可从 session 或 external 直接选定）：`false`
- `map_confidence.level`（示例启发式，须写 reasons）：
  - `high`：session_context.trace.completeness=full；external_context 未引入明显矛盾；且 `map_conflicts` 为空或全为可自动消解（requires_user=false）
  - `medium`：completeness=partial/unknown 但未触发 needs-user 的硬冲突，或存在 requires_user=false 且 suggested_resolution 非空
  - `low`：至少一条需要人工确认（requires_user=true），或 external/session 与 git scan 的事实层矛盾未解决
- `map_confidence.reasons`：必须给出至少 1 条短因果（不可空）。

## 输出文件（固定写入）
- 写入 `${artifact_root}/${run_id}/S6/map_capabilities.yaml`
- 写入 `${artifact_root}/${run_id}/S6/map_coupling_bundles.yaml`
- 写入 `${artifact_root}/${run_id}/S6/map_conflicts.yaml`
- 写入 `${artifact_root}/${run_id}/S6/map_confidence.yaml`
- 写入 `${artifact_root}/${run_id}/S6/map_notes.yaml`

## 不做
- 不执行 git/shell
- 不写标题/正文
