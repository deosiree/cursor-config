---
name: 导出-多格式raw与数据集
description: 从 styles 导出 formats/raw 多格式，并生成/刷新 golden 与 split-test、split-runtime（及可选 dev）；不替代门禁脚本。
version: 1.0.0
tags: [rag, export, dataset, formats]
metadata:
  tier: feature
  parent: 批量设计多元语料
---

# 目标

让语料可被「多格式入库试验」与「测集/运行集」消费：raw 导出 + jsonl 划分；导出成功 ≠ Goal PASS。

## 何时使用

- 编排在核验前的导出步
- 用户抱怨 formats/raw 过薄
- 金标已增需重切 split

## 输入

| 字段 | 示例 | 说明 |
|------|------|------|
| styles_root | `data/rag-corpus/styles` | 源 md |
| raw_root | `data/rag-corpus/formats/raw` | 导出根 |
| golden_path | `data/rag-corpus/eval/golden-qa.v1.jsonl` | 金标 |
| export_script | `scripts/export-rag-formats-raw.py` | 有则调用；无则本步最小 md→txt |
| split_ratio | `test:runtime:dev = 2:1:0` 或按 EVAL_GATES | 禁止复制同行充数 |

## 步骤

1. **定导出家族**  
   从 MANIFEST 有效条目或 styles 主题选文件；每家族至少写出 `md` + `txt`（同 stem）。

2. **跑/写导出**  
   ```bash
   # 若仓内已有导出脚本（实战参考，勿整抄语料）：
   python scripts/export-rag-formats-raw.py
   # 无脚本时：对清单内每个 .md 写同名 .txt 到 formats/raw/txt/，md 拷到 formats/raw/md/
   ```  
   输出目录：`formats/raw/{md,txt,docx,pdf,images}/`；图片只拷清单已有路径，不造图、不覆盖人类截图。

3. **数据集（jsonl 行契约）**  
   每行一个 JSON 对象，字段最少：

   ```json
   {"id":"jq-001","question":"…","answer":"…","split":"test","journey_id":"J-EXCEL-LOOP","tags":["journey"],"source":"styles/journeys/….md"}
   ```

   - `split` ∈ `test|runtime|dev`  
   - 旅程题必须带 `journey_id`；`tags` 含 `journey`  
   - 划分后写入 `split-test.jsonl` / `split-runtime.jsonl`（可选 `split-dev.jsonl`）  
   - 条数下限以 `EVAL_GATES` / 门禁脚本常量为准（默认 test≥80、runtime≥40）

4. **记录**  
   在 `eval/dry-run-log.md` 写：`exported_at`、家族数、golden 总行、各 split 计数。  
   **导出成功 ≠ Goal PASS**；接着必须跑核验脚本。

## 输出

| 产物 | 验收信号 |
|------|----------|
| `formats/raw/md|txt/...` | 主要家族非空 |
| `eval/golden-qa.v1.jsonl` | 可 `json.loads` 逐行 |
| `eval/split-*.jsonl` | 门禁脚本能计 test/runtime |
| 导出摘要一行 | `export families=<n> golden=<n> test=<n> runtime=<n>` |

## 失败分支

| 情况 | 动作 |
|------|------|
| 无 docx/pdf 工具 | 至少保证 md+txt；报告降级 |
| golden 少于阈值 | 回旅程/模块补金标，再切分 |
| 导出覆盖用户手改 raw | 默认只更新由清单驱动的文件；手改路径跳过或询问 |

## 反例

- 只拷空 txt 占位凑文件数
- 用同一问答复制 N 份充 test 集
- 宣称「raw 已满」跳过 check 脚本

## 验收

- raw 中主要家族非空
- split 条数可被门禁脚本计数
- 无密钥/内网口令进 raw
