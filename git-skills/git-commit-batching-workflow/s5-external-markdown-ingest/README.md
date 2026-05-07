# S5 外部 Markdown 接入

## 作用
读取你手工压缩的外部 markdown，并标准化为 `external_*`。

## 输入
- 会话/控制参数：`${artifact_root}/${run_id}/S0/start_inputs.yaml`（`external_doc_paths[]`、`doc_role`、`trust_level`）
- 变更事实校验：`${artifact_root}/${run_id}/S3/scan_changes.yaml`（可用于判断文档与 git 事实是否明显矛盾）
- 会话约束：`${artifact_root}/${run_id}/S4/session_context.yaml`

## 输出
- 写入 `${artifact_root}/${run_id}/S5/external_context.yaml`

## 单写点
外部文档读取与结构化口径只在 S5 定义。

## 不做
不做三源合并，不写提交文案。
