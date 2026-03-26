# S3 Git 变更扫描

## 作用
收集未提交文件与路径启发式标签。

## 输入
- 读取 `${artifact_root}/${run_id}/S1/ctx_pack.yaml`
- 读取 `${artifact_root}/${run_id}/S2/limit_subject.yaml`

## 输出
- 写入 `${artifact_root}/${run_id}/S3/scan_changes.yaml`
- 写入 `${artifact_root}/${run_id}/S3/scan_capability_candidates.yaml`

## 单写点
扫描规则与状态归类只在 S3 定义。

## 不做
不做会话语义合并，不写提交方案。
