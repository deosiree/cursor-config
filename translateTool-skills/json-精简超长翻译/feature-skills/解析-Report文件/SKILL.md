---
name: 解析-Report文件
description: Use when 需要解析对象数据(v2)的 .report 文件
version: 2.2.0
tags: [json-精简超长翻译, v2, report]
metadata:
  darwin:
    parent_skill: json-精简超长翻译
---

# 核心任务

读取 `.report` 文件，解析每条超长词条的 JSON 结构，提取 translation 语种和 interpretation 约束，输出纯净的 `.dic` 文件。

## 何时触发

- `分析-识别数据类型` 输出 `dataType = object`

## 输入 / 前置条件

- `inputPath` — `.report` 文件或含 `.report` 的目录路径

## 理解 interpretation：UTF-8 字节约束 ⚠️ 关键

```json
"interpretation": "译文长度:38,限制:32"
```

`interpretation` 中的 **"长度" 和 "限制" 都是 UTF-8 字节数，不是字符数**。

| 概念 | 原来是错的 | 正确的是 |
|------|-----------|---------|
| 限制:32 | 32 个字符 | 32 个 **UTF-8 字节** |
| 实际最大 | 31 个字符 | 31 个 **UTF-8 字节** |
| 俄文字母可写数量 | 31 个 | ~15 个（每个 2 字节） |

所以 `限制:32` → `actualMax = 31 字节` → 约容纳 **15 个俄文字母 + 几个空格**。

## 推荐复用 v1 脚本

`scripts/check-russian.js` 已有可直接复用的函数：

```javascript
// UTF-8 字节长度计算
Buffer.byteLength(str, "utf-8")      // Node.js 内置

// 俄语字符预算计算（来自 check-russian.js）
function isSingleByteChar(ch) {
  return ch.charCodeAt(0) < 128;
}
function calcCharBudget(text, byteLimit) {
  const singleByteCount = [...text].filter(isSingleByteChar).length;
  const remaining = byteLimit - singleByteCount;
  return Math.max(0, Math.floor(remaining / 2));
}
```

用法：`calcCharBudget(原始译文, actualMax)` → 返回可写入的俄文字母数，交给 LLM 作为缩短预算。

## 解析规则

### 输入格式

```json
{
  "entry": {
    "comments": "",
    "source": "连接超时",
    "tag": "auditEventDefine/name",
    "translation": { "ru_RU": "Тайм-аут подключения" }
  },
  "interpretation": "译文长度:38,限制:32"
}
```

.report 文件可能是 **JSON 数组** 格式。

### 步骤

1. **读取并解析**：JSON 数组 `[{...}]`
2. **识别语言键**：取 `entry.translation` 下首个非空键作为 `langKey`
3. **解析 interpretation**：正则 `译文长度:(\d+),限制:(\d+)`
   - group 2 = `maxLen`（**UTF-8 字节上限**）
4. **开区间处理**：`actualMax = maxLen - 1`（`限制:32` → 实际最大 **31 字节**）
5. **计算超标量**：`overBy = 当前译文 utf-8 字节数 - actualMax`
6. **计算字符预算**：调用 `calcCharBudget(当前译文, actualMax)` → LLM 参考用

### 语言键自动检测

| translation 内容 | 检测到的 langKey |
|-----------------|-----------------|
| `{ "ru_RU": "..." }` | `ru_RU` |
| `{ "en_US": "..." }` | `en_US` |

### 输出规则

1. **去除 interpretation**：输出 `.dic` 文件时，移除 `interpretation` 字段
2. **输出目录**：源目录同级加 `_new` 后缀
3. **文件名**：`.report` → `.dic`
4. **按 source|tag 去重**：`.report` 是检测命中列表，不是元数据全集。同一词条在元数据树中被多处引用时会产生多行重复记录。写 `.dic` 前必须按 `source + '|' + tag` 去重，保留首次出现；输出行数 = 去重后数量（非 report 原始行数）。使用 `scripts/parse-report.js` 的 `dedupeBySourceTag()` 或 `buildDicFromReport()`。

## 输出

```json
{
  "entries": [
    {
      "source": "连接超时",
      "tag": "auditEventDefine/name",
      "langKey": "ru_RU",
      "langText": "Тайм-аут подключения",
      "utf8Bytes": 38,
      "maxBytes": 32,
      "actualMax": 31,
      "overBy": 7,
      "charBudget": 13,
      "originalEntry": { "comments": "", "source": "连接超时", "tag": "auditEventDefine/name", "translation": { "ru_RU": "Тайм-аут подключения" } }
    }
  ],
  "outputDir": "{inputDir}_new"
}
```

## LLM 缩短提示模板

传递给 LLM 时使用以下提示格式：

```text
缩短以下俄语翻译到 {actualMax} UTF-8 字节以内。
当前 {utf8Bytes} 字节，超了 {overBy} 字节。
俄文字母预算：约 {charBudget} 个（每个俄文字母 2 字节）。
参考缩写：максимальный→макс., информации→инф., конфигурация→конфиг.
原文：{source}
译文：{langText}
```

## 下一步路由

- `parsedEntries` → `[[../执行-俄语LLM缩短/SKILL.md]]`

## 边界

- 只解析 `.report` 文件，不修改源文件。
- 验证基准始终是 **UTF-8 字节数**，用 `Buffer.byteLength()` 计算，不是 `string.length`。
- interpretation 格式异常时输出错误列表，不中断全部解析。
- 缩写策略参考 `[[../../assets/few-shot-example/8条真实案例对照表.md]]`。
