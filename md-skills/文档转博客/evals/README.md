# 评测记录

Darwin 分数历史：[`../results.tsv`](../results.tsv)

**本仓库默认 eval_mode**：`main_agent_dual_track`（见 [`../test-run/README.md`](../test-run/README.md)）。

| eval_mode | 含义 |
| --- | --- |
| `main_agent_dual_track` | 主 agent 双轨，不依赖子 agent |
| `script_gated` | 脚本门禁快速回归 |
| `subagent_blind` | Task 双 agent（可选） |
| `dry_run` | 结构推演，未跑双轨产物 |
| `full_test` | 含维度 8 双轨对比（可与 main_agent_dual_track 同次） |
