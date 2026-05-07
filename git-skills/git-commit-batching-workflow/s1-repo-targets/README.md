# S1 输入规范化

## 作用
把用户 START 文本落盘到 artifact，并生成 `S1/ctx_pack.yaml` 供后续步骤读取。

## 输入
- `${artifact_root}/${run_id}/S0/start_inputs.yaml`（包含 workspace_root/repo_names/themes_raw 等）

## 输出
- 写入 `${artifact_root}/${run_id}/S1/ctx_pack.yaml`（包含 `ctx_workspace_root`、`ctx_repos`、`ctx_themes`、`ctx_parse_notes`）

## 与下游
- `S1/ctx_pack.yaml` 在 S2 起被读取，用于产生 `limit_subject`；在 S3/ S6/ S7/ S8 也会从固定路径读取该 artifact。

## 单写点
主题解析规则只在 S1 定义。

## 不做
不跑 git，不做映射，不写提交文案。
