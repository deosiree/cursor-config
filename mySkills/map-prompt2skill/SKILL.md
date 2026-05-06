---
name: map-prompt2skill
description: 当需要把单个 Markdown prompt 或一批 prompt 目录沉淀为标准 skill，并按已有 skill 的 name 去重批量转换时使用。
---

# 目标
把作为 prompt 使用的 Markdown 文件，转换为 agent 更容易触发和执行的标准 skill。

## 输入
调用本 skill 时，必须显式提供：
- `源路径`
- `输出目录`

`源路径` 允许两种形态：
- 单个 `.md` 文件
- 包含多个 `.md` 文件的目录

## 执行流程
### 1. 识别输入类型
- 如果 `源路径` 是文件，只处理该文件。
- 如果 `源路径` 是目录，收集目录下全部 `.md` 文件。

### 2. 目录模式先做去重
当 `源路径` 是目录时，先扫描 `输出目录`：
- 只读取各子目录内的 `SKILL.md`
- 解析 frontmatter 中的 `name`
- 将这些 `name` 视为“已转换 prompt 名称集合”
- 对待处理 prompt，使用“原文件名去掉 `.md`”后的结果比对
- 命中则跳过，未命中才继续转换

不要用子目录名做去重依据，只用 `SKILL.md` frontmatter 里的 `name`。

### 3. 读取 prompt 内容
对每个待转换的 prompt：
- 读取原 Markdown 的 frontmatter
- 读取正文
- 提取原文件名，不含 `.md`

frontmatter 仅作为理解 prompt 用途的辅助信息，不直接复用为目标 skill 的 frontmatter。

### 4. 生成目标 skill 的 `name`
- `name` 固定使用原 prompt 文件名
- 不包含 `.md`
- 保留原有中文、数字、括号等字符

示例：
- `创建术语.md` -> `创建术语`
- `简历优化（agent）.md` -> `简历优化（agent）`

### 5. 生成目标 skill 的 `description`
根据 prompt 的真实用途，写一句中文触发描述：
- 重点写“何时使用”
- 不要写完整执行流程
- 不要把 prompt 正文原样塞进 `description`

优先句式：
- `当需要……时使用。`
- `当处理……并希望……时使用。`

### 6. 生成英文短目录名
为每个 prompt 生成独立子目录，目录名要求：
- 英文
- `-` 分隔
- 最多 5 个单词
- 整体尽量不超过 18 个字符

生成策略：
1. 先根据 prompt 语义概括出英文短名。
2. 若超过 18 个字符，优先缩写长单词。
3. 若超过 5 个单词，继续压缩为更短短语。
4. 若与 `输出目录` 下已有目录冲突，追加最短数字后缀。

可接受示例：
- `创建术语` -> `term-glossary`
- `总结` -> `write-summary`
- `结构化重构 Prompt (推荐用于 Obsidian)` -> `obs-note-refmt`

### 7. 生成目标 `SKILL.md`
输出路径固定为：

```text
<输出目录>/<英文短目录名>/SKILL.md
```

目标 `SKILL.md` 必须符合通用 skill 规范，至少包含：

```yaml
---
name: <原 prompt 文件名，不含 .md>
description: <中文触发描述>
---
```

正文必须改写为 agent 友好的 skill，而不是简单复制原 prompt。正文至少覆盖：
- 目标
- 适用场景
- 输入要求
- 输出要求
- 执行步骤
- 注意事项

## 改写要求
把 prompt 从“对话式命令”改写成“可复用技能说明”：
- 将隐含前提显式化
- 将输出格式要求整理成条目
- 将 prompt 中的步骤重组为稳定执行顺序
- 对占位符如 `{}`、`{activeNote}`，说明它们代表的输入上下文

如果原 prompt 很短，也不要只复制一句原文；至少补足：
- 该 skill 在什么情况下触发
- 输入材料来自哪里
- 输出应满足什么格式约束

## 示例
### 示例 1：单文件输入
输入：

```text
@F:\Documents\Repertory\Sieyuan\nebula\.cursor\mySkills\map-prompt2skill\SKILL.md 
源路径: F:\Documents\Obsidian Vault\copilot\copilot-custom-prompts\创建术语.md
输出目录: F:\Documents\Repertory\Sieyuan\nebula\.cursor\mySkills\generated
```

应执行：
- 读取 `创建术语.md`
- 生成一个独立目录，例如 `term-glossary`
- 写入 `generated\term-glossary\SKILL.md`

生成结果的 frontmatter 应类似：

```yaml
---
name: 创建术语
description: 当需要从文本材料中提取重要术语、概念和短语，并输出按字母排序的词汇表时使用。
---
```

### 示例 2：目录输入
输入：

```text
@F:\Documents\Repertory\Sieyuan\nebula\.cursor\mySkills\map-prompt2skill\SKILL.md 
源路径: F:\Documents\Obsidian Vault\copilot\copilot-custom-prompts
输出目录: F:\Documents\Obsidian Vault\copilot\copilot-custom-prompts-skills
```

若 `输出目录` 下已有某个 skill 的 `SKILL.md` 为：

```yaml
---
name: 创建术语
description: 当需要从文本材料中提取重要术语并生成词汇表时使用。
---
```

则应执行：
- 先遍历 `generated` 下所有子目录中的 `SKILL.md`
- 识别 `name: 创建术语` 已存在
- 跳过 `创建术语.md`
- 转换剩余未沉淀的 prompt

## 注意事项
- 不要为每个转换结果额外生成 `README.md`
- 不要把目录名当作 skill 的逻辑标识，真正的去重标识是 frontmatter `name`
- 不要让 `description` 变成长摘要
- 不要输出不符合命名规则的目录名
- 如果原 prompt 包含特定格式要求，必须在目标 skill 中保留这些格式约束
