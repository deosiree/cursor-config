---
name: 通用-Mermaid绘图
description: 为 Markdown 文档生成 Obsidian 友善的 Mermaid 图表（窄版、竖排优先）。被 common-skills/渲染图skills 调用。
---

# 通用 Mermaid 绘图

> **定位：** 为 md 输出生成 Mermaid 代码块，专注窄版布局和 Obsidian 兼容性。复杂图走 `[[../../html-skills/output-html/SKILL.md]]`。

## 路由规则

| 需求 | Mermaid 类型 | 方向 |
|------|-------------|------|
| 模块分层/依赖/流程 | `flowchart TD` | 竖排 |
| 调用时序 | `sequenceDiagram` | 自动 |
| 类继承/接口 | `classDiagram` | 自动 |
| 状态转换 | `stateDiagram-v2` | 自动 |
| 实体关系 | `erDiagram` | 自动 |

## 窄版布局规则（Obsidian 硬约束）

```
1. 方向：默认 flowchart TD（上→下），禁止 LR 除非 ≤3 节点
2. 节点文字：≤15 中文字，过长用 \n 换行
3. subgraph 标签：≤10 字
4. 同级分支：≤4 个，超过合并为"其他"
5. 配色：不写内联 style（依赖 Obsidian 主题）
6. 禁止：嵌套 subgraph 超 2 层
```

## 输出格式

```markdown
\`\`\`mermaid
flowchart TD
    A[节点A] --> B[节点B]
    ...
\`\`\`
```

不生成独立 .html 文件。不生成 ASCII art。

## 审美方向（从 output-html 继承）

每次变动选择，不要默认暗色+蓝色：
- Blueprint（技术绘图感，灰蓝调）
- Editorial（衬线标题，宽裕留白）
- Paper/ink（暖白背景，非正式感）
- IDE 风格（Dracula / Nord / Catppuccin）

## 语法参考

- flowchart：[[../../html-skills/output-html/marmeid/rules/flowchart.md]]
- sequence：[[../../html-skills/output-html/marmeid/rules/sequence.md]]
- class：[[../../html-skills/output-html/marmeid/rules/class.md]]
- state：[[../../html-skills/output-html/marmeid/rules/state.md]]
- er：[[../../html-skills/output-html/marmeid/rules/er.md]]

## 使用示例

```text
用户：画一个 Agent Loop 流程图
Agent：
1. 判断 → 流程图 → flowchart TD
2. 应用窄版规则：竖排、节点 ≤15 字
3. 输出 mermaid 代码块
```
