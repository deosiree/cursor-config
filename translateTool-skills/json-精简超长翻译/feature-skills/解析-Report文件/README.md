# 解析-Report文件

## 作用

解析对象数据(v2)的 `.report` 文件，提取每条超长词条和 interpretation 约束，输出结构化数据供缩短流程使用。

## 核心规则

- 自动检测 `translation` 下的语言键（首个非空键）
- `interpretation` 解析：`"译文长度:{current},限制:{max}"`
- **开区间处理**：实际最大字符数 = `max - 1`

## 资源入口

- 模板：`[[template/before/原始report片段.md]]`
- 模板：`[[template/after/解析输出示例.md]]`
- 校验：`[[evals/evals.json]]`

## 使用示例

```text
用户：这批是对象数据
→ 解析 .report 文件，逐条提取 entry + interpretation
→ 输出结构化数组，路由到 执行-俄语LLM缩短
```
