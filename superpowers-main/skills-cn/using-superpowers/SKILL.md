---
name: using-superpowers
description: 在开始任何对话时使用 - 建立如何查找和使用技能，要求在包括澄清问题在内的任何响应之前调用 Skill 工具
---

<EXTREMELY-IMPORTANT>
如果你认为有哪怕 1% 的机会技能可能适用于你正在做的事情，你绝对必须调用该技能。

如果技能适用于你的任务，你没有选择。你必须使用它。

这是不可协商的。这不是可选的。你无法合理化地摆脱这一点。
</EXTREMELY-IMPORTANT>

## 如何访问技能

**在 Claude Code 中：** 使用 `Skill` 工具。当你调用技能时，其内容被加载并呈现给你——直接遵循它。永远不要使用 Read 工具读取技能文件。

**在其他环境中：** 检查你平台的文档以了解如何加载技能。

# 使用技能

## 规则

**在任何响应或操作之前调用相关或请求的技能。** 即使有 1% 的机会技能可能适用，你也应该调用技能来检查。如果调用的技能结果证明不适合情况，你不需要使用它。

```dot
digraph skill_flow {
    "User message received" [shape=doublecircle];
    "Might any skill apply?" [shape=diamond];
    "Invoke Skill tool" [shape=box];
    "Announce: 'Using [skill] to [purpose]'" [shape=box];
    "Has checklist?" [shape=diamond];
    "Create TodoWrite todo per item" [shape=box];
    "Follow skill exactly" [shape=box];
    "Respond (including clarifications)" [shape=doublecircle];

    "User message received" -> "Might any skill apply?";
    "Might any skill apply?" -> "Invoke Skill tool" [label="yes, even 1%"];
    "Might any skill apply?" -> "Respond (including clarifications)" [label="definitely not"];
    "Invoke Skill tool" -> "Announce: 'Using [skill] to [purpose]'";
    "Announce: 'Using [skill] to [purpose]'" -> "Has checklist?";
    "Has checklist?" -> "Create TodoWrite todo per item" [label="yes"];
    "Has checklist?" -> "Follow skill exactly" [label="no"];
    "Create TodoWrite todo per item" -> "Follow skill exactly";
}
```

## 危险信号

这些想法意味着停止——你正在合理化：

| 想法 | 现实 |
|---------|---------|
| "这只是个简单问题" | 问题是任务。检查技能。 |
| "我需要更多上下文" | 技能检查在澄清问题之前。 |
| "让我先探索代码库" | 技能告诉你如何探索。先检查。 |
| "我可以快速检查 git/文件" | 文件缺乏对话上下文。检查技能。 |
| "让我先收集信息" | 技能告诉你如何收集信息。 |
| "这不需要正式技能" | 如果技能存在，使用它。 |
| "我记得这个技能" | 技能会演变。阅读当前版本。 |
| "这不算任务" | 行动 = 任务。检查技能。 |
| "技能是过度杀伤" | 简单的事情变得复杂。使用它。 |
| "我只先做这一件事" | 在做任何事情之前检查。 |
| "这感觉有成效" | 无纪律的行动浪费时间。技能防止这一点。 |
| "我知道那是什么意思" | 知道概念 ≠ 使用技能。调用它。 |

## 技能优先级

当多个技能可能适用时，使用此顺序：

1. **流程技能优先**（brainstorming、debugging）- 这些决定如何接近任务
2. **实施技能其次**（frontend-design、mcp-builder）- 这些指导执行

"让我们构建 X" → 首先 brainstorming，然后实施技能。
"修复这个错误" → 首先 debugging，然后领域特定技能。

## 技能类型

**严格**（TDD、debugging）：完全遵循。不要适应掉纪律。

**灵活**（模式）：将原则适应上下文。

技能本身告诉你哪个。

## 用户指令

指令说做什么，不是如何做。"添加 X" 或"修复 Y" 不意味着跳过工作流。
