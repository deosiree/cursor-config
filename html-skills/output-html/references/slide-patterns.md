# 幻灯片模式

杂志级幻灯片引擎的布局、过渡和预设。

## 幻灯片类型（10 种）

| 类型 | 布局 | 用途 |
|------|--------|---------|
| Title | 居中标题 + 副标题 + 可选横幅图片 | 开场幻灯片 |
| Section Divider | 大字号章节编号 + 标题 + 背景渐变 | 新章节过渡 |
| Content | 标题 + 正文（最多 6 行要点） | 标准内容 |
| Split | 左/右各 50%：文字 + 媒体/图表 | 图文对比 |
| Diagram | 全宽 Mermaid 图表 + 小标题 | 技术图表 |
| Dashboard | 指标卡片网格（2×2 或 3×2） | 数据展示 |
| Table | 全宽格式化表格 | 数据对比 |
| Code | 代码块展示 | 代码示例 |
| Quote | 大字号引用 + 作者 | 引语 |
| Full-Bleed | 全屏图片 + 叠加文字 | 视觉冲击 |

## 基本幻灯片 CSS 框架

```css
.slide {
  width: 100%;
  height: 100dvh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 60px 80px;
  position: relative;
  overflow: hidden;
  scroll-snap-align: start;
}

.slides-container {
  scroll-snap-type: y mandatory;
  overflow-y: scroll;
  height: 100dvh;
}

/* 过渡动画 */
.slide {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.6s ease, transform 0.6s ease;
}
.slide--visible {
  opacity: 1;
  transform: translateY(0);
}
```

## 预设

### Midnight Editorial（深海蓝 + 金色，衬线体）
```css
:root {
  --bg-slide: #0f172a;
  --text-slide: #f8fafc;
  --accent-slide: #d4a73a;
  --font-body-slide: 'Instrument Serif', 'Georgia', serif;
  --font-mono-slide: 'JetBrains Mono', monospace;
}
```

### Warm Signal（暖橙 + 深灰，无衬线体）
```css
:root {
  --bg-slide: #1c1917;
  --text-slide: #fafaf9;
  --accent-slide: #fb923c;
  --font-body-slide: 'DM Sans', system-ui, sans-serif;
  --font-mono-slide: 'Fira Code', monospace;
}
```

### Terminal Mono（绿/琥珀 + 近黑，全等宽）
```css
:root {
  --bg-slide: #0a0a0a;
  --text-slide: #a3e635;
  --accent-slide: #fbbf24;
  --font-body-slide: 'JetBrains Mono', 'SF Mono', monospace;
  --font-mono-slide: 'JetBrains Mono', 'SF Mono', monospace;
}
```

### Swiss Clean（白色 + 深色强调，瑞士风格）
```css
:root {
  --bg-slide: #ffffff;
  --text-slide: #0a0a0a;
  --accent-slide: #dc2626;
  --font-body-slide: 'Inter', system-ui, sans-serif;
  --font-mono-slide: 'JetBrains Mono', monospace;
}
```

## 排版和缩放

幻灯片排版的字号显著更大：

| 元素 | 字号 | 行高 |
|---------|------|---------|
| 标题 | clamp(2.5rem, 5vw, 4rem) | 1.1 |
| 副标题 | clamp(1.25rem, 2.5vw, 1.75rem) | 1.4 |
| 正文 | clamp(1rem, 1.5vw, 1.25rem) | 1.6 |
| 代码 | clamp(0.85rem, 1.2vw, 1rem) | 1.5 |
| 引用 | clamp(1.5rem, 3vw, 2.5rem) | 1.3 |

## 键盘导航

```javascript
document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
    document.querySelector('.slides-container').scrollBy({ top: window.innerHeight, behavior: 'smooth' });
  } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
    document.querySelector('.slides-container').scrollBy({ top: -window.innerHeight, behavior: 'smooth' });
  }
});
```

## 幻灯片中 Mermaid 图表

Mermaid 图表在幻灯片中应简单（不超过 8 个节点）。使用更大字号（18-22px）。包装在缩小容器中（`max-height: 40dvh`）。

## 从源文档规划幻灯片

生成幻灯片前，执行此过程：

1. **盘点源素材**：逐部分阅读源文档。列出每个部分及其关键数据点、决策和细节。
2. **映射到幻灯片**：将每个源项目分配到幻灯片类型。检查不同类型以找到最佳格式。
3. **验证覆盖率**：对照源清单逐项检查。源中的每个项目必须对应至少一张幻灯片。
4. **安排叙事弧**：重新排序为：冲击（标题/问题）→ 上下文（当前状态）→ 深潜（分析/解决方案）→ 解决（摘要/下一步）。

## 幻灯片密度限制

| 幻灯片类型 | 最大内容 |
|-------------|-----------------|
| Content | 6 个要点 |
| Table | 15 行 |
| Dashboard | 6 个 KPI 卡片 |
| Diagram | 1 个图表 + 标题 |
| Code | 1 个代码块 + 1 行标题 |
| Quote | 3 行 |

超过限制 → 拆分到多张幻灯片。

## 主动图片

在写 HTML 前，如果 `surf` CLI 可用（`which surf`），考虑生成：
- 标题幻灯片：1 张 16:9 横幅图片
- Full-bleed 幻灯片：1-3 张背景图片
- 内容插画：可选概念图

```bash
surf gemini "提示词" --generate-image /tmp/slide-img.png --aspect-ratio 16:9
```

通过 base64 嵌入。参见 `css-patterns.md` 的图片容器样式。
