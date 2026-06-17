# 分析-识别数据类型

## 作用

确认用户说的是"元数据"还是"对象数据"，决定走 v1 还是 v2 流程。

## 资源入口

- 模板：`[[template/before/]]` dataType 不明确的场景
- 模板：`[[template/after/]]` 确认后的输出示例
- 校验：`[[evals/evals.json]]`

## 使用示例

```text
用户：这批是元数据
→ 输出 { dataType: "meta", defaultMaxLen: 63 }

用户：这批是对象数据
→ 输出 { dataType: "object" }
```
