# 实跑报告 — top5-compress63

**日期:** 2026-07-15  
**夹具:** `template/few-shot-example/top5-compress63/input.xlsx`（源表前 5 行）  
**命令:**

```bash
node compressExcelRu.js .../input.xlsx .../run_out \
  --byte-limit 63 --multi-model --models all --limit 5 --max-rounds 3 --batch-size 5
node scripts/verify-ru-compress.js --in .../input_已压63.xlsx --byte-limit 63
```

## 结果

| 指标 | 值 |
|------|-----|
| stillOver | 0 |
| cjkInRu | 0 |
| residualEn | 0 |
| glossParen | 0 |
| maxBytesAfter | 52 |
| verifyModel | deepseek:deepseek-v4-flash |
| recommendDeliver | true |
| truncate_fallback | 0 |

缩短：free 多模型（GLM-4-9B 等）一轮完成；DeepSeek 批验全 PASS。

## 产物

- `run_out/input_已压63.xlsx`
- `run_out/input_已压63.csv`
- `run_out/excel-compress-verify.json`
