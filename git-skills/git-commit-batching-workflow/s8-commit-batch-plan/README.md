# S8 分批计划与提交文案

## 作用
生成最终批次计划（标题/正文/文件清单）。

## 输入
- 读取 `${artifact_root}/${run_id}/S1/ctx_pack.yaml`
- 读取 `${artifact_root}/${run_id}/S3/scan_changes.yaml` 和 `${artifact_root}/${run_id}/S3/scan_capability_candidates.yaml`
- 读取 `${artifact_root}/${run_id}/S2/limit_subject.yaml`
- 读取 `${artifact_root}/${run_id}/S6/map_capabilities.yaml`、`${artifact_root}/${run_id}/S6/map_coupling_bundles.yaml`、`${artifact_root}/${run_id}/S6/map_conflicts.yaml`、`${artifact_root}/${run_id}/S6/map_confidence.yaml`、`${artifact_root}/${run_id}/S6/map_notes.yaml`
- 读取 `${artifact_root}/${run_id}/S7/summary_parts.yaml`

## 输出
- 写入 `${artifact_root}/${run_id}/S8/plan_batches.yaml`

## 标题
- `header_full` / 可选 `header_short` + `summary_final`（见 `SKILL.md`）
- 首行只写动作；主题与问题—解决在正文（见父级 `README.md`「输出契约」）

## 正文
- 【元信息】一行一项：`主题：` / `能力：`
- 可选【摘要】
- 四段式：定义 / 问题 / 解决 / 价值

## 单写点
S8 只消费 S2/S7 的既定结果（长度与 summary），不重复探测或裁剪；输出模板中「合并元信息」展示 `map_confidence` / `map_conflicts`（可选）。

## 不做
不执行 commit/push。
