---
name: 渲染图路由
description: 根据图类型和复杂度，路由到 Mermaid（内嵌）或 output-html（独立页面）。被学习助手、gen-README 等调用。
---

# 渲染图路由中心

> **定位：** 只做路由，不做拷贝。根据图类型和复杂度，分发到 Mermaid（Markdown 内嵌）或 output-html（独立 HTML 页面）。
> **使用者：** 任何需要在输出 md 时嵌入图表的 skill 套件。

## RED（失败基线）
- 对复杂表格用 Mermaid → 排版崩溃，数据不可读
- 对简单流程图用 HTML → 杀鸡用牛刀，增加 500+ 行模板开销
- 窄版规则未遵守 → Obsidian 中横向溢出，用户无法阅读

## GREEN（执行主线）
见下方"路由规则"和"使用方法"。

## REFACTOR
- 窄版规则超过 6 条 → 独立为 `references/narrow-layout-rules.md`
- 新增图类型 → 更新"图类型映射"和"HTML 模板"两张表

## 边界条件

| 异常 | 处理 |
|------|------|
| 通用-Mermaid绘图 skill 不可达 | 回退：直接按本文件"窄版布局规则"生成 Mermaid 代码，标注"⚠️ 通用-Mermaid绘图 skill 不可达，基于规则自行生成" |
| output-html skill 不可达 | 回退：尝试用 Mermaid 替代；若图表复杂度不允许 → 降级为 ASCII 结构图 + 提示安装 output-html |
| image-gen 不可达 | 回退：用 Mermaid 生成近似拓扑图，标注"⚠️ 生图不可用，已用 Mermaid 替代" |
| 用户未指定图类型 | 暂停，追问："你想要流程图、架构图、时序图还是数据表？" |

## 检查点

- **Mermaid 生成后**：确认 `flowchart TD`（竖排） + 节点 ≤15 字 + 分支 ≤4。若横向溢出 → 自动重排为竖排
- **HTML 生成后**：读 output-html SKILL.md 选模板 → 确认模板文件存在 → 生成 .html → 提示用户在浏览器中预览
- **生图请求时**：确认是"概念图"而非"精确拓扑"——若误触发 → 拦截并路由回 Mermaid

## 路由规则

| 图类型 | 复杂度 | 路由目标 | 输出形式 |
|--------|--------|---------|---------|
| 流程图/时序/类图/状态图/ER图 | 简单~中等 | [[../../md-skills/通用-Mermaid绘图/SKILL.md]] | ```mermaid 代码块（Obsidian 原生渲染） |
| 架构图/数据表/幻灯片/复杂仪表盘 | 复杂 | [[../../html-skills/output-html/SKILL.md]] | 独立 .html 文件 |
| 概念图/场景图/插画 | 无法用代码表达 | [[../../html-skills/output-html/subskills/image-gen/SKILL.md]] | AI 生图嵌入 HTML |

## 图类型 → Mermaid 类型映射

| 需求 | Mermaid 类型 | 模板参考 |
|------|-------------|---------|
| 模块分层/依赖关系 | `flowchart TD`（竖排优先） | [[../../html-skills/output-html/marmeid/rules/flowchart.md]] |
| 调用时序/消息传递 | `sequenceDiagram` | [[../../html-skills/output-html/marmeid/rules/sequence.md]] |
| 类继承/接口实现 | `classDiagram` | [[../../html-skills/output-html/marmeid/rules/class.md]] |
| 状态转换 | `stateDiagram-v2` | [[../../html-skills/output-html/marmeid/rules/state.md]] |
| 实体关系 | `erDiagram` | [[../../html-skills/output-html/marmeid/rules/er.md]] |
| 脑图/思维导图 | `mindmap` | [[../../html-skills/output-html/marmeid/rules/mindmap.md]] |

## Mermaid 窄版布局规则（Obsidian 友善）

由于 Obsidian 侧边栏和移动端宽度有限，所有 Mermaid 图必须遵守：

1. **方向：** 优先 `flowchart TD`（上→下），避免 `LR`（左→右）除非节点 ≤ 3 个
2. **节点文字：** ≤ 15 个中文字，多行用 `\n` 换行而非横向扩展
3. **子图：** `subgraph` 标签 ≤ 10 字
4. **分支：** 同级分支 ≤ 4 个；超过 4 个时合并为"其他"节点
5. **配色：** 不写内联 style 除非必要——Obsidian 主题会自动适配暗色/亮色模式
6. **测试：** 写完后在 Obsidian 阅读视图确认宽度不超出编辑区

## HTML 渲染路由（复杂图）

当 Mermaid 无法表达时（表格 > 4 行 3 列、需要 CSS 卡片布局、幻灯片），走 output-html：

| 需求 | 模板 |
|------|------|
| 架构概览（卡片 > 拓扑） | [[../../html-skills/output-html/templates/architecture.html]] |
| 流程图/时序/ER/状态机 | [[../../html-skills/output-html/templates/mermaid-flowchart.html]] |
| 数据表/对比/审计 | [[../../html-skills/output-html/templates/data-table.html]] |
| 幻灯片 | [[../../html-skills/output-html/templates/slide-deck.html]] |

## 使用方法（Agent 视角）

```
1. 判断图的复杂度：简单 → Mermaid / 复杂 → output-html / 概念 → image-gen
2. 若 Mermaid：读 通用-Mermaid绘图 + 窄版规则 → 生成 mermaid 代码块
3. 若 output-html：读 output-html SKILL.md → 选模板 → 生成 .html
4. 在 md 中引用：Mermaid 内嵌 ```mermaid；HTML 外链 [查看图表](path.html)
```

## 引用源（不拷贝）

| 来源 | 路径 |
|------|------|
| output-html 主 skill | [[../../html-skills/output-html/SKILL.md]] |
| output-html 子技能：生图 | [[../../html-skills/output-html/subskills/image-gen/SKILL.md]] |
| Mermaid 语法规则 | [[../../html-skills/output-html/marmeid/rules/README.md]] |
| 通用-Mermaid绘图 | [[../../md-skills/通用-Mermaid绘图/SKILL.md]] |

## 外部参考

| 来源 | 说明 |
|------|------|
| [Mermaid 官方文档](https://mermaid.js.org/) | 语法参考 |
| [output-html](https://github.com/nicobailon/visual-explainer) | HTML 可视化解释器上游 |
