---
name: mermaid-lint-fixer
description: 按图类型执行 Mermaid 语法校验与修复，覆盖 flowchart 与 sequenceDiagram。Use when 文档含图且需要避免渲染失败、暗色主题不兼容、语法歧义。
---

# mermaid-lint-fixer

## When to Use

- 文档中包含 `flowchart TD` 或 `sequenceDiagram`。
- 需要统一图语法与可读性。

## Template Anchors（相对引用）

执行前必须先读取以下相对路径：

- `../../docs/Mermaid.md`
- `../../docs/sequenceDiagram.md`

约束：

- 只按锚点规则修复语法，禁止引入锚点未定义的私有绘图约定。

## Instructions

1. 先根据 `diagramDecisions` 分流：
   - `flowchart TD`：按 `docs/Mermaid.md`
   - `sequenceDiagram`：按 `docs/sequenceDiagram.md`
2. `flowchart` 必检项：
   - 节点文本加引号
   - 连线标签加引号
   - 节点内换行使用 `<br/>`
   - ID 不使用空格/保留关键字
3. `sequenceDiagram` 必检项：
   - 参与者命名稳定
   - `alt/else` 互斥语义明确
   - 有 `Legend` 或等价说明
4. 不允许硬编码颜色样式，保证暗色主题兼容。

## Output Contract

- 输出 `diagramLintReport[]`：
  - `file`
  - `diagramType`
  - `issuesFound`
  - `fixesApplied`
  - `status`

