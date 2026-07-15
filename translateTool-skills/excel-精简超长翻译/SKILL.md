---
name: excel-精简超长翻译
description: 当需要把 Excel「俄文翻译」列压缩到 UTF-8≤63 字节（C++ strlen）时使用。缩短用 free 多模型并发；验证用 DeepSeek。
version: 1.0.0
tags: [translation, russian, excel, utf8, byte-limit, compress, deepseek-verify]
---

# 目标

把 Excel「俄文翻译」压到 **UTF-8 字节 ≤ 63**（默认）：free 池并发缩短 → 硬门禁 → DeepSeek 批验 → 旁路写出 `_已压63.xlsx`。

## 何时使用

- 输入是带「俄文翻译」列的 Excel，且俄文 UTF-8 超长（对象/元数据 ≤63 场景）
- 要批量语义缩写，而不是新开 en2ru 翻译流水线

## 何时不要使用

- JSON / `.dic` / `.report` 俄语缩短 → 用 `json-精简超长翻译`
- 整表英→俄新译 → 用 `translate`
- 仅需单条聊天润色、无文件

## 模型分工

| 阶段 | 模型 |
|------|------|
| 缩短 | free：`--multi-model --models all`（不含 DeepSeek） |
| 验证 | `deepseek:deepseek-v4-flash`（`resolveVerifyWorker`） |

## 输入契约

| 字段 | 说明 | 默认 |
|------|------|------|
| `inputPath` | xlsx | 必填 |
| `outputDir` | 输出目录 | 必填 |
| `byteLimit` | UTF-8 上限 | 63 |
| `limit` | 试跑条数 | 可选；全量前必先 5 |
| `maxRounds` | 缩短+回验轮数 | 3 |

## 硬门禁

1. `Buffer.byteLength(ru,'utf8') ≤ byteLimit`
2. 无中文（CJK）
3. 无括注英注 / 无可译英文残留（同 translate）

`recommendDeliver`：硬门禁全绿 **且** 已跑 DeepSeek 验证（`excel-compress-verify.json`）。

### 🔴 CHECKPOINT

| 节点 | 动作 |
|------|------|
| 全量前 | 必须先 `--limit 5` 试跑并过硬门禁 |
| 缺 `DEEPSEEK_API_KEY` | 可跑硬规则；禁止宣称 deliver |

## CLI

```bash
node compressExcelRu.js <input.xlsx> <outputDir> \
  --byte-limit 63 --multi-model --models all \
  [--limit 5] [--max-rounds 3] [--skip-deepseek-verify]
```

## 路由

1. [[intention-skills/分析-输入确认/SKILL.md]]
2. [[intention-skills/编排-精简工作流/SKILL.md]] → 扫描 / 缩短 / 回验

## 编码约束

见 [[references/编码约束说明.md]]（闭区间 ≤63，与 json skill 开区间 `限制-1` 不同）。
