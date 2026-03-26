# S6 三源能力映射合并

## 作用
将 `scan_* + session_context + external_context` 合并为 `map_*`。

## 输入
- 读取 `${artifact_root}/${run_id}/S3/scan_changes.yaml`
- 读取 `${artifact_root}/${run_id}/S3/scan_capability_candidates.yaml`
- 读取 `${artifact_root}/${run_id}/S4/session_context.yaml`
- 读取 `${artifact_root}/${run_id}/S5/external_context.yaml`（无外部文档时仍为空结构）

## 输出
- 写入 `${artifact_root}/${run_id}/S6/map_capabilities.yaml`
- 写入 `${artifact_root}/${run_id}/S6/map_coupling_bundles.yaml`
- 写入 `${artifact_root}/${run_id}/S6/map_conflicts.yaml`
- 写入 `${artifact_root}/${run_id}/S6/map_confidence.yaml`
- 写入 `${artifact_root}/${run_id}/S6/map_notes.yaml`

合并优先级与置信度启发式：**单写点** 定义在父级 `README.md`「V2 I/O 契约」§5、§6。

## 批次拆分
- 尽量 **一行 map 对应一批 commit 语义**；默认 **一批次只围绕单一主能力 tag**（可回滚、可独立 review）。
- 若存在强耦合（拆分会导致 `build/test` 不通过/不可运行，或是 feature+tests/依赖被“添加又使用”的同一意图），则允许由 `map_coupling_bundles` 指定同批聚合多个主能力 tag，并在合并原因中给出 `merge_reason/coupling_evidence/requires_user`。
- 若同一条变更命中多个可解耦能力，则在 `map_notes` 提示拆分并把其拆为多条 `map_capabilities`（每条只保留 1 个主能力 tag）。

## 单写点
能力映射合并口径只在 S6 定义。

## 不做
不跑 git，不写标题/正文。
