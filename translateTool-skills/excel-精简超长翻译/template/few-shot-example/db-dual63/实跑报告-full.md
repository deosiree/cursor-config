# db-dual63 全量实跑报告

## 输入
- 源：`数据库数据没翻译的词条翻英文和俄文.xlsx`（1040 行；表头在第 2 行）
- 备份：`…_preDual63.xlsx`
- 干净夹具：`template/few-shot-example/db-dual63/input.xlsx`

## 流程
1. `translate --mode dual --models xfyun:xophunyuan7bmt`（只填空，无 `--force`）
2. 标识符 KEEP：无 CJK 拉丁词条英/俄拷贝；校验允许 identity（避免误清）
3. `compressExcelRu --byte-limit 63 --models xfyun:xophunyuan7bmt`

## 结果
| 指标 | 值 |
|------|-----|
| 行数 | 1040 |
| 空英文 | 0 |
| 空俄文 | 0 |
| 俄文超 63 | 0 |
| CJK in RU | 0 |
| maxBytes | 63 |
| truncate_fallback | 95 |
| verify hard pass | true |
| recommendDeliver | true（硬门禁绿；DS soft-fail 多为 KEEP 标识） |

## 交付
源旁路：`数据库数据没翻译的词条翻英文和俄文_双译已压63.xlsx`（不覆盖源）
中间产物：`dual63_out/full/*_RU机翻.xlsx`、`dual63_out/compress/*_已压63.xlsx`
