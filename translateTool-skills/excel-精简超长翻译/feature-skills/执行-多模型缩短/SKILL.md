---
name: 执行-多模型缩短
description: Use when 用 free 多模型并发缩短 Excel 超长俄文
---

# 执行-多模型缩短

- workers：`resolveShortenWorkers({ multiModel:true, models:'all' })`，**不含 DeepSeek**
- prompt：`prompts/prompt-batch-ru-shorten.md`
- 批大小 12–15；Busy / 条数不齐 → failover
- 规则：缩写优先；3 轮后仍超才 `truncateUtf8Boundary` + `备注1=truncate_fallback`
