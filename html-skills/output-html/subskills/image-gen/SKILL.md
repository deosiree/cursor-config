---
name: image-gen
description: 在 HTML 中利用 LLM 图像生成能力创建图片，当纯代码（Mermaid/SVG）无法直观表达复杂视觉概念时使用。触发词：生图、画图、生成图片、示意图
---

# 图像生成（Image Gen）— 子技能

当用户要求生成纯代码难以表达的图像时（如场景图、概念插画、示意图），利用大模型的图像生成能力直接生图，嵌入 HTML。

## 触发条件

以下情况应激活本子技能，而非尝试用 Mermaid/SVG/Canvas 绘制：

| 场景 | 示例 | 原因 |
|------|------|------|
| 概念/场景图 | "画一个火箭升空的图" | 细节过多，代码绘制成本极高 |
| 示意图 | "生成一张微服务架构概念图" | 需要视觉创意而非精确拓扑 |
| 角色/物体 | "画个宇航员图标" | 纯代码无法生成自然形态 |
| 背景/装饰 | "生成一个星空背景" | CSS 渐变过于简单 |
| 数据示意 | "画一个数据增长的趋势图" | 比 Chart.js 更生动的视觉表达 |

**不需要触发生图的场景**（用已有技术即可）：
- 精确拓扑 → Mermaid flowchart
- 数据图表 → Chart.js / ECharts
- 简单图标 → 内联 SVG
- 布局/卡片 → CSS Grid

## 工作流程

### 1. 确认生图需求

判断用户请求是否需要生图。如果需要，告知用户："我将使用图像生成能力创建一张示意图片。"

> 生图应仅用于纯代码无法合理实现的视觉内容。能用 Mermaid/Chart.js 解决的问题不应触发图像生成。

### 2. 调用图像生成

利用 LLM 的原生图像生成能力，生成符合场景的图片。在 prompt 中描述：
- 画面主体和构图
- 风格（扁平/写实/插画/科技感等）
- 颜色要求（与页面调色板协调）
- 文字标签（如果需要）

### 3. 嵌入 HTML

根据图像生成结果，以下列方式嵌入：

**方式一：data URI（推荐，自包含）**
```html
<img src="data:image/png;base64,..." alt="火箭升空示意图" style="width:100%;max-width:600px;border-radius:8px;">
```

**方式二：URL（外部图片，网络依赖）**
```html
<img src="https://.../image.png" alt="示意图" style="width:100%;max-width:600px;border-radius:8px;">
```

**模板参考**：生成前先读 `./templates/image-gen-example.html` 作为 few-shot 示例，了解完整的 HTML 结构（主题变量、容器样式、fallback 处理）。

### 4. 容器样式

为图片添加合适的展示容器：

```css
.img-figure {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 16px;
  margin: 24px 0;
}
.img-figure img {
  width: 100%;
  border-radius: 8px;
  display: block;
}
.img-figure figcaption {
  margin-top: 12px;
  font-size: 13px;
  color: var(--text-dim);
  text-align: center;
}
```

### 5. 降级策略

如果图像生成失败或结果不符合预期：

| 情况 | 降级方案 |
|------|---------|
| 生图失败 | 用纯文字描述区块 + CSS 装饰占位 |
| 结果不理想 | 生成 SVG 占位图 + 说明文字 |
| 不支持该能力 | 跳过生图，用现有技术（Mermaid/SVG/Canvas）尽力实现 |

## 质量检查

- 图片是否与页面调色板协调（内联样式覆盖）
- 图片容器是否有圆角/边框/阴影，与卡片层级一致
- 是否有 `alt` 文本（无障碍）
- 是否支持响应式（`max-width: 100%`）
- 是否有双主题适配（深色模式下图片是否需要边框调整）
- 生图前是否读取了 `./templates/image-gen-example.html` 作为 few-shot 参考

## 资源

| 文件 | 用途 |
|------|------|
| `./templates/image-gen-example.html` | 完整 HTML 示例（双主题 + 容器样式 + fallback），作为 few-shot 参考 |
