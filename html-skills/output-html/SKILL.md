---
name: output-html
description: 生成精美的自包含HTML页面，用于可视化解释系统架构、代码变更、设计方案和数据。当用户要求画图、架构概览、差异审查、方案审查、项目回顾或任何技术概念的可视化说明时使用。也主动用于当你要在终端中渲染复杂ASCII表格（4行以上或3列以上）时——取而代之生成样式化HTML页面。
license: MIT
compatibility: 需要浏览器查看生成的HTML文件；支持所有现代浏览器(Chrome/Firefox/Safari/Edge)
metadata:
  author: nicobailon (original visual-explainer), 汉化: Spindrift
  version: "0.1.0"
  based-on: https://github.com/nicobailon/visual-explainer
---

# HTML 可视化解释器

生成自包含的 HTML 文件，用于技术图表、可视化和数据表格。始终在浏览器中打开结果。加载此技能后，永远不要回退到 ASCII 艺术。

**主动表格渲染。** 当你即将在终端中以 ASCII 框线表格形式呈现表格数据时（比较、审计、功能矩阵、状态报告、任何结构化行列），改用生成 HTML 页面。判断阈值：如果表格有 4 行以上或 3 列以上，它就属于浏览器。不要等用户要求——自动渲染为 HTML 并告知文件路径。你仍可以在对话中包含简短文字摘要，但表格本身应为 HTML 页面。

## 可用命令

详细命令模板在 `./commands/` 目录中。

| 命令 | 功能 |
|---------|-------------|
| `generate-web-diagram` | 为任意主题生成 HTML 图表 |
| `generate-visual-plan` | 生成可视化的功能实现方案 |
| `generate-slides` | 生成杂志品质的幻灯片 |
| `diff-review` | 可视化差异审查，含架构对比和代码审查 |
| `plan-review` | 将方案与代码库对比，含风险评估 |
| `project-recap` | 用于切换上下文时快速重建项目心智模型 |
| `fact-check` | 验证文档相对于实际代码的事实准确性 |
| `share-page` | 将 HTML 页面部署到 Vercel 获取实时 URL |

## 工作流程

### 1. 思考（5 秒，不是 5 分钟）
**输入：** 用户的原始请求（如"画个架构图""比较这些方案"）
**输出：** 确定的内容类型 + 审美方向 + 目标受众

在写 HTML 之前，先确定方向。不要每次都默认 "暗色主题 + 蓝色强调"。

**可视化始终是默认选择。** 即使是文章、博文和文档，也要进行视觉化处理——将结构提取为卡片、图表、网格、表格。

散文模式（引导段、引文、标注框）是视觉页面中的**强调元素**，不是独立模式。用它们来突出关键点或提供呼吸空间，但页面结构保持视觉化。

散文元素参见 `./references/css-patterns.md` 中的"散文页面元素"。其他情况，使用带有美学方向的标准自由布局。

**谁在看？** 开发人员在理解系统？PM 在看整体图景？团队在审查提案？这决定了信息密度和视觉复杂度。

**什么类型的内容？** 架构图、流程图、时序图、数据流、模式/ER、状态机、思维导图、类图、C4 架构、数据表、时间线、仪表盘或散文优先页面。每种都有不同的布局需求和渲染方式（参见下文图表类型）。

**什么审美方向？** 选择一个并贯彻到底。约束型审美（Blueprint、Editorial、Paper/ink）更安全——它们有特定的要求，防止生成千篇一律的输出。灵活型审美（IDE 风格）需要更多自律。

**约束型审美（优先选择）：**
- Blueprint（技术绘图感，微妙的网格背景，深灰蓝/蓝色调，等宽标签，精确边框）
- Editorial（衬线标题如 Instrument Serif 或 Crimson Pro，宽裕的留白，柔和的土色调或深海蓝 + 金色）
- Paper/ink（暖白 `#faf7f5` 背景，陶土色/鼠尾草强调色，非正式感）
- Monochrome terminal（绿色/琥珀色在近黑色背景上，全等宽，可选的 CRT 辉光）

**灵活型审美（谨慎使用）：**
- IDE 风格（使用真实命名的配色方案：Dracula、Nord、Catppuccin Mocha/Latte、Solarized Dark/Light、Gruvbox、One Dark、Rosé Pine）——贯彻实际调色板，不要近似
- 数据密集（小字号、紧凑间距、最大信息量、柔和颜色）

**明确禁止：**
- Neon dashboard（青色 + 洋红 + 紫色在暗色背景上）——总是产生 AI 垃圾
- 渐变网格（粉色/紫色/青色斑点）——过于通用
- Inter 字体 + 紫罗兰/靛蓝强调色 + 渐变文本的任何组合

每次都要变化选择。如果上一个图表是暗色技术风，下一个就做成亮色编辑风。替换测试：如果你把你的样式替换为通用暗色主题而没有人能看出区别，那你什么都没设计出来。

### 2. 结构化
**输入：** 上一步输出的内容类型和审美方向
**输出：** 确定的渲染方式（Mermaid / CSS Grid / 表格 / 幻灯片）+ 要读取的参考文件清单

**读取参考资料** 在生成之前。不要靠记忆——每次都重新阅读以吸收模式。
- 文字密集的架构概览（卡片内容比拓扑更重要）：读 `./templates/architecture.html`
- 流程图、时序图、ER、状态机、思维导图、类图、C4：读 `./templates/mermaid-flowchart.html` 和 `./marmeid/rules/README.md`（Mermaid 语法规则 + 6 种图类型的工作模板）
- 数据表、比较、审计、功能矩阵：读 `./templates/data-table.html`
- 幻灯片演示（当带有 `--slides` 标志或调用 `/generate-slides` 时）：读 `./templates/slide-deck.html` 和 `./references/slide-patterns.md`
- 散文为主的发布页面（README、文章、博文）：读 `./references/css-patterns.md` 中的"散文页面元素"和 `./references/libraries.md` 中的"按内容语气的排版"

**CSS/布局模式和 SVG 连接器**，读 `./references/css-patterns.md`。

**4 个章节以上的页面**（审查、回顾、仪表盘），也读 `./references/responsive-nav.md` 了解章节导航——桌面端固定侧边栏目录，移动端水平滚动条。

**生图需求（场景图/概念插图，纯代码难以表达）**：读 `./subskills/image-gen/SKILL.md` 了解图像生成嵌入模式，读 `./subskills/image-gen/templates/image-gen-example.html` 作为 few-shot 参考。

**ECharts 复杂图表（雷达/桑基）**：读 `./references/libraries.md` 的 ECharts 章节。

**UI 原型组件（导航栏/表单/模态框）**：读 SKILL.md 的"UI 原型组件"节。

**所有风格设计前**，读 `./references/anti-patterns.md` 了解禁止项（字体/调色板/布局），防止输出 AI 垃圾。

**选择渲染方式：**

| 内容类型 | 方式 | 原因 |
|---|---|---|
| 架构（文字密集） | CSS Grid 卡片 + 流向箭头 | 丰富卡片内容需要 CSS 控制 |
| 架构（拓扑为重点） | **Mermaid** | 组件间的可见连接需要自动布线 |
| 流程图 / 管道 | **Mermaid** | 自动节点定位和边缘布线 |
| 时序图 | **Mermaid** | 生命线、消息和激活框需要自动布局 |
| 数据流 | **Mermaid** 带边缘标签 | 连接和数据描述需要自动布线 |
| ER / 模式图 | **Mermaid** | 多实体间的关系线需要自动布线 |
| 状态机 | **Mermaid** | 带标签的状态转换需要自动布局 |
| 思维导图 | **Mermaid** | 层级分支需要自动定位 |
| 类图 | **Mermaid** | 继承、组合、聚合关系线需要自动布线 |
| C4 架构 | **Mermaid** | 使用 `graph TD` + `subgraph` 实现 C4 |
| 数据表 | HTML `<table>` | 语义化标记、无障碍、复制粘贴 |
| 时间线 | CSS（中心线 + 卡片） | 简单线性布局不需要布局引擎 |
| 仪表盘 | CSS Grid + Chart.js | 嵌入图表的卡片网格 |
| 复杂图表（雷达/桑基） | **ECharts** | Chart.js 无法覆盖的图表类型 |
| 自定义图形 | **程序化 SVG / Canvas** | 精确控制每个图形元素的位置和颜色 |
| UI 原型页面 | **HTML + CSS + JS** | 需要导航栏/表单/模态框/标签页等交互组件 |

### Mermaid 渲染策略

#### 规则文件速查

| 图类型 | 规则文件（语法细节） | 模板文件（few-shot） |
|--------|-------------------|-------------------|
| 流程图 | `./marmeid/rules/flowchart.md` | `./marmeid/templates/marmeid-flowchart.html` |
| 时序图 | `./marmeid/rules/sequence.md` | `./marmeid/templates/marmeid-sequence.html` |
| 类图 | `./marmeid/rules/class.md` | `./marmeid/templates/marmeid-class.html` |
| 状态图 | `./marmeid/rules/state.md` | `./marmeid/templates/marmeid-state.html` |
| ER 图 | `./marmeid/rules/er.md` | `./marmeid/templates/marmeid-er.html` |
| 思维导图 | `./marmeid/rules/mindmap.md` | —（语法简单，规则文件足够） |

**必读：** `./marmeid/rules/README.md`（通用规则 + 故障诊断 + 缩放策略）

**⛔ 唯一必须记住的规则：** style 指令禁止使用 CSS 变量（`var()` 在内联 SVG 中无法解析），必须用字面十六进制颜色，如 `fill:#0891b2,stroke:#0369a1,color:#ffffff`。

其余规则（theme:base、容器结构、布局方向、标签换行、CSS 类名保护）和故障诊断表均见 `./marmeid/rules/README.md`。

**🛑 方向确认检查点：** 进入风格设计前，按以下模板向用户确认：

```
【内容类型】Mermaid flowchart / CSS Grid / HTML table / ...
【审美方向】Editorial / Blueprint / Paper/ink / ...
【字体配对】Instrument Serif + JetBrains Mono / ...
【目标受众】开发团队 / PM / 管理层 / ...
确认继续？[Y/n]
```

用户确认后进入风格设计。若用户拒绝，根据反馈调整后重新确认，最多迭代 2 次仍未通过则改用用户指定的方向。

### 3. 风格
**输入：** 内容类型 + 审美方向 + 渲染方式
**输出：** 完整的 HTML 页面设计（主题变量 + 排版 + 调色板 + 布局）

将这些原则应用于每个图表：

**排版即图表。** 字体配对参见 `./references/libraries.md`（推荐 5 组配对：DM Sans/Fira Code、Instrument Serif/JetBrains Mono 等，每次应选不同的组合）。通过 `<link>` 在 `<head>` 中加载，font-family 栈包含系统字体回退。

**禁止作为 `--font-body`：** Inter、Roboto、Arial、Helvetica、单独的 system-ui（完整禁止项列表见 `./references/anti-patterns.md`）。

**颜色讲述故事。** 使用 CSS 自定义属性定义完整调色板。至少定义：`--bg`、`--surface`、`--border`、`--text`、`--text-dim` 和 3-5 个强调色。尽量语义化命名（`--pipeline-step` 而非 `--blue-3`）。支持双主题。

主审美放在 `:root`，备选放在媒体查询中：

```css
/* 浅色优先（editorial、paper/ink、blueprint）： */
:root { /* 浅色值 */ }
@media (prefers-color-scheme: dark) { :root { /* 深色值 */ } }

/* 深色优先（neon、IDE风格、terminal）： */
:root { /* 深色值 */ }
@media (prefers-color-scheme: light) { :root { /* 浅色值 */ } }
```

**表面要隐约，不要喧哗。** 通过微妙的亮度变化（2-4% 层级间）构建深度，而非戏剧性的颜色变化。边框应为低透明度 rgba（深色模式 `rgba(255,255,255,0.08)`，浅色模式 `rgba(0,0,0,0.08)`）——在意时可见，不在意时不可见。

**背景营造氛围。** 不要为页面背景使用纯色。微妙的渐变、CSS 实现的淡网格图案、或焦点区域背后的柔和径向辉光。背景应该感觉像一个空间，而不是空洞。

**视觉权重标识重要性。** 不是每个部分都值得同等的视觉待遇。执行摘要和关键指标应在加载时主导视口（更大的字号、更多内边距、微妙的强调色背景区域）。参考部分（文件映射、依赖列表、决策日志）应紧凑且不碍眼。对有用但不是主要的部分使用 `<details>/<summary>` 折叠面板。

**表面深度创建层次。** 变化卡片深度以指示重要性。主角部分获得高阴影和强调色背景。主体内容保持扁平。代码块和次要内容感觉凹陷。参见 `./references/css-patterns.md` 中的深度层级。不要把所有东西都抬高——当所有东西都突出时，就没有突出了。

**动画恰如其分。** 页面加载时的交错淡入几乎总是值得的——它们引导视线穿过图表的层次。按角色混合动画类型：卡片用 `fadeUp`，KPI 和徽章用 `fadeScale`，SVG 连接器用 `drawIn`，主角数字用 `countUp`。交互感元素的悬停过渡使图表有生命力。始终尊重 `prefers-reduced-motion`。CSS transitions 和 keyframes 处理大多数情况。对于编排的多元素序列，可通过 CDN 使用 anime.js。

**禁止的动画：**
- 动画辉光 box-shadow——这是 AI 垃圾
- 静态内容上的脉动/呼吸效果
- 页面加载后持续运行的动画（进度指示器除外）

保持动画有目的性：入场揭示、悬停反馈和用户发起的交互。没有任何东西应自己发光或脉动。

### 4. 交付
**输入：** 完整的 HTML 设计（主题 + 内容结构）
**输出：** 写入文件系统 → 浏览器打开 → 用户确认

**🛑 预写检查点：** 在生成 HTML 之前，按以下模板向用户概述页面结构：

```
【布局方案】顶栏 + 侧栏 + 主区域（三栏）
【页面分区】5 个：标题区 / Mermaid 流程图 / 组件卡片网格 / 数据流图例 / 页脚
【核心交互】Mermaid 缩放/平移、主题切换
【审美方向】Blueprint（深灰蓝基调，IBM Plex 字体）
确认写入？[Y/n]
```

等待用户确认后再写入文件。若用户拒绝，调整后重新确认，最多迭代 2 次。

**输出位置：** 写入 `~/.agent/diagrams/`。使用基于内容的描述性文件名。目录在会话间持久化。

**在浏览器中打开：**
- macOS: `open ~/.agent/diagrams/filename.html`
- Linux: `xdg-open ~/.agent/diagrams/filename.html`
- Windows: `start ~/.agent/diagrams/filename.html`

**告知用户** 文件路径，以便他们重新打开或分享。

### 生成执行清单

每次生成 HTML 时，按以下顺序执行：

1. **确定方向** — 内容类型 + 审美方向 + 字体配对 → 向用户确认（见上方"方向确认检查点"）
2. **读取参考** — 根据内容类型打开对应的 template 和 reference 文件，理解关键模式
3. **编写 HTML** — 按顺序构建：
   a. 先写 `<!DOCTYPE html>` + `<head>` + 主题 CSS（:root + media query）
   b. 再写 `<body>` 中的语义化 HTML 结构（header → section → footer）
   c. 最后添加 Mermaid/Chart.js CDN + 缩放控件 JS
4. **自检** — 对照"质量检查"清单逐项验证（眯眼测试、替换测试、双主题、溢出保护等）
5. **交付** — 写入 `~/.agent/diagrams/` → 在浏览器中打开 → 告知用户路径

> 如果某一步失败，参考"异常与降级处理"表格中的对应降级策略。

## 图表类型

### 架构 / 系统图
根据复杂度有三种方式：

**简单拓扑（10 个元素以下）：** 使用 Mermaid。带有自定义 `themeVariables` 的 `graph TD` 可生成带自动边缘布线的可读图表。

**文字密集概览（15 个元素以下）：** CSS Grid 配合显式行列放置。部分做成圆角卡片，带彩色边框和等宽标签。部分之间用垂直流向箭头。参考模板 `./templates/architecture.html` 展示了此模式。当卡片需要 Mermaid 节点无法容纳的描述、代码引用、工具列表或其他丰富内容时使用。

**复杂架构（15+ 元素）：** 使用**混合模式**——一个简单的 Mermaid 概览（5-8 个节点展示模块关系），然后是每个模块内部细节的详细 CSS Grid 卡片。这同时提供了视觉拓扑和可读细节。概览图使用带 `<small>` 标签显示关键函数名的模块名。下面的卡片显示完整的函数列表和新/修改徽章。永远不要试图把 15+ 元素塞进单个 Mermaid 图表——即使有缩放控件，它也会渲染得小到无法阅读。

### Mermaid 图表速查

以下图类型均使用 Mermaid，差异在语法规则。生成时按需读取对应规则文件：

| 图类型 | 语法 | 规则文件 | 要点 |
|--------|------|---------|------|
| 流程图/管道 | `graph TD` / `graph LR` | `flowchart.md` | 自动节点定位+决策菱形+并行分支，复杂用 TD，3-4 节点线性流用 LR |
| 时序图 | `sequenceDiagram` | `sequence.md` | 生命线/消息/激活框/alt-else 分支/note 注释 |
| 数据流图 | `graph TD` + 边缘标签 | `flowchart.md` | 强调连接，源/汇与转换节点用 classDef 区分 |
| ER 图 | `erDiagram` | `er.md` | 实体间关系线自动布线，可含属性字段 |
| 状态机 | `stateDiagram-v2` | `state.md` | 嵌套状态/分叉/合并；标签含特殊字符时改用 flowchart TD |
| 思维导图 | `mindmap` | `mindmap.md` | 层级分支自动径向布局 |
| 类图 | `classDiagram` | `class.md` | 关联/组合/聚合/继承+多重性，非 OOP 用 ER 图 |
| C4 架构 | `graph TD` + `subgraph` | `flowchart.md` | **禁用原生 C4Context！** 人员→圆角, 系统→矩形, 数据库→圆柱, 边界→subgraph |

→ 规则文件均在 `./marmeid/rules/` 下，模板在 `./marmeid/templates/`。详见上方 Mermaid 渲染策略。

### ECharts 仪表盘

**使用 ECharts。** 当需要雷达图（多维对比）、桑基图（数据流转）或比 Chart.js 更丰富的图表类型时使用。

**选型原则：** 简单图表（柱/折线/饼）用 Chart.js，复杂图表（雷达/桑基）用 ECharts。避免同时加载两个库。

**CDN：** `./references/libraries.md` 中的 ECharts 章节。

**初始化模式（必选双主题封装）：**
```javascript
function createThemeChart(el, renderFn) {
  const chart = echarts.init(el);
  function apply() {
    const dark = matchMedia('(prefers-color-scheme: dark)').matches;
    chart.setOption(renderFn(dark));
  }
  apply();
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', apply);
  return chart;
}
```

**常用图表类型：**
- **桑基图 (Sankey)** — 数据流转、资金流、调用链路。数据格式：`nodes + links`
- **雷达图 (Radar)** — 多维度能力评估、方案对比。配置：`radar.indicator`
- **基础图** — 柱状/折线/饼图（与 Chart.js 任选其一）

### 自定义图形（程序化 SVG / Canvas）

**使用内联 SVG 或 Canvas 2D。** 当需要精确控制每个图形元素的位置、颜色和交互时使用。适用场景：

- 网络拓扑图（带子网边界框、链路状态颜色）
- 自定义数据流程图（粗细边表示流量、颜色编码状态）
- 时序自定义图（Mermaid 标签约束无法满足时）
- 简单示意图（组件关系、协议栈、层级结构）

**SVG 工厂模式（推荐）：** 通过 `document.createElementNS` 创建 SVG 元素，颜色通过 `getComputedStyle` 读取 CSS 自定义属性后以字面 hex 设置。

```javascript
function createSVG(container, w, h) {
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
  container.appendChild(svg);
  function el(tag, attrs) { /* 创建子元素的辅助函数 */ }
  return { svg, el };
}
// 读取 CSS 变量转为字面 hex
const accent = getComputedStyle(document.documentElement)
  .getPropertyValue('--accent').trim();
```

**Canvas 2D：** 适合像素级操作或大量粒子。需适配 `devicePixelRatio` 避免模糊，可用 `toDataURL()` 导出。

**Data URI 嵌入：** SVG 可通过 `btoa()` 转为 data URI 用于 `<img>` 或 CSS background。

### UI 原型组件

**使用 HTML + CSS + 原生 JS。** 当需要制作比 markdown 更丰富的交互式原型页面时使用。以下组件可组合使用：

| 组件 | CSS 类 | 实现要点 |
|------|--------|---------|
| **顶栏导航** | `.ui-navbar` | 固定定位、logo+链接、移动端汉堡菜单 |
| **侧边栏** | `.ui-sidebar` | 固定宽度、折叠展开、活跃项高亮 |
| **面包屑** | `.ui-breadcrumb` | `>` 分隔、当前页不加链接 |
| **标签页** | `.ui-tabs` | JS class 切换或 CSS `:target`、活跃标签底线 |
| **折叠面板** | `.ui-accordion` | `max-height` 过渡、`<details>/<summary>` |
| **表单** | `.ui-form` | 输入框组、选择框、按钮组 |
| **按钮** | `.ui-btn` | primary/secondary/ghost/danger 变体 |
| **模态框** | `.ui-modal` | overlay + centered + ESC 关闭 + 动画 |
| **Toast通知** | `.ui-toast` | fixed 定位、自动消失、堆叠 |
| **进度条** | `.ui-progress` | CSS `@keyframes` width 过渡 |
| **徽章** | `.ui-badge` | pill 形状、彩色、带数字 |

**命名约定：** 所有 UI 组件以 `.ui-` 前缀命名，避免与 Mermaid 内部 `.node` 和页面 `.ve-card` 冲突。

**交互示例：** 模态框、Toast、标签页切换等需要少量 JS，保持自包含（无外部依赖）。

### 数据表 / 比较 / 审计
使用真正的 `<table>` 元素——而不是 CSS Grid 冒充表格。表格自带无障碍访问、复制粘贴行为和列对齐。参考模板 `./templates/data-table.html` 展示了以下所有模式。

**主动使用。** 任何在终端中渲染 ASCII 框线表格的时候，改为生成 HTML 表格。包括：需求审计（需求 vs 方案）、功能比较、状态报告、配置矩阵、测试结果汇总、依赖列表、权限表、API 端点清单——任何结构化行列。

布局模式：
- 粘性 `<thead>` 使表头在滚动长表格时保持可见
- 交替行背景（通过 `tr:nth-child(even)`，微妙变化 2-3%）
- 首列可选粘性用于带水平滚动的宽表
- 响应式包装器 `overflow-x: auto`
- 通过 `<colgroup>` 或 `th` 宽度给出列宽提示——让文字重的列透气
- 行悬停高亮便于扫描

状态指示器（使用样式化 `<span>` 元素，永远不要用 emoji）：
- 匹配/通过/是：绿色背景的彩色圆点或勾号
- 差距/失败/否：红色背景的彩色圆点或叉号
- 部分/警告：琥珀色指示器
- 中性/信息：暗淡文字或柔和徽章

单元格内容：
- 自然换行长文本——不要截断或强制单行
- 技术引用使用 `<code>`
- 次要细节文字用 `<small>` 配合暗淡颜色
- 数字列保持右对齐，使用 `tabular-nums`

### 时间线 / 路线图
垂直或水平时间线，带中心线（CSS 伪元素）。线上的阶段标记为圆圈。内容卡片交替左右排列或全部在一侧。线上的日期标签。从过去（暗淡）到未来（鲜艳）的颜色渐变。

### 仪表盘 / 指标概览
卡片网格布局。主角数字大而突出。通过内联 SVG `<polyline>` 实现迷你图。通过 CSS `linear-gradient` 在 div 上实现进度条。对于真实图表（柱状、折线、饼图），**通过 CDN 使用 Chart.js**。KPI 卡片带趋势指示器（上/下箭头、百分比变化）。

### 实现方案

用于可视化实现方案、扩展设计或功能规格。目标是**理解方式**，而不是阅读完整源代码。

**不要倾倒完整文件。** 内联显示整个源文件会压倒页面并违背可视化解释的目的。取而代之：
- 显示**带描述的文件结构**——列出函数/导出项带一行说明
- 仅显示**关键代码片段**——说明核心逻辑的 5-10 行
- 如果需要完整代码，使用**折叠部分**

**代码块需要显式格式化。** 没有 `white-space: pre-wrap`，代码会挤成一面不可读的墙。参见 `./references/css-patterns.md` 中的"代码块"章节。

**实现方案结构：**
1. 概览/目的（解决什么问题？）
2. 流程图表（Mermaid 或 CSS 卡片）
3. 带描述的文件结构（不是完整代码）
4. 关键实现细节（片段）
5. API/接口摘要
6. 使用示例

### 文档（README、库文档、API 参考）

可视化文档时，将结构提取为视觉元素：

| 内容 | 视觉处理 |
|---------|------------------|
| 功能 | 卡片网格（2-3 列） |
| 安装/设置步骤 | 编号卡片或垂直流程 |
| API 端点/命令 | 带粘性表头的表格 |
| 配置选项 | 表格 |
| 架构 | Mermaid 图表或 CSS 卡片布局 |
| 比较 | 并排面板或表格 |
| 警告/注意 | 标注框 |

不要只是格式化散文——转化它。功能列表变成卡片网格。安装步骤变成编号流程。API 参考变成表格。

### 散文强调元素

在视觉页面中节制使用，用于突出关键点或提供呼吸空间。参见 `./references/css-patterns.md` 中的 CSS 模式。

- **引导段**——在进入卡片/网格前设定上下文的较大介绍文字
- **引用**——突出关键见解；每页最多一个
- **标注框**——警告、提示、重要注意事项
- **章节分隔线**——主要部分之间的视觉分隔

**何时使用：** 解释文章的视觉页面可能用引导段作为主题陈述，然后用卡片展示关键论点。README 可视化可能用标注框显示警告，但其他部分保持卡片/表格为主。

## 幻灯片模式

用于将内容呈现为杂志级幻灯片演示的替代输出格式。**仅限选择加入**——代理在用户调用 `/generate-slides`、传递 `--slides` 给现有命令，或明确要求幻灯片时生成。从不自动选择幻灯片格式。

**生成幻灯片前**，读 `./references/slide-patterns.md`（引擎 CSS、幻灯片类型、过渡、导航、预设）和 `./templates/slide-deck.html`（展示所有 10 种类型的参考模板）。也读 `./references/css-patterns.md` 获取共享模式和 `./references/libraries.md` 获取 Mermaid/Chart.js 主题。

**幻灯片不是页面的重新格式化。** 它们是不同的媒介。每张幻灯片正好一个视口高度（100dvh），没有滚动。排版大 2-3 倍。构图更粗犷。代理组织叙事弧（冲击→上下文→深潜→解决），而不是机械分页源内容。

**内容完整性。** 改变媒介并不意味着丢掉内容。在写任何 HTML 之前，按照 `slide-patterns.md` 中的"从源文档规划幻灯片"过程操作：盘点源素材，将每个项目映射到幻灯片，验证覆盖率。源文档中的每个章节、决策、数据点、规范和折叠细节都必须出现在幻灯片中。如果一个方案有 7 个部分，幻灯片覆盖全部 7 个。如果有 6 个决策，展示全部 6 个——而不是适合一张幻灯片的 2 个。源中的折叠细节变成它们自己的幻灯片。添加更多幻灯片而不是裁剪内容。一张覆盖一切的 22 页幻灯片胜过一张看起来漂亮但缺少 40% 源内容的 13 页幻灯片。

**幻灯片类型（10 种）：** 标题、章节分隔、内容、分屏、图表、仪表盘、表格、代码、引用、全屏。每种在 `slide-patterns.md` 中有定义布局。超过幻灯片密度限制的内容拆分到多张幻灯片——永远不要在幻灯片内滚动。

**视觉丰富度：** 开始时检查 `which surf`。如果可用，在写 HTML 前生成 2-4 张图片。也使用 SVG 装饰强调、每张幻灯片的背景渐变、内联迷你图和小 Mermaid 图表。视觉优先，文字第二。

**构图多样性：** 连续幻灯片必须变化空间方式——居中、左重、右重、分屏、边缘对齐、全屏。三个连续居中幻灯片意味着要把一个推出轴线。

**预设：** 四种幻灯片特定预设（Midnight Editorial、Warm Signal、Terminal Mono、Swiss Clean）加上适配幻灯片的现有 8 种审美方向。选择一个并贯彻。

**`--slides` 标志：** 当用户传递 `--slides` 给 `/diff-review`、`/plan-review`、`/project-recap` 或其他命令时，代理使用命令的正常数据收集指令收集数据，然后以幻灯片形式展示内容。幻灯片版本用不同的结构和节奏讲述同样的故事——但覆盖范围相同。不要用幻灯片格式作为总结或跳过部分的借口。

## 文件结构

每个图表是一个自包含的 `.html` 文件。没有外部资源，除了 CDN 链接（字体、可选库）。结构：

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>描述性标题</title>
  <link href="https://fonts.googleapis.com/css2?family=...&display=swap" rel="stylesheet">
  <style>
    /* CSS 自定义属性、主题、布局、组件——全部内联 */
  </style>
</head>
<body>
  <!-- 语义化 HTML: 章节、标题、列表、表格、内联 SVG -->
  <!-- 纯 CSS 静态图表不需要脚本 -->
  <!-- 可选：使用 Mermaid、Chart.js、ECharts 或 anime.js 时添加 <script> -->
  <!-- UI 组件使用 .ui- 命名空间，避免与 .ve-card 和 .node 冲突 -->
</body>
</html>
```

## 异常与降级处理

以下场景需要在生成时做好防护，确保不会因为某个环节失败而导致整个流程中断：

| 异常场景 | 降级策略 | 说明 |
|---------|---------|------|
| Mermaid CDN 加载失败 | 退化为静态 HTML/CSS 渲染，用内联 SVG 或 CSS 卡片代替 | 检查 `mermaid` 全局变量是否为 `undefined`，如果是则隐藏 `.mermaid-wrap` 并显示静态布局 |
| Google Fonts CDN 不可用 | 依赖 `font-family` 栈中的系统回退字体 | 已在字体配对中处理，每个 `font-family` 包含系统回退 |
| 浏览器 `open`/`start` 命令失败 | 输出文件路径到对话中，提示用户手动打开 | 在 `open` 命令后加 `|| echo "请手动打开: $FILE"` |
| `surf` CLI 不可用 | 跳过 AI 图片生成，不报错 | 每次使用前检查 `which surf`，不可用时静默跳过 |
| 生成的 HTML 超过 2000 行 | 拆分内容到多个页面，每个页面聚焦一个主题 | 用 `<details>/<summary>` 折叠次要章节，或使用"上一页/下一页"链接 |
| Chart.js CDN 加载失败 | 用 CSS 或内联 SVG 替代图表（进度条、迷你图） | 检测 `Chart` 全局变量，未定义时显示静态版本 |
| ECharts CDN 加载失败 | 降级为 Chart.js（仅支持简单图）或纯 CSS 图表 | 检测 `echarts` 全局变量，undefined 时显示降级版本 |
| 图像生成失败 | 用纯文字描述区块 + CSS 装饰占位代替图片 | 在 `<img>` 的 `onerror` 中隐藏图片并显示 .img-fallback 容器 |

## 质量检查

交付前验证：
- **眯眼测试**：模糊你的眼睛。还能感知层次吗？部分视觉上可区分吗？
- **替换测试**：用通用暗色主题替换你的字体和颜色会使这个页面与模板难以区分吗？如果是，进一步推动审美。
- **双主题**：在浅色和深色模式间切换操作系统。两者都应看起来有意为之，而不是破裂的。
- **信息完整性**：图表是否实际传达了用户要求的内容？漂亮但不完整是失败。
- **无溢出**：将浏览器调整到不同宽度。没有内容应被裁剪或逃出容器。每个 grid 和 flex 子项需要 `min-width: 0`。并排面板需要 `overflow-wrap: break-word`。永远不要对标记字符使用 `display: flex` on `<li>`。参见 `./references/css-patterns.md` 中的溢出保护。
- **Mermaid 缩放控件**：每个 `.mermaid-wrap` 容器必须有缩放控件（+/-/重置/展开）、Ctrl/Cmd+滚轮缩放、拖拽平移和点击展开。参见 `./references/css-patterns.md` 中的完整模式。
- **文件正常打开**：没有控制台错误、字体加载失败或布局偏移。
- **UI 组件命名空间**：使用了 `.ui-` 前缀的组件不与 Mermaid `.node` 冲突。
- **图像降级**：如果页面包含生图，确认有 fallback（`onerror` 或文字占位）。
- **反模式自检**：对照 `./references/anti-patterns.md` 逐项检查，确认无 AI 垃圾信号。

## 反模式

交付前应用 7 点测试判断是否看起来像 AI 垃圾。完整禁止项和详细说明见 `./references/anti-patterns.md`，**风格设计中必须读取**。

## 资源速查

| 文件 | 用途 | 何时读取 |
|------|------|---------|
| `./templates/architecture.html` | CSS Grid 架构布局 + 暖色调例 | 文字密集的架构概览 |
| `./templates/mermaid-flowchart.html` | Mermaid 图表 + 缩放控件 | 流程图/时序图/ER/状态机/思维导图 |
| `./templates/data-table.html` | 格式化数据表 + 状态指示器 | 比较/审计/功能矩阵 |
| `./templates/slide-deck.html` | 10种幻灯片类型 + 键盘导航 | 幻灯片或 `--slides` 标志 |
| `./references/css-patterns.md` | CSS 模式全集 | 每次生成前必读（布局/动画/主题/溢出保护） |
| `./references/libraries.md` | 字体配对 + Mermaid/Chart.js 配置 | 选择字体或配置 CDN 库时 |
| `./references/responsive-nav.md` | 多章节导航（桌面侧边栏+移动标签栏） | 4 个章节以上的页面 |
| `./references/slide-patterns.md` | 幻灯片类型/预设/密度限制 | 幻灯片生成前 |
| `./references/anti-patterns.md` | 反模式完整清单（字体/调色板/布局/模板痕迹） | 风格设计时必须读取 |
| `./marmeid/rules/README.md` | Mermaid 通用规则（style 指令/节点形状/classDef/故障诊断） | 任何 Mermaid 图表生成前 |
| `./marmeid/rules/flowchart.md` | 流程图语法 + 节点形状/子图/边缘样式 | 生成 Mermaid 流程图时 |
| `./marmeid/rules/sequence.md` | 时序图语法 + alt/else/loop/opt/参与者声明 | 生成 Mermaid 时序图时 |
| `./marmeid/rules/class.md` | 类图语法 + 可见性/关系/多重性 | 生成 Mermaid 类图时 |
| `./marmeid/rules/state.md` | 状态图语法 + 复合状态/标签注意事项 | 生成 Mermaid 状态图时 |
| `./marmeid/rules/er.md` | ER 图语法 + 关系标记/字段注解 | 生成 Mermaid ER 图时 |
| `./marmeid/rules/mindmap.md` | 思维导图语法 + 缩进规则 | 生成 Mermaid 思维导图时 |
| `./marmeid/templates/marmeid-flowchart.html` | 工作示例：流程图（字面颜色/样式） | Mermaid 流程图 few-shot 参考 |
| `./marmeid/templates/marmeid-sequence.html` | 工作示例：时序图（alt/else/note） | Mermaid 时序图 few-shot 参考 |
| `./marmeid/templates/marmeid-class.html` | 工作示例：类图（UML 关系/多重性） | Mermaid 类图 few-shot 参考 |
| `./marmeid/templates/marmeid-state.html` | 工作示例：状态图（复合状态/note） | Mermaid 状态图 few-shot 参考 |
| `./marmeid/templates/marmeid-er.html` | 工作示例：ER 图（5 实体/字段类型） | Mermaid ER 图 few-shot 参考 |
| `./commands/` (8 个文件) | 各命令的详细执行模板 | 用户调用对应命令时 |
| `./subskills/image-gen/SKILL.md` | LLM 图像生成嵌入 HTML 的模式 | 需要生图时（场景图/概念插图/复杂视觉） |
