# HTML 图表 CSS 模式

用于自包含 HTML 图表的布局、连接器、主题和视觉效果的可复用模式。

## 主题设置

始终通过自定义属性定义浅色和深色调色板。从适合所选审美的开始，确保两者都工作。

```css
:root {
  --font-body: 'Outfit', system-ui, sans-serif;
  --font-mono: 'Space Mono', 'SF Mono', Consolas, monospace;

  --bg: #f8f9fa;
  --surface: #ffffff;
  --surface-elevated: #ffffff;
  --border: rgba(0, 0, 0, 0.08);
  --border-bright: rgba(0, 0, 0, 0.15);
  --text: #1a1a2e;
  --text-dim: #6b7280;
  --accent: #0891b2;
  --accent-dim: rgba(8, 145, 178, 0.1);
  --node-a: #0891b2;
  --node-a-dim: rgba(8, 145, 178, 0.1);
  --node-b: #059669;
  --node-b-dim: rgba(5, 150, 105, 0.1);
  --node-c: #d97706;
  --node-c-dim: rgba(217, 119, 6, 0.1);
}

@media (prefers-color-scheme: dark) {
  :root {
    --bg: #0d1117;
    --surface: #161b22;
    --surface-elevated: #1c2333;
    --border: rgba(255, 255, 255, 0.06);
    --border-bright: rgba(255, 255, 255, 0.12);
    --text: #e6edf3;
    --text-dim: #8b949e;
    --accent: #22d3ee;
    --accent-dim: rgba(34, 211, 238, 0.12);
    --node-a: #22d3ee;
    --node-a-dim: rgba(34, 211, 238, 0.12);
    --node-b: #34d399;
    --node-b-dim: rgba(52, 211, 153, 0.12);
    --node-c: #fbbf24;
    --node-c-dim: rgba(251, 191, 36, 0.12);
  }
}
```

## 背景氛围

纯色背景感觉死板。使用微妙渐变或图案。

```css
/* 焦点区域后的径向辉光 */
body {
  background: var(--bg);
  background-image: radial-gradient(ellipse at 50% 0%, var(--accent-dim) 0%, transparent 60%);
}

/* 淡点网格 */
body {
  background-color: var(--bg);
  background-image: radial-gradient(circle, var(--border) 1px, transparent 1px);
  background-size: 24px 24px;
}

/* 渐变网格（选 2-3 个定位径向） */
body {
  background: var(--bg);
  background-image:
    radial-gradient(at 20% 20%, var(--node-a-dim) 0%, transparent 50%),
    radial-gradient(at 80% 60%, var(--node-b-dim) 0%, transparent 50%);
}
```

## 链接样式

**永远不要依赖浏览器默认链接颜色。** 默认蓝色在暗色背景上对比度差。使用 `color: var(--accent)` 样式化链接并保留下划线以保持可发现性。

## 卡片组件

**重要：永远不要使用 `.node` 作为 CSS 类名。** Mermaid.js 内部在 SVG `<g>` 元素上使用 `.node`。任何页面级 `.node` 样式会泄漏到 Mermaid 图表中并破坏其布局。使用 `.ve-card`（命名空间化以避开与也使用 `.card` 的 CSS 框架如 Bootstrap/Tailwind 的冲突）。

```css
.ve-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 16px 20px;
  position: relative;
}

/* 彩色强调边框（左边或顶部） */
.ve-card--accent-a {
  border-left: 3px solid var(--node-a);
}

/* --- 深度层级：变化卡片深度以指示重要性 --- */

.ve-card--elevated {
  background: var(--surface-elevated);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04);
}

.ve-card--recessed {
  background: color-mix(in srgb, var(--bg) 70%, var(--surface) 30%);
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.06);
}

.ve-card--hero {
  background: color-mix(in srgb, var(--surface) 92%, var(--accent) 8%);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.04);
  border-color: color-mix(in srgb, var(--border) 50%, var(--accent) 50%);
}

/* 章节标签（等宽、大写、小号） */
.ve-card__label {
  font-family: var(--font-mono);
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  color: var(--node-a);
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.ve-card__label::before {
  content: '';
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: currentColor;
}
```

## 代码块

代码块需要显式的空白保留和最大高度约束。

```css
.code-block {
  font-family: var(--font-mono);
  font-size: 13px;
  line-height: 1.5;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 16px;
  overflow-x: auto;
  white-space: pre-wrap;
  word-break: break-word;
}

.code-block--scroll {
  max-height: 400px;
  overflow-y: auto;
}
```

## 流向箭头（SVG 连接器）

CSS Grid 卡片之间的连接器使用内联 SVG：

```html
<div class="flow-arrow">
  <svg viewBox="0 0 16 32" width="16" height="32">
    <path d="M8 0 L8 26 M2 20 L8 26 L14 20" stroke="currentColor" stroke-width="2" fill="none"/>
  </svg>
</div>
```

```css
.flow-arrow {
  display: flex;
  justify-content: center;
  padding: 8px 0;
  color: var(--text-dim);
}
```

## Mermaid 缩放控件

每个 Mermaid 容器都需要完整的缩放/平移控制。始终使用 `templates/mermaid-flowchart.html` 中的模式。

基本结构：
```html
<div class="diagram-shell">
  <div class="mermaid-wrap">
    <div class="zoom-controls">
      <button class="zoom-btn" data-zoom="in">+</button>
      <span class="zoom-level" id="zoom-level">100%</span>
      <button class="zoom-btn" data-zoom="out">−</button>
      <button class="zoom-btn" data-zoom="reset">↺</button>
      <button class="zoom-btn expand-btn" title="在新标签页打开">⛶</button>
    </div>
    <div class="mermaid-viewport" id="viewport">
      <div class="mermaid-canvas" id="canvas">
        <pre class="mermaid">
          /* Mermaid 图定义 */
        </pre>
      </div>
    </div>
  </div>
</div>
```

## 深度层级总结

| 层级 | CSS 类 | 用途 |
|-------|---------|---------|
| Hero | `ve-card--hero` | 执行摘要、焦点元素——要求注意 |
| Elevated | `ve-card--elevated` | KPI、关键部分、需要突出的内容 |
| Default | `ve-card` | 标准卡片内容 |
| Recessed | `ve-card--recessed` | 代码块、次要内容、详情面板 |

## 动画入场

使用 CSS 自定义属性 `--i` 实现交错淡入：

```css
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}

.ve-card {
  animation: fadeUp 0.4s ease both;
  animation-delay: calc(var(--i, 0) * 0.05s);
}

@media (prefers-reduced-motion: reduce) {
  .ve-card { animation: none; }
}
```

## 溢出保护

- 所有 grid/flex 子项应用 `min-width: 0`
- 文字容器使用 `overflow-wrap: break-word`
- 永远不要对标记字符使用 `display: flex` on `<li>`——使用绝对定位
- 并排面板使用 `overflow-wrap: break-word`

## 生成图片容器

使用 `surf gemini --generate-image` 生成并嵌入图片时：

```css
.hero-img-wrap {
  border-radius: 12px;
  overflow: hidden;
  margin: 24px 0;
}
.hero-img-wrap img {
  width: 100%;
  height: auto;
  display: block;
}
```

## 散文页面元素

在视觉页面中用于强调关键点：

- **引导段**：`.lead-paragraph`——更大字号（1.25rem），柔和颜色，增加下边距
- **引用**：`.pull-quote`——斜体标题字体，大引号装饰，适度尺寸
- **标注框**：`.callout`——左彩色边框，背景色，强标签
- **章节分隔线**：`.section-divider`——带装饰的 hr
