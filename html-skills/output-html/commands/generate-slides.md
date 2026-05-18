---
description: 生成精美的杂志级 HTML 幻灯片
---

加载 html-visual-explainer 技能，然后为以下内容生成幻灯片：$@

遵循 html-visual-explainer 技能工作流程。在生成前阅读参考模板 `./templates/slide-deck.html` 和幻灯片模式 `./references/slide-patterns.md`。也读 `./references/css-patterns.md` 了解共享模式和 `./references/libraries.md` 了解 Mermaid 主题和字体配对。

**幻灯片输出始终是选择加入。** 仅当此命令被调用或用户明确要求幻灯片时才生成。

**审美：** 从 slide-patterns.md 的 4 种幻灯片预设中选择独特的方向（Midnight Editorial、Warm Signal、Terminal Mono、Swiss Clean）或在已有的 8 种审美方向基础上改编。变化避免与之前的幻灯片重复。

**叙事结构：** 幻灯片有时间维度——构建故事弧，而不是部分列表。以冲击开始（标题），构建上下文（概览），深潜（内容、图表、数据），解决（摘要/下一步）。在写 HTML 前规划幻灯片序列并为每张幻灯片分配构图方式（居中、左重、分屏、全屏）。

**视觉丰富度：** 主动接触视觉元素。如果 `surf` CLI 可用，为标题幻灯片背景和全屏幻灯片生成图片。添加 SVG 装饰强调、内联迷你图、小图表和小 Mermaid 图表。视觉优先，文字第二。

**构图多样性：** 连续幻灯片必须变化空间方式。在居中、左重、右重、分屏、边缘对齐和全屏之间交替。三个连续居中幻灯片意味着要把一个推出轴线。

写入 `~/.agent/diagrams/` 并在浏览器中打开结果。
