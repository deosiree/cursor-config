---
name: translate
description: 批量翻译词条 CSV，仅更新英文翻译列并输出质检结果。用于 i18n 词条翻译、术语统一、占位符保护与批量校验。
---

# 目标
稳定完成“CSV 词条翻译 + 规则约束 + 结果校验”的流水线。

## 默认命令
`node translateCsv.js <input_csv> <output_dir> [glossary_excel]`

## 执行步骤
1. 加载术语与翻译规则（`glossary/translation-rules.md` 或 Excel）。
2. 读取 CSV，识别列结构与占位符。
3. 逐条翻译，仅更新“英文翻译”列。
4. 校验占位符、术语一致性与长度约束。
5. 输出 CSV 与错误日志。

## 资源索引
1. `translateCsv.js`
2. `extractGlossary.js`
3. `prompts/prompt-single.md`
4. `prompts/prompt-batch.md`

## 约束
1. 不改中文列。
2. 占位符必须保持一致。
3. 失败项记录到日志，不中断整体处理。

## 外部最佳实践校验（必做）
1. 无论是否使用本 skill，都先进行一次 web search，确认当前任务的最佳实践与最新约束。
2. 优先来源顺序：官方文档 > 标准组织/维护者仓库 > 高质量技术文档。
3. 至少引用 2 个来源；高风险任务（生产、权限、安全、数据）至少 3 个来源交叉验证。
4. 输出中必须包含：来源链接、采纳点、未采纳点与原因。
5. 若检索结果不足或冲突，必须明确不确定性并给出保守方案。
