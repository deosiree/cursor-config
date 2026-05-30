# 渲染图路由中心 — 说明文档

## 我该什么时候用？

当你在写 Markdown 文档时需要插入图表——流程图、架构图、时序图、数据表格、幻灯片等。

## 快速使用

1. 告诉 Agent：`画一个 XX 图`
2. Agent 读 `SKILL.md` → 判断复杂度 → 选 Mermaid 或 HTML
3. 简单图直接嵌入 `mermaid` 代码块（Obsidian 原生渲染）
4. 复杂图生成独立 HTML 文件

## 三种渲染方式

| 方式 | 适合 | 不适合 |
|------|------|--------|
| **Mermaid 代码块** | 流程图、时序图、类图、状态图 | 复杂表格、带 CSS 的卡片布局 |
| **HTML 页面** | 架构图、数据表、幻灯片 | 简单流程（杀鸡用牛刀） |
| **AI 生图** | 概念插画、场景图 | 精确拓扑（Mermaid 更好） |

## 自然语言触发示例

| 你这样说 | Agent 会做什么 |
|---------|---------------|
| "画一个 monorepo 分层图" | 模块分层 → Mermaid flowchart TD |
| "画 Agent Loop 的执行流程" | 流程图 → Mermaid（窄版竖排） |
| "做 6 列 8 行的能力对比表" | 复杂表格 → output-html data-table（非 Mermaid！） |
| "画用户输入到输出的时序图" | 时序 → Mermaid sequenceDiagram |
| "生成一张概念插图" | 非代码 → 生图路由（image-gen） |

## Mermaid 图的窄版规则

所有 Mermaid 图优先竖排（上→下），节点文字简短，避免 Obsidian 中横向溢出。

## 相关

- output-html skill：`html-skills/output-html/SKILL.md`
- Mermaid 语法规则：`html-skills/output-html/marmeid/rules/README.md`
- 通用-Mermaid绘图：`md-skills/通用-Mermaid绘图/SKILL.md`
