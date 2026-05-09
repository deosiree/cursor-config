---
name: Markdown格式规范收尾
description: 当 skill 套件的结构与内容已经基本完成，但 README、SKILL、template、few-shot 仍容易违反 markdownlint，需要统一做 Markdown 结构收尾时使用。
---

# 核心任务
把 Markdown 结构检查变成显式收尾阶段，而不是只留在 reference 里。

## 必读
- `[[../../references/markdown-format-rules.md]]`
- `[[../../assets/skill-output-checklist.md]]`

## 检查重点
- H1 策略
- 标题前后空行
- frontmatter 后首标题
- 列表、代码块、表格的空行关系
- 模板、few-shot、README、SKILL 的一致性

## 输出
- `markdownIssuesFound`
- `markdownFixPlan`
- `markdownReadyForDarwin`

## 真实模板

- `[[template/README.md]]`
- `[[template/before]]`
- `[[template/after]]`

## 硬门禁

- 模板仍是说明壳：`markdownReadyForDarwin = false`
- `MD022`、`MD032` 等高频问题未清零：`markdownReadyForDarwin = false`

## 使用示例
```text
这个 skill 套件结构已经补得差不多了，但 README、SKILL 和模板的 Markdown 规则总是不统一。
使用 $Markdown格式规范收尾 输出问题清单、修复计划和是否可以进入 Darwin。
```
