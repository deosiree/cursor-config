---
description: 为任意主题生成精美的独立 HTML 图表并在浏览器中打开
---

加载 html-visual-explainer 技能，然后为以下主题生成 HTML 图表：$@

遵循 html-visual-explainer 技能工作流程。在生成前阅读参考模板和 CSS 模式。选择适合内容的独特审美方向——每次变化字体、调色板和布局样式。

如果 `surf` CLI 可用（`which surf`），考虑在图片能真正增强页面时通过 `surf gemini --generate-image` 生成 AI 插画——英雄横幅、概念插画或 Mermaid 无法表达的教育图表。使图片风格与页面调色板匹配。通过 base64 data URI 嵌入。参见 `./references/css-patterns.md` 中的"生成图片"样式。当主题纯粹是结构化或数据驱动时跳过图片。

写入 `~/.agent/diagrams/` 并在浏览器中打开结果。

Ultrathink.
