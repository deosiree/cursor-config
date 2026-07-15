# excel-精简超长翻译

Excel「俄文翻译」压到 UTF-8 ≤63。缩短走 free 多模型；验证走 DeepSeek。

```bash
cd translateTool-skills/excel-精简超长翻译
node compressExcelRu.js "<input.xlsx>" "<outDir>" --byte-limit 63 --multi-model --models all --limit 5
node scripts/verify-ru-compress.js --in "<outDir>/*_已压63.xlsx" --byte-limit 63
```
