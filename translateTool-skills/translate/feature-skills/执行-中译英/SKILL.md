---
name: 执行-中译英
description: 当需要把 CSV/XLSX「词条」批量翻译为「英文翻译」时使用（zh2en）；可与英译俄在同一 DAG 池并行。
---

# 核心任务

运行 `translateCsv.js` 的 `zh2en` 阶段（`--mode zh2en` 或 `pipeline`）：加载术语库，翻译并写入「英文翻译」列。

## 命令

```bash
node translateCsv.js <input> <output_dir> [glossary.xlsx] [--mode zh2en] [--debugPrompt] [--sort|--no-sort]
```

流水线（中→英完成后同进程立刻投递英→俄）：

```bash
node translateCsv.js <input> <output_dir> --mode pipeline --limit 20
```

## 输入 / 前置条件

- 输入含「词条」列
- 依赖已 `npm install`
- 并发约定见 `[[../../references/concurrency-dag.md]]`

## 行为要点

1. 加载 `glossary/translation-rules.md` 与 Excel 术语 sheet
2. 可对 comment/tag 应用场景规则与大小写纠正
3. 中文规范性检查 → 备注1
4. 批次约 100；与 en2ru **共用**讯飞池（硬顶 20）；智谱串行
5. `pipeline` 下：本批英译成功且该行需要俄文 → 动态入队 `en2ru_batch`，不阻塞其它 zh2en 批

## 输出

- zh2en：更新后的 CSV/XLSX（可写 `_EN机翻` 断点）
- pipeline：最终 `*_RU机翻.*`（含英+俄列）
- 错误日志（如有）

## 下一步

→ `[[../校验-占位符与写出/SKILL.md]]`（pipeline 一次验英+俄）

## 边界

- 单 mode zh2en 不覆盖「俄文翻译」列。
- 与英译俄并行时服从全局池，不得另起多进程抢额度。
