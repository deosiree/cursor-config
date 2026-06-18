# 扫描-JSON词条检测

## 作用

运行 `scripts/check-russian.js --mode detect` 扫描 JSON 文件，输出每条词条的字节长度、超标标记和字符预算。

## 核心输出

```json
{
  "totalFiles": 1,
  "totalEntries": 8,
  "overlongCount": 8,
  "overlongEntries": [
    { "index": 0, "source": "所属数据时段描述", "bytes": 70, "limit": 63, "charBudget": 29 }
  ]
}
```

## charBudget 含义

`charBudget` = `(byteLimit - 已有单字节字符数) ÷ 2` 向下取整。
代表还可以写入的俄文字母数量。LLM 缩短时不得超出此预算。

## `_new` 目录输出规则

- 输入 `db/hisparam.dic` → 输出 `db_new/hisparam.dic`
- 保持完整相对路径结构
- 如果没有超长词条，"全量复制"也走此通道

## 资源入口

- 脚本：`[[../../scripts/check-russian.js]]`
- 模板：`[[template/before/原始JSON片段.md]]`
- 模板：`[[template/after/检测报告样本.md]]`
- 校验：`[[evals/evals.json]]`

## 使用示例

```text
使用 $扫描-JSON词条检测 扫描 db/ 目录下的所有 JSON 文件。
```
