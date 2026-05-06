---
name: norm-obsidian-copilot
description: 将 agent 对话稿自动规范化为高可读文档：保留用户有效问题与 AI 有效答案，仅移除用户中的输出结构约束和 AI 的 `<think>...</think>` 思维链，并按命名规则输出到默认或指定目录。
---

# norm-obsidian-copilot

## 功能说明

本 skill 用于清洗对话裁剪稿，将低信息密度内容移除，输出可读性更高的规范文档。

## 输入契约

### 必填参数

- `input_path`: 待清洗文档的绝对路径。

### 可选参数

- `output_dir`: 输出目录绝对路径。
- `title_mode`: 标题策略。
  - `auto`（默认）：基于 user 问题与 ai 回答生成精炼一级标题。
  - `keep_topic`：优先保留 frontmatter 里的 `topic` 作为一级标题。

### 默认行为

- 未提供 `output_dir`：输出到 `input_path` 所在目录。
- 提供 `output_dir`：输出到指定目录。
- 输出文件名：输入文件名去掉最后一个 `@` 及其后缀时间串。
  - 示例：`A@20260502_222030.md -> A.md`
- 输出正文前必须存在一级标题（`# 标题`），不得缺失。

## 处理规则（硬约束）

1. 每轮 user 提问仅保留有意义、简短、可理解的问题句。
2. 仅删除 user 中对 AI 输出结构的约束内容（如固定输出框架、格式模板、强制分段规则），其余背景与问题语义保留。
3. 必须在每轮 `user: ... ai: ...` 对话块之前保留或生成一个精炼一级标题（`# 标题`）。
4. 仅删除 ai 回答中的 `<think>...</think>` 包裹段，保留 AI 正文答案、标题和原有结构。
5. 输出目录默认采用输入目录；若调用时提供 `output_dir` 则覆盖。

## Few-shot

### 示例 1：仅 input_path

请求：

```json
{
  "input_path": "F:\\Documents\\Repertory\\Own\\my-rag-study\\.cursor\\md-skills\\norm-obsidian-copilot\\template\\Claude双后端系统架构分析@20260502_222030.md"
}
```

期望：

- 输出目录：`input_path` 所在目录。
- 输出文件：`Claude双后端系统架构分析.md`。
- 内容：仅删除 user 中输出结构约束与 ai `<think>`，保留有效问答，生成精炼标题。

### 示例 2：input_path + output_dir

请求：

```json
{
  "input_path": "F:\\Documents\\Repertory\\Own\\my-rag-study\\.cursor\\md-skills\\norm-obsidian-copilot\\template\\Claude双后端系统架构分析@20260502_222030.md",
  "output_dir": "F:\\Documents\\Repertory\\Own\\my-rag-study\\tmp\\normalized"
}
```

期望：

- 输出目录：`F:\Documents\Repertory\Own\my-rag-study\tmp\normalized`
- 输出文件：`Claude双后端系统架构分析.md`
- 内容：同清洗规则，目录以 `output_dir` 为准。

### 示例 3：input_path + output_dir + title_mode

请求：

```json
{
  "input_path": "F:\\Documents\\Repertory\\Own\\my-rag-study\\.cursor\\md-skills\\norm-obsidian-copilot\\template\\Claude双后端系统架构分析@20260502_222030.md",
  "output_dir": "F:\\Documents\\Repertory\\Own\\my-rag-study\\tmp\\normalized",
  "title_mode": "keep_topic"
}
```

期望：

- 输出目录：`output_dir`。
- 输出文件：去除 `@timestamp` 后缀。
- 标题：优先使用 frontmatter `topic`，其余规则不变。

## 自然语言输入兼容

- “清洗这个文件：`<input_path>`”
- “清洗这个文件并输出到：`<output_dir>`”
- “清洗并保留 topic 作为标题：`title_mode=keep_topic`”
