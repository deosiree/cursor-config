---
name: 执行-英译俄
description: 当需要把「英文翻译」（或词条）批量译为「俄文翻译」并输出 `_RU机翻` 时使用（en2ru）；可与中译英在同一 DAG 池并行。
---

# 核心任务

运行 `translateCsv.js --mode en2ru`（或由 `pipeline` 动态投递 `en2ru_batch`）：跳过中文术语库，英→俄，回填俄文列。

## 命令

```bash
node translateCsv.js "f:\DownLoads\qt通用语言.xlsx" "f:\DownLoads" --mode en2ru --limit 20 --debugPrompt
# 交付: *_RU机翻.csv / *_RU机翻.xlsx
```

全量（试跑通过后）：

```bash
node translateCsv.js "input.csv" "out_dir" --mode en2ru
```

## 真实试跑对照（2026-07-14）

| EN | RU（摘要） | 占位符 |
|----|-----------|--------|
| Sync | Синхронизация… | 无 |
| Could not register file '%1': %2 | …файл '%1': %2 | 保留 |

验收：`--limit 20`、错误数 0、输出 `_RU机翻.*`、含 `%1` 行占位符原样。

## 全量实跑要点（2026-07-15 · 3842）

```bash
node translateCsv.js "<去重xlsx绝对路径>" "<同目录outdir>" --mode en2ru --force --multi-model --models all
# 终局约 filled=3838 empty=4；Busy/ECONNRESET 属供应商压力
# 补空：去掉 --force 再跑同一命令（skipIfFilled）
node scripts/verify-post-translate.js --out "<outdir/*_RU机翻.xlsx>" --baseline "template/few-shot-example/misalign-10-regression/baseline-bad.json"
```

排障：有 `活跃翻译模型 (N)` + `en2ru 批量翻译成功` 递增 → 不是 skill 引用断裂。

## 输入 / 前置条件

- 含「英文翻译」列（空则 fallback「词条」）
- 含「俄文翻译」列（可为空）
- 已 `npm install`
- 细则见 `[[../../references/modes-en2ru.md]]`、`[[../../references/concurrency-dag.md]]`

## 行为要点

1. 不加载中文术语库 / comment 大小写 / 中文校验（单 mode en2ru）
2. 已有俄文默认跳过（`skipIfFilled`）；`--force` 覆盖
3. 批次大小 40；与 zh2en **共用**讯飞池（硬顶 20，失败减半）；智谱串行
4. 可与未完成的 zh2en 批次并行；也可由 pipeline 在英列写完后动态入队
5. 使用 `prompts/prompt-*-en2ru.md`

## 输出

- `{原名}_RU机翻.csv` / `.xlsx`（断点续跑可同文件覆盖）
- 可选 `*_prompt_debug.md`、`*_errors.log`

## 下一步

→ `[[../校验-占位符与写出/SKILL.md]]`

## 边界

- 不改英文列（除非处于 pipeline 且英列由 zh2en 写入）。
- 全量前必须经过编排层 🔴 CHECKPOINT 试跑。
