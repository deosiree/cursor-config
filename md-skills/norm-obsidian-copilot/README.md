# norm-obsidian-copilot

将 agent 对话裁剪稿转换为规范文档，重点是保留原始有效问答，只移除 user 的输出结构约束和 ai 的思维链。

## 目录结构

```text
norm-obsidian-copilot/
├─ SKILL.md
├─ README.md
└─ template/
   ├─ input-basic.md
   ├─ output-basic.md
   ├─ input-with-output-dir.md
   ├─ output-with-output-dir.md
   ├─ input-full-options.md
   └─ output-full-options.md
```

## 输入格式

推荐结构化输入：

```json
{
  "input_path": "F:\\...\\Claude双后端系统架构分析@20260502_222030.md",
  "output_dir": "F:\\...\\template",
  "title_mode": "auto"
}
```

参数说明：

- `input_path`（必填）：待清洗文档绝对路径。
- `output_dir`（可选）：输出目录绝对路径。
- `title_mode`（可选）：`auto` 或 `keep_topic`。

默认规则：

- 不带 `output_dir`：输出到输入文档所在目录。
- 带 `output_dir`：严格输出到指定目录。
- 输出文件名：移除最后一个 `@` 及其后缀时间串。
- 输出正文前必须保留或生成一级标题（`# 标题`），用于承接后续 `user/ai` 对话块。

## 调用示例（few-shot）

### 1. 不带输出目录

请求示例：

```json
{
  "input_path": "F:\\Documents\\Repertory\\Own\\my-rag-study\\.cursor\\md-skills\\norm-obsidian-copilot\\template\\Claude双后端系统架构分析@20260502_222030.md"
}
```

期望产物：

- 输出落盘路径：输入文件同目录。
- 输出文件名变化：`Claude双后端系统架构分析@20260502_222030.md -> Claude双后端系统架构分析.md`
- 内容变化要点：仅删除 user 中“对 AI 输出结构的约束”与 `<think>`，保留有效问答、自动生成精炼标题。

### 2. 带输出目录

请求示例：

```json
{
  "input_path": "F:\\Documents\\Repertory\\Own\\my-rag-study\\.cursor\\md-skills\\norm-obsidian-copilot\\template\\Claude双后端系统架构分析@20260502_222030.md",
  "output_dir": "F:\\Documents\\Repertory\\Own\\my-rag-study\\tmp\\normalized"
}
```

期望产物：

- 输出落盘路径：`F:\Documents\Repertory\Own\my-rag-study\tmp\normalized`
- 输出文件名变化：去除 `@timestamp` 后缀。
- 内容变化要点：与默认规则一致，仅输出目录变化，不重写 AI 正文。

### 3. 带可选参数全量

请求示例：

```json
{
  "input_path": "F:\\Documents\\Repertory\\Own\\my-rag-study\\.cursor\\md-skills\\norm-obsidian-copilot\\template\\Claude双后端系统架构分析@20260502_222030.md",
  "output_dir": "F:\\Documents\\Repertory\\Own\\my-rag-study\\tmp\\normalized",
  "title_mode": "keep_topic"
}
```

期望产物：

- 输出落盘路径：`output_dir`。
- 输出文件名变化：去除 `@timestamp`。
- 内容变化要点：标题优先采用 frontmatter `topic`，其余清洗规则不变，AI 答案主体不改写。

## 自然语言兼容输入

- “清洗这个文件：`<input_path>`”
- “清洗这个文件并输出到：`<output_dir>`”
- “清洗并保留 topic 作为标题：`title_mode=keep_topic`”
