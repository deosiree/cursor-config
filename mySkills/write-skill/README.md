# write-skill

## 定位
`write-skill` 是一个面向中文仓库的 meta-skill，用来编写、改造和标准化新的 skill 套件。

它继承 [`writing-skills`](C:\Users\Administrator\.agents\skills\writing-skills\SKILL.md) 的通用 TDD 主线，不替代其方法论；它额外解决的是中文团队常见的交付不一致问题：有的人只写 `SKILL.md`，有的人缺少说明文档，有的人没有模板资产和验证材料。

## 与 writing-skills 的关系
- `writing-skills` 负责通用方法论：先看失败基线，再写 skill，再补漏洞。
- `write-skill` 负责中文落地：固定目录结构、模板资源、few-shot 样例、触发测试与输出验收。

换言之，`write-skill` 是 `writing-skills` 的中文增强交付版，而不是另一套新理论。

## 固定目录结构
使用本 skill 产出的目标 skill，默认按下列结构组织：

```text
<skill-dir>/
├── README.md
├── SKILL.md
├── assets/
│   ├── README-template.md
│   ├── SKILL-template.md
│   ├── frontmatter-template.yaml
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
- `SKILL.md`：给 agent 读，保留每次激活都需要看到的核心执行规则。
- `assets/`：放静态模板资源和 few-shot 示例，不放脚本。
- `references/`：放长说明和补充材料，避免主 `SKILL.md` 过重。
- `evals/`：放触发测试与输出质量测试样例。

## 生成流程
1. 先做 failing test / baseline，记录没有该 skill 时 agent 会怎么失败。
2. 收集真实上下文：触发场景、失败原因、常见误判、需要固定的输出格式。
3. 编写最小可用 `SKILL.md`，只保留高频核心规则。
4. 补齐 `README.md`、`assets/`、`references/`、`evals/`。
5. 设计 should-trigger 与 should-not-trigger 用例，验证 skill 是否会被稳定触发。
6. 根据测试中暴露的新漏洞继续 REFACTOR。

## 为什么使用 assets
采用 `assets/` 而不是自定义 `template/`，是为了更贴近 Agent Skills 规范中“模板、示例、静态资源归入 assets”的组织方式，便于后续迁移、共享和复用。

## 验收清单
- 存在 `README.md`、`SKILL.md`、`assets/`
- `SKILL.md` frontmatter 至少包含 `name`、`description`
- `SKILL.md` 保留 `RED`、`GREEN`、`REFACTOR`
- `README.md` 与 `SKILL.md` 都包含使用示例
- `assets/` 同时包含空模板和完整 few-shot 示例
- `references/` 有长说明，不把所有理论都塞进主 `SKILL.md`
- `evals/evals.json` 同时覆盖 should-trigger 与 should-not-trigger

## 使用示例
### 示例 1：从 0 新建一个 skill

```text
使用 $write-skill 为“前端接口联调记录”设计一个中文 skill，目标目录为
F:\Documents\Repertory\Sieyuan\nebula\.cursor\mySkills\api-debug-log
```

预期行为：
- 先要求整理失败基线与触发场景
- 再生成 `README.md`、`SKILL.md`、`assets/`、`references/`、`evals/`
- 产出的 `SKILL.md` 保留 TDD 主线

### 示例 2：把单文件 skill 改造成规范套件

```text
使用 $write-skill 把
F:\Documents\Repertory\Sieyuan\nebula\.cursor\mySkills\legacy-skill
从只有 SKILL.md 的形式改造成 README + SKILL + assets + evals 结构
```

预期行为：
- 先识别原 skill 缺失的资源层
- 保留原有有效规则
- 补齐说明文档、few-shot 样例和触发测试

## 注意事项
- 不要把 `writing-skills` 整篇内容原样复制到目标 `SKILL.md`
- 不要只产出模板，不给完整 few-shot 成品
- 不要只写“如何做”，不写“何时触发”和“如何验证”
- 不要让 `description` 变成长摘要；它首先要服务于触发
