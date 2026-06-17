---
name: 执行-回验输出
description: Use when 需要验证缩短结果是否合规并写输出文件
version: 2.0.0
tags: [json-精简超长翻译, translateTool-skills]
metadata:
  darwin:
    parent_skill: json-精简超长翻译
---

# 核心任务

运行 `scripts/check-russian.js --mode verify`，验证缩短后全部 ≤ byteLimit，通过则写入 `{原路径前缀}_new/` 保持相对目录结构。

## 何时触发

- 缩短完成后，或检测报告全合规需直接复制时

## 输入 / 前置条件

- `shortenedData`（缩短后的 JSON 数据，或原 JSON）
- `confirmedMeta`（含 inputPath、byteLimit、outputSuffix、fieldPath）

> ⚠️ **v2 对象数据模式**：`byteLimit` 来自 interpretation 的 `actualMax`，单位是 **UTF-8 字节数**（不是字符数）。
> 例如 interpretation `限制:32` → `actualMax=31` → `byteLimit=31`（字节）。

## 执行方式

```bash
node scripts/check-russian.js \
  --input "<shortenedDataPath>" \
  --field-path "<fieldPath>" \
  --byte-limit <byteLimit> \
  --output-suffix "_new" \
  --mode verify
```

## 输出

- `verifyResult`：
  - `passed`（boolean）
  - `failedEntries`（未通过的条目列表）
  - `outputPath`（输出文件的路径）
- 全部通过时：实际写入 `_new` 目录

## 下一步路由

- `passed = true` → 流程结束，用户可到 `outputPath` 查看结果
- `passed = false` → 返回 `[[../../intention-skills/编排-精简工作流/SKILL.md]]` 再次编排缩短

## 边界

- 如果 `workflowPlan.nextAction = copy_only`（全合规），退化为"原样复制到 _new 目录"。
- v2 模式下验证基准是 UTF-8 字节数，使用 `Buffer.byteLength()` 计算。
- `scripts/check-russian.js` 的 `--byte-limit` 参数接收的也是 UTF-8 字节数。
