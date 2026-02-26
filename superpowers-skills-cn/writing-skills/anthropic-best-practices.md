这份文档为您翻译成了中文版 Markdown，保留了原始的结构、代码块以及排版规范。

------

# Skill（技能）编写最佳实践

> 了解如何编写能够被 Claude 成功发现并高效使用的 Skill。

优秀的 Skill 应具备简洁、结构清晰以及经过实际使用测试的特点。本指南提供了实用的编写决策，旨在帮助您编写 Claude 能够有效发现并执行的 Skill。

关于 Skill 工作原理的概念背景，请参阅  [Skills overview](/en/docs/agents-and-tools/agent-skills/overview)。

## 核心原则

### 简洁是关键

[上下文窗口](https://platform.claude.com/docs/en/build-with-claude/context-windows) 是一项公共资源。您的 Skill 会与 Claude 需要了解的其他所有内容共享上下文窗口，包括：

- 系统提示词（System Prompt）
- 对话历史
- 其他 Skill 的元数据
- 您实际的请求内容

并非 Skill 中的每一个 Token 都会产生即时成本。启动时，仅预加载所有 Skill 的元数据（名称和描述）。Claude 仅在 Skill 变得相关时才会读取 `SKILL.md`，并仅在需要时读取其他文件。然而，在 `SKILL.md` 中保持简洁依然很重要：一旦 Claude 加载了它，其中的每一个 Token 都会与对话历史和其他上下文产生竞争。

**默认假设**：Claude 已经非常聪明了。

仅添加 Claude 尚未掌握的上下文。质疑每一条信息：

- “Claude 真的需要这个解释吗？”
- “我可以假设 Claude 已经知道这一点吗？”
- “这段文字值得消耗这些 Token 吗？”

**正例：简洁**（约 50 个 Token）：

```
## Extract PDF text

Use pdfplumber for text extraction:

​```python
import pdfplumber

with pdfplumber.open("file.pdf") as pdf:
    text = pdf.pages[0].extract_text()
```

**反例：太啰嗦**（约 150 个 Token）：

```
## Extract PDF text

PDF (Portable Document Format) files are a common file format that contains
text, images, and other content. To extract text from a PDF, you'll need to
use a library. There are many libraries available for PDF processing, but we
recommend pdfplumber because it's easy to use and handles most cases well.
First, you'll need to install it using pip. Then you can use the code below...
```

简洁版假设 Claude 知道 PDF 是什么以及库的工作原理。

### 设置适当的自由度

将指令的精确程度与任务的脆弱性和可变性相匹配。

**高自由度**（基于文本的指令）：

适用于：

- 多种方法均有效
- 决策取决于具体上下文
- 由启发式准则（Heuristics）指导方法

示例：

```
## Code review process

1. Analyze the code structure and organization
2. Check for potential bugs or edge cases
3. Suggest improvements for readability and maintainability
4. Verify adherence to project conventions
```

**中等自由度**（带参数的伪代码或脚本）：

适用于：

- 存在首选模式
- 允许一定的变化
- 配置会影响行为

示例：

```
## Generate report

Use this template and customize as needed:
```

```python
def generate_report(data, format="markdown", include_charts=True):
    # Process data
    # Generate output in specified format
    # Optionally include visualizations
```

**低自由度**（特定脚本，少量或无参数）：

适用于：

- 操作脆弱且容易出错
- 一致性至关重要
- 必须遵循特定序列

示例：

```
## Database migration

Run exactly this script:
```

```bash
python scripts/migrate.py --verify --backup
```

不要修改命令或添加其他标志。

**类比**：将 Claude 想象成一个在路径上探索的机器人：

- **两边都是悬崖的狭窄桥梁**：只有一条安全的前行道路。提供具体的护栏和确切的指令（低自由度）。例如：必须按精确顺序运行的数据库迁移。
- **没有障碍的开阔地带**：条条大路通罗马。给出大概方向，信任 Claude 能找到最佳路线（高自由度）。例如：上下文决定最佳方法的代码审查。

### 测试您计划使用的所有模型

Skill 是对模型的补充，因此其有效性取决于底层模型。请在您计划使用的所有模型上测试您的 Skill。

**不同模型的测试重点**：

- **Claude Haiku**（快速、经济）：Skill 是否提供了足够的引导？
- **Claude Sonnet**（平衡）：Skill 是否清晰且高效？
- **Claude Opus**（强大的推理能力）：Skill 是否避免了过度解释？

在 Opus 上表现完美的 Skill 可能需要在 Haiku 上增加更多细节。如果您计划跨模型使用 Skill，请力求编写在所有模型上都能良好运作的指令。

------

## Skill 结构

> **YAML Frontmatter**：`SKILL.md` 的前置配置支持两个字段：
>
> - `name` - Skill 的易读名称（最多 64 个字符）
> - `description` - 关于 Skill 的功能及使用时机的一行描述（最多 1024 个字符）
>
> 完整的 Skill 结构详情，请参阅 。

### 命名规范

使用一致的命名模式，使 Skill 易于引用和讨论。我们建议使用 **动名词形式**（动词 + ing）作为 Skill 名称，因为这能清晰地描述 Skill 提供的活动或能力。

**优秀的命名示例（动名词形式）**：

- "Processing PDFs"（处理 PDF）
- "Analyzing spreadsheets"（分析电子表格）
- "Managing databases"（管理数据库）
- "Testing code"（测试代码）
- "Writing documentation"（编写文档）

**可接受的替代方案**：

- 名词短语："PDF Processing", "Spreadsheet Analysis"
- 行动导向型："Process PDFs", "Analyze Spreadsheets"

**应避免**：

- 模糊的名称："Helper", "Utils", "Tools"
- 过于笼统："Documents", "Data", "Files"
- Skill 集合内部命名模式不一致

### 编写有效的描述

`description` 字段支持 Skill 的发现，应包含 **Skill 的功能** 以及 **何时使用它**。

> **警告：始终使用第三人称编写**。描述会被注入到系统提示词中，不一致的视角会导致发现问题。
>
> - **正确示例：** "Processes Excel files and generates reports"
> - **应避免：** "I can help you process Excel files"
> - **应避免：** "You can use this to process Excel files"

**要具体并包含关键词**。描述是 Skill 选择的关键：Claude 利用它从可能存在的 100 多个 Skill 中选出正确的一个。

有效示例：

**PDF 处理 Skill：**

描述：从 PDF 文件中提取文本和表格、填写表格、合并文档。在处理 PDF 文件或用户提及 PDF、表单或文档提取时使用。

**Excel Analysis skill:**

```yaml  theme={null}
描述：分析 Excel 电子表格、创建数据透视表、生成图表。在分析 Excel 文件、电子表格、表格数据或 .xlsx 文件时使用。
```

**Git Commit Helper skill:**

```yaml  theme={null}
描述：通过分析 git diff 生成描述性提交消息。当用户请求帮助编写提交消息或查看分阶段更改时使用。
```

避免诸如此类的模糊描述：

```yaml  theme={null}
描述：帮助处理文档
```

```yaml  theme={null}
描述：处理数据
```

```yaml  theme={null}
描述：处理文件
```

### 渐进式披露模式

`SKILL.md` 充当概览，根据需要引导 Claude 查阅详细资料，就像入职指南中的目录一样。

**实践指导：**

- 保持 `SKILL.md` 正文在 **500 行以内** 以获得最佳性能。
- 接近此限制时，将内容拆分为独立文件。
- 使用以下模式组织指令、代码和资源。

#### 视觉概述：从简单到复杂

基本技能从包含元数据和说明的 SKILL.md 文件开始：

![Simple SKILL.md file showing YAML frontmatter and markdown body](https://mintcdn.com/anthropic-claude-docs/4Bny2bjzuGBK7o00/images/agent-skills-simple-file.png?fit=max&auto=format&n=4Bny2bjzuGBK7o00&q=85&s=87782ff239b297d9a9e8e1b72ed72db9)

随着您的技能增长，您可以捆绑克劳德仅在需要时加载的其他内容：

![Bundling additional reference files like reference.md and forms.md.](https://mintcdn.com/anthropic-claude-docs/4Bny2bjzuGBK7o00/images/agent-skills-bundling-content.png?fit=max&auto=format&n=4Bny2bjzuGBK7o00&q=85&s=a5e0aa41e3d53985a7e3e43668a33ea3)

完整的 Skill 目录结构可能如下所示：

```
pdf/
├── SKILL.md 			# 主要指令（触发时加载）
├── FORMS.md 			# 填表指南（按需加载）
├──	reference.md 		# API参考（根据需要加载）
├── Examples.md 		# 使用示例（根据需要加载）
└── scripts/
    ├──	analyze_form.py # 实用脚本（执行，未加载）
    ├── fill_form.py 	# 表单填写脚本
    └── validate.py 	# 验证脚本
```

#### 模式 1：带参考资料的高级指南

Claude 仅在需要时加载引用的 `FORMS.md`、`REFERENCE.md` 或 `EXAMPLES.md`。

```
---
name: PDF Processing
description: Extracts text and tables from PDF files, fills forms, and merges documents. Use when working with PDF files or when the user mentions PDFs, forms, or document extraction.
---

# PDF Processing

## Quick start

Extract text with pdfplumber:
​```python
import pdfplumber
with pdfplumber.open("file.pdf") as pdf:
    text = pdf.pages[0].extract_text()
```

#### 模式 2：特定领域组织

对于具有多个领域的 Skill，按领域组织内容，以避免加载不相关的上下文。例如，用户询问销售指标时，Claude 只需阅读销售相关的 Schema，而无需读取财务或营销数据。

```
bigquery-skill/
├── SKILL.md (overview and navigation)
└── reference/
    ├── finance.md (revenue, billing metrics)
    ├── sales.md (opportunities, pipeline)
    ├── product.md (API usage, features)
    └── marketing.md (campaigns, attribution)

​````markdown SKILL.md theme={null}
```

```
# BigQuery Data Analysis

## Available datasets

**Finance**: Revenue, ARR, billing → See [reference/finance.md](reference/finance.md)
**Sales**: Opportunities, pipeline, accounts → See [reference/sales.md](reference/sales.md)
**Product**: API usage, features, adoption → See [reference/product.md](reference/product.md)
**Marketing**: Campaigns, attribution, email → See [reference/marketing.md](reference/marketing.md)

## Quick search

使用 grep 查找特定指标：

​```bash
grep -i "revenue" reference/finance.md
grep -i "pipeline" reference/sales.md
grep -i "api usage" reference/product.md
```



#### 模式 3：条件性细节

展示基础内容，链接到高级内容。Claude 只有在用户需要相关功能时才会读取详细文件。

### 避免深层嵌套引用

当一个引用文件又引用另一个文件时，Claude 可能会部分读取。这可能导致 Claude 使用 `head -100` 之类的命令预览内容，从而导致信息获取不完整。

**保持引用距离 `SKILL.md` 仅一级深度**。

### 为较长的参考文件构建目录

对于超过 100 行的参考文件，请在顶部包含 **目录**。这确保 Claude 即使在部分读取预览时也能看到可用信息的全貌。

------

## 工作流与反馈循环

### 为复杂任务使用工作流

将复杂操作分解为清晰、连续的步骤。对于特别复杂的流程，提供一个 Claude 可以复制并逐步核对的 **清单（Checklist）**。

### 实现反馈循环

**常用模式**：运行校验器 → 修复错误 → 重复。

这种模式能显著提升输出质量。例如，在编辑文档后立即运行验证脚本，只有通过验证后才继续下一步。

------

## 内容指南

### 避免时效性信息

不要包含会过期的信息。对于旧版本内容，可以使用 `<details>` 标签包裹在“旧模式（Old patterns）”部分中。

### 使用一致的术语

在整个 Skill 中选择一个术语并坚持使用（例如：始终使用 "API endpoint" 而不是混用 "URL" 或 "route"）。

------

## 通用模式

### 模板模式 (Template Pattern)

为输出格式提供模板。对于 API 响应等严格要求，使用“始终使用此精确模板”；对于灵活引导，使用“这是一个合理的默认格式”。

### 示例模式 (Examples Pattern)

提供输入/输出对（Input/Output pairs）。示例比单纯的描述更能让 Claude 理解所需的风格和细节深度。

------

## 评估与迭代

### 先构建评估 (Build evaluations first)

在编写大量文档之前，先创建评估。这确保您的 Skill 是在解决真实问题。

1. **识别差距**：在没有 Skill 的情况下运行 Claude，记录失败之处。
2. **创建评估**：构建三个测试这些差距的场景。
3. **编写最小化指令**：仅创建足以通过评估的内容。

### 与 Claude 协同迭代开发 Skill

最有效的开发流程涉及两个 Claude 实例：

- **Claude A（专家）**：帮助您设计和精炼指令。
- **Claude B（代理）**：在实际任务中测试这些指令。

------

## 反模式（应避免）

### 避免 Windows 风格路径

始终使用 **正斜杠**（`/`）。Unix 风格路径在所有平台上都能工作，而反斜杠在 Unix 系统上会导致错误。

### 避免提供过多选项

除非必要，否则不要提供多种方法。**提供一个默认方案**并附带备选方案。

------

## 进阶：带有可执行代码的 Skill

### 解决问题，不要推卸（Solve, don't punt）

编写脚本时，应处理错误情况，而不是将其丢给 Claude 处理。

- **正例**：在脚本中捕获 `FileNotFoundError` 并创建默认文件或打印清晰提示。
- **避免“巫术常量”**：为脚本中的超时或重试次数提供理由注释。

### 提供实用脚本

即使 Claude 能写代码，预置脚本也更可靠、更节省 Token、更快速且更具一致性。

### 使用视觉分析

当输入可以渲染为图像时（如 PDF 页面），让 Claude 视觉化分析布局，这有助于理解复杂的表单结构。

### 创建可验证的中间输出

采用 **计划-验证-执行** 模式。例如，在批量更新 50 个表单字段前，先生成一个 `changes.json` 计划文件，由脚本验证无误后再执行修改。

### MCP 工具引用

如果使用 MCP 工具，请始终使用 **完全限定工具名**：`服务器名称:工具名称`（例如 `GitHub:create_issue`）。

------

## 有效 Skill 检查清单

在分享 Skill 之前，请验证：

**核心质量：**

- [ ] 描述具体且包含关键词。
- [ ] `SKILL.md` 正文在 500 行以内。
- [ ] 术语一致，示例具体。
- [ ] 引用深度为一级。

**代码与脚本：**

- [ ] 脚本主动处理错误而非报错中断。
- [ ] 无 Windows 风格路径。
- [ ] 对关键操作有校验步骤。

**测试：**

- [ ] 至少创建了三个评估案例。
- [ ] 在不同模型（Haiku, Sonnet, Opus）上进行了测试。

------

## 后续步骤

- **快速开始**：创建您的第一个 Skill。
- **在 Claude Code 中使用**：管理您的本地开发 Skill。
- **通过 API 使用**：以编程方式上传和使用 Skill。