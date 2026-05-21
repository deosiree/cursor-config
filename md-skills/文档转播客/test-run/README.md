# Darwin 评测 · test-run

本 skill **默认** 使用 `main_agent_dual_track`，**不要求** Cursor Task 子 agent。

## eval_mode 三档

| eval_mode | 做法 | 何时用 |
| --- | --- | --- |
| `main_agent_dual_track` | 主 agent 两次执行：with_skill（读 SKILL）vs baseline（不读 SKILL）；产物分别写入 `with_skill/`、`baseline/` | **默认** |
| `script_gated` | 仅跑 `validate-podcast-md.py`；N>7 检查 `检查点A-回复.md` 是否存在 | 快速回归 |
| `subagent_blind` | Task 双 agent（需 Auto/付费模型） | 对外发版、争议分数 |

记录分数时写入 [`../results.tsv`](../results.tsv) 的 `eval_mode` 列。

## 目录

| 路径 | 说明 |
| --- | --- |
| `source-*.md` | 测试用源文 |
| `with_skill/` | 带 skill 轨产物 |
| `baseline/` | 无 skill 轨产物 |
| `full_test-report.md` | 最近一次 full_test 报告 |

## 复现 script_gated

```powershell
python "..\\scripts\\validate-podcast-md.py" "with_skill\\播客朗读稿-useEffect.md"
```

baseline 稿预期 **校验失败**（缺双人 U 型结构）。

## 最近一次冒烟（script_gated + TTS）

| 项 | 结果 |
| --- | --- |
| `with_skill/播客朗读稿-useEffect.md` validate | 通过 |
| `baseline/播客朗读稿-useEffect.md` validate | 失败（预期） |
| TTS 冒烟 | 本机 edge-tts 网络/SSL 失败 → 走检查点 C，见 `references/tools.md` |
