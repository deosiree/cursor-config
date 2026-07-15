# few-shot · translate 样例索引

本目录存放可对照的输入/输出与实跑评估，供编排与文档引用。

## 样例列表

| 目录/文件 | 规模 | 用途 |
|-----------|------|------|
| 本目录顶层 `词条导出_*_top5.*` | 5 条 | 冒烟：`en2ru` + debugPrompt |
| [`multiline-wire-guard.csv`](./multiline-wire-guard.csv) | 5 条含换行 | 批线协议回归（换行哨兵防错位） |
| [`misalign-10-regression/`](./misalign-10-regression/) | **10** 条历史毒行 | 实跑否证：修后不再串行 + 译后验证 |
| [`mon-1.9.0-dedup-en2ru-all-models/`](./mon-1.9.0-dedup-en2ru-all-models/) | **3842** 条 | 生产实跑：全模型并发 EN→RU + [评估文档](./mon-1.9.0-dedup-en2ru-all-models/实跑评估-全模型并发-en2ru.md) |
| `pipeline_smoke_5.*` | 5 条 | pipeline 模式烟雾 |

---

## A. top5 冒烟

### 来源

`...\mon-1.9.0补充qt通用语言\词条导出_20260714074812.csv` 截取前 5 条。

### 文件

| 文件 | 说明 |
|------|------|
| [`词条导出_20260714074812_top5.csv`](./词条导出_20260714074812_top5.csv) | 测试输入 |
| [`词条导出_20260714074812_top5_ru.xlsx`](./词条导出_20260714074812_top5_ru.xlsx) | 俄文回填输出（若有） |
| [`top5-对照表.md`](./top5-对照表.md) | 源/俄对照 |
| `词条导出_20260714074812_top5_prompt_debug.md` | prompt 调试 |

### 命令

```bash
cd translateTool-skills/translate
node translateCsv.js "template/few-shot-example/词条导出_20260714074812_top5.csv" "template/few-shot-example" --mode en2ru --force --debugPrompt
```

要点：`--mode en2ru` 以**词条**为源（空则 fallback 英文翻译），目标列「俄文翻译」。

---

## B. 去重全量 · 全模型并发（推荐 few-shot）

目录：[`mon-1.9.0-dedup-en2ru-all-models/`](./mon-1.9.0-dedup-en2ru-all-models/)

| 文件 | 说明 |
|------|------|
| `input.xlsx` | 去重后送翻前 3842 行 |
| `output_RU.xlsx` / `output_RU.csv` | 俄文机翻全满结果 |
| [`实跑评估-全模型并发-en2ru.md`](./mon-1.9.0-dedup-en2ru-all-models/实跑评估-全模型并发-en2ru.md) | 耗时、8 模型、并发 20、时序与吞吐 |
| `run-stats.json` | 机器可读指标快照 |

**一句话指标：** 8 路模型 + DAG≤20；Pass1 **≈10.3 min / ≈374 词条·min⁻¹**；单路均摊 **≈47 词条·min⁻¹·路⁻¹**；补跑后 3842 全满。
