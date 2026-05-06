# map-prompt2skill

## 目标
把 `copilot-custom-prompts` 一类以 Markdown 保存的 prompt，沉淀为更适合 agent 直接调用的标准 skill。

这个 skill 解决两个问题：
- 单个 prompt 只能作为文本片段复用，缺少标准 skill 的触发描述和执行结构。
- 一批 prompt 反复人工迁移成本高，且容易重复生成。

## 输入契约
调用时必须显式提供两个输入：
- `源路径`：可以是单个 `.md` 文件，也可以是目录。
- `输出目录`：生成 skill 的目标目录。

## 工作模式
### 文件模式
当 `源路径` 是单个 Markdown 文件时，只转换这一个 prompt。

### 目录模式
当 `源路径` 是目录时，先遍历 `输出目录` 下已有 skill：
- 只识别各子目录中的 `SKILL.md`
- 读取 frontmatter 里的 `name`
- 用 `name` 与 prompt 原文件名（不含 `.md`）比对
- 已存在的跳过，仅转换未沉淀的 prompt

## 生成规则
### 生成结果
每个 prompt 生成一个独立 skill 目录：

```text
<输出目录>/<英文短目录名>/SKILL.md
```

### 生成 skill 的 frontmatter
- `name`：固定为 prompt 原文件名，不含 `.md`
- `description`：用中文描述“何时使用”，不要复述完整流程

### 目录命名规则
- 必须使用英文
- 使用 `-` 分隔单词
- 最多 5 个单词
- 整体尽量不超过 18 个字符
- 如果名称过长，优先缩写单词
- 如果与现有目录重名，追加最短数字后缀保证唯一

## 转写要求
生成出的 `SKILL.md` 需要把原 prompt 改写成 agent 更易执行的技能说明，至少包含：
- 适用场景
- 输入要求
- 输出要求
- 执行步骤
- 注意事项

## 示例
### 示例 1：单文件转换
输入：

```text
源路径: F:\Documents\Obsidian Vault\copilot\copilot-custom-prompts\创建术语.md
输出目录: F:\Documents\Repertory\Sieyuan\nebula\.cursor\mySkills\generated
```

预期行为：
- 只处理 `创建术语.md`
- 生成一个新子目录，例如 `term-glossary`
- 在 `term-glossary\SKILL.md` 中写入标准 skill 内容
- frontmatter 中的 `name` 为 `创建术语`

### 示例 2：目录批量转换
输入：

```text
源路径: F:\Documents\Obsidian Vault\copilot\copilot-custom-prompts
输出目录: F:\Documents\Repertory\Sieyuan\nebula\.cursor\mySkills\generated
```

假设 `输出目录` 中已有某个 skill 的 `SKILL.md` 包含：

```yaml
---
name: 创建术语
description: 当需要从材料中提取重要术语并输出词汇表时使用。
---
```

预期行为：
- 遍历 prompt 目录下所有 `.md`
- 跳过 `创建术语.md`
- 仅转换其余尚未沉淀为 skill 的 prompt

## 边界处理
- prompt 文件名可以保留中文、数字、括号等原样作为 `name`
- 目录名必须转为英文短名
- 如果多个 prompt 生成相同英文目录名，后处理必须稳定避冲突
- 如果 prompt 自带 frontmatter，只读取为上下文，不直接照搬为 skill frontmatter
