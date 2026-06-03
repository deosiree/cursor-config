# Assets

本目录存放 Pod 诊断过程中的实际样本输出，用于 few-shot 参考与 evals 验证。

## 计划放入

- `describe-oom-killed-output.txt` — kubectl describe 的 OOMKilled 完整 Events
- `events-warning-sample.txt` — Warning 类型 events 输出
- `top-pod-memory-sample.txt` — kubectl top pod --sort-by=memory 输出

> 当前为空目录 — 积累到第一个真实 Pod 诊断会话后回填。
