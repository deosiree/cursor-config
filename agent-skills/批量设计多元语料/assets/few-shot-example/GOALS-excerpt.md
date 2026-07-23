# 深语料 Goal 看板（摘录 · 实战格式）

> 续跑：`python scripts/check-rag-corpus-gates.py` → 只修 FAIL。

## 最近一次脚本摘要

```text
version=v1.1.0 PASS
[volume] OK han≈197911 md=227/200
[journeys] OK（16 条）
[golden] OK total=288
```

| 维度 | 状态 | 说明 |
|------|------|------|
| volume | OK | 去垫汉字 ~198k · md **227**/200 |
| journeys | OK | **16** 条跨模块端到端 |
| golden | OK | **288**；含 `journey_id` |
| shots | skipped | 人截优先 |

## 仍诚实未完

- 源码并非每个控件都已落盘；深度靠继续挖 Vue  
- 业务截图未全部经人确认 ready
