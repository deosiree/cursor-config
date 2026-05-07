---
name: web-best-practice-sync
description: 通过 WebSearch 同步 Cursor Skills 与 Mermaid 的最新最佳实践，并回填到技能规则。Use when 需要确保 skill 规范不过时或新增约束有官方依据。
---

# web-best-practice-sync

## When to Use

- 需要引入或更新外部最佳实践。
- 技能规则出现争议，需要外部依据支撑。

## Template Anchors（相对引用）

执行前必须先读取以下相对路径：

- `../../SKILL.md`
- `../../README.md`
- `../../docs/Mermaid.md`
- `../../docs/sequenceDiagram.md`

约束：

- 外部同步结果仅用于更新锚点相关规则，禁止脱离当前技能体系扩展无关规范。

## Instructions

1. 优先检索官方来源：
   - Cursor Docs（skills/commands/context）
   - Mermaid 官方文档（syntax/theming）
2. 抽取结果时分两类：
   - 强规则（必须执行）
   - 建议项（可选增强）
3. 回写策略：
   - 强规则写入父 skill 或对应子 skill
   - 建议项写入 README 的“最佳实践”小节
4. 标注来源链接，避免“无来源规范”。

## Output Contract

- 输出 `bestPracticeDelta`：
  - `hardRules[]`
  - `recommendations[]`
  - `sourceLinks[]`

