# few-shot · misalign-10-regression

历史实跑（2026-07-14）中 **行错位** 的 10 条毒行，用于验证换行哨兵 + 条数门禁 + 译后验证 skill。

| 文件 | 说明 |
|------|------|
| `input.xlsx` / `input.csv` | 源表（俄文列空） |
| `baseline-bad.json` | 当时错误俄文，用作否证 |
| `run_out/` | 修复后实跑输出（生成） |
| `acceptanceReport.json` | `verify-post-translate.js` 报告 |

## 实跑

```bash
cd translateTool-skills/translate
node translateCsv.js \
  "template/few-shot-example/misalign-10-regression/input.xlsx" \
  "template/few-shot-example/misalign-10-regression/run_out" \
  --mode en2ru --force

node scripts/verify-post-translate.js \
  --out "template/few-shot-example/misalign-10-regression/run_out/input_RU机翻.xlsx" \
  --baseline "template/few-shot-example/misalign-10-regression/baseline-bad.json"
```

期望：`acceptanceReport.pass === true` 且 `stillLooksMisaligned` 为空。
