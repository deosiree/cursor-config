# S4 会话上下文读取

## 作用
读取当前会话或指定会话（工具 + session_id），结构化产出 `session_*`。

## 输入
- 控制参数：`${artifact_root}/${run_id}/S0/start_inputs.yaml`（`session_source/session_id/lookback_scope`）
- 变更事实：`${artifact_root}/${run_id}/S3/scan_changes.yaml`
- 路径启发式候选：`${artifact_root}/${run_id}/S3/scan_capability_candidates.yaml`

## 输出
- 写入 `${artifact_root}/${run_id}/S4/session_context.yaml`

## 单写点
会话读取与标准化口径只在 S4 定义。

## 不做
不读取外部 markdown，不做能力合并。
