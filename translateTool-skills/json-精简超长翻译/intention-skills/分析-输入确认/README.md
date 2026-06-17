# 分析-输入确认

## 作用

接收用户的原始输入参数，校验 `inputPath`（文件或目录）、`fieldPath`（JSON 字段路径）、`byteLimit`（字节上限）是否有效可读。

## 校验规则

| 字段 | 校验规则 | 失败处理 |
|------|---------|---------|
| inputPath | 路径是否存在，是文件还是目录 | 要求用户提供正确绝对路径 |
| fieldPath | 点号语法是否合法，在 JSON 中能否取到值 | 要求用户确认字段路径 |
| byteLimit | 是否为有效正整数 | 使用默认值 63 或要求用户提供 |

## 输出示例

```json
{
  "action": "proceed",
  "confirmedMeta": {
    "inputPath": "F:\path\to\db",
    "isDirectory": true,
    "fieldPath": "translation.ru_RU",
    "byteLimit": 63,
    "outputSuffix": "_new",
    "missingFacts": []
  }
}
```

## 资源入口

- 模板：`[[template/before/缺参输入示例.md]]`
- 模板：`[[template/after/参数确认输出示例.md]]`
- 校验：`[[evals/evals.json]]`

## 使用示例

```text
用户给了 inputPath 但没给 byteLimit。
使用 $分析-输入确认 校验后要求用户补充 byteLimit。
```
