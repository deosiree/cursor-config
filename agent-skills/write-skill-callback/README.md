# write-skill

## 定位
`write-skill` 是一个面向中文仓库的 meta-skill，用来编写、改造和标准化新的 skill 套件。

它继承 [`writing-skills`](C:\Users\Administrator\.agents\skills\writing-skills\SKILL.md) 的通用 TDD 主线，不替代其方法论；它额外解决的是中文团队常见的交付不一致问题：有的人只写 `SKILL.md`，有的人缺少说明文档，有的人没有模板资产和验证材料。

## 与 writing-skills 的关系
- `writing-skills` 负责通用方法论：先看失败基线，再写 skill，再补漏洞。
- `write-skill` 负责中文落地：固定目录结构、双层资源分工、few-shot 样例、触发测试与输出验收。

换言之，`write-skill` 是 `writing-skills` 的中文增强交付版，而不是另一套新理论。

## 固定目录结构
使用本 skill 产出的目标 skill，默认按下列结构组织：

```text
<skill-dir>/
├── README.md
├── SKILL.md
├── template/
├── assets/
│   ├── frontmatter-template.yaml
│   ├── skill-output-checklist.md
│   └── few-shot-example/
│       ├── README.md
│       └── SKILL.md
├── references/
│   └── writing-skills-core.md
└── evals/
    └── evals.json
```

## 每个文件的职责
- `README.md`：给维护者读，解释 skill 定位、结构、输入输出、示例和验收方式。
- `SKILL.md`：给 agent 读，保留每次激活都需要看到的核心执行规则；主文件应尽量短，只放高频规则。
- `template/`：给人类读，放完整示例、更新示例、迁移清单、输入输出样例、`before/after`、`mvp/snapshot`。
- `assets/`：给 agent 读，放 frontmatter 模板、few-shot、精简 checklist、触发辅助文档。
- `references/`：放长说明和补充材料，避免主 `SKILL.md` 过重。
- `evals/`：放触发测试与输出质量测试样例。

引用支持文件时，优先使用双链：
- `[[template/README.md]]`
- `[[template/before]]`
- `[[assets/frontmatter-template.yaml]]`
- `[[references/writing-skills-core.md]]`

## frontmatter 语言约束
对于面向中文仓库长期复用的 skill：
- `SKILL.md` 的 `name` 必须是中文名称。
- `SKILL.md` 的 `description` 必须是中文触发描述。
- 不允许出现 `Use when ...`、英文目录名直接复用为 `name`、英文 few-shot 成品 frontmatter。

换句话说，frontmatter 不是例外区，它也属于需要中文化的正式交付内容。

## frontmatter 双模式
默认采用“本地中文模式”：
- `name` 用中文
- `description` 用中文触发描述

如果用户明确要求“对外分享 / 规范校验 / 兼容通用 Agent Skills 生态”，则切换到“对外兼容模式”：
- `name` 用英文 slug
- `description` 用规范兼容描述

无论采用哪种模式，都需要在目标 skill 的 `README.md` 中显式声明。

## 生成流程
1. 先做 failing test / baseline，记录没有该 skill 时 agent 会怎么失败。
2. 收集真实上下文：触发场景、失败原因、常见误判、需要固定的输出格式。
3. 编写最小可用 `SKILL.md`，只保留高频核心规则，并把大段示例下沉到 `[[template/]]` 或 `[[references/]]`。
4. 补齐 `README.md`、`template/`、`assets/`、`references/`、`evals/`。
5. 设计 should-trigger 与 should-not-trigger 用例，验证 skill 是否会被稳定触发。
6. 根据测试中暴露的新漏洞继续 REFACTOR。

## 格式约束的放置方式
`write-skill` 的主任务是沉淀 skill 套件，不是承载整套 Markdown 规范。

因此：
- 主 `SKILL.md` 只保留一个简短入口和交付前自检提醒
- 具体 Markdown 结构规则下沉到 `[[references/markdown-format-rules.md]]`
- 最终收尾检查放在 `[[assets/skill-output-checklist.md]]`

这样后续如果要继续扩展 Markdown 格式规则，不需要持续膨胀主 `SKILL.md`。

## 为什么使用 `template + assets`
官方通用规范强调的是 supporting files，而不是强制所有资源都必须放进 `assets/`。

当前仓库选择：
- `template/` 负责给人类看
- `assets/` 负责给 agent 看

这样更适合中文知识库里“人类评审 + agent 执行”的双重使用场景，也更贴近你们现有的 `before/after`、`mvp/snapshot`、迁移清单实践。

## 验收清单
- 存在 `README.md`、`SKILL.md`、`template/`、`assets/`
- `SKILL.md` frontmatter 至少包含 `name`、`description`
- `SKILL.md` 的 `name`、`description` 为中文正式文案，不是英文模板或英文成品
- 已声明采用“本地中文模式”或“对外兼容模式”
- `SKILL.md` 保留 `RED`、`GREEN`、`REFACTOR`
- `README.md` 与 `SKILL.md` 都包含使用示例
- `template/` 中有与任务类型匹配的示例
- `assets/` 中有 frontmatter 模板、few-shot、agent 辅助文档
- `references/` 有长说明，不把所有理论都塞进主 `SKILL.md`
- 主 `SKILL.md` 不承载大段示例正文
- 文内对支持文件的引用优先使用双链
- `evals/evals.json` 同时覆盖 should-trigger 与 should-not-trigger

## 使用示例
### 示例 1：从 0 新建一个 skill

```text
使用 $write-skill 为“前端接口联调记录”设计一个中文 skill，目标目录为
F:\Documents\Repertory\Sieyuan\nebula\.cursor\mySkills\api-debug-log
```

预期行为：
- 先要求整理失败基线与触发场景
- 再生成 `README.md`、`SKILL.md`、`template/`、`assets/`、`references/`、`evals/`
- 产出的 `SKILL.md` 保留 TDD 主线

### 示例 2：把单文件 skill 改造成规范套件

```text
使用 $write-skill 把
F:\Documents\Repertory\Sieyuan\nebula\.cursor\mySkills\legacy-skill
从只有 SKILL.md 的形式改造成 README + SKILL + template + assets + evals 结构，
并提供 [[template/before]] / [[template/after]] 对照
```

预期行为：
- 先识别原 skill 缺失的资源层
- 保留原有有效规则
- 补齐说明文档、前后示例、few-shot 样例和触发测试

## 注意事项
- 不要把 `writing-skills` 整篇内容原样复制到目标 `SKILL.md`
- 不要把 frontmatter 当成“可以保留英文”的特殊区域
- 不要只产出抽象模板，不给完整新增示例或前后对照
- 不要只写“如何做”，不写“何时触发”和“如何验证”
- 不要让 `description` 变成长摘要；它首先要服务于触发
- 不要把给人看的示例和给 agent 的素材混在同一层目录

## 结构自检入口
- Markdown 结构规则：`[[references/markdown-format-rules.md]]`
- 交付前检查清单：`[[assets/skill-output-checklist.md]]`
