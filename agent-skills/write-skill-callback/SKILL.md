---
name: 写skill
description: 当需要基于通用TDD方法编写、改造或标准化一个中文skill，并同时交付README、SKILL、template、assets、references与验证材料时使用。
---

# 目标
基于 `writing-skills` 的通用 TDD 主线，产出适合中文仓库长期复用、同时兼顾“给人看”和“给 agent 用”的标准 skill 套件。

## 与 writing-skills 的关系
- 本 skill 继承 `writing-skills` 的核心方法论，不替代它。
- 保留 failing test、`RED -> GREEN -> REFACTOR`、触发描述优化、漏洞补洞。
- 额外增加固定交付结构：`README.md`、`SKILL.md`、`template/`、`assets/`、`references/`、`evals/`。

## 何时使用
- 需要从 0 新建一个中文 skill。
- 需要把只有 `SKILL.md` 的旧 skill 改造成完整套件。
- 需要统一 skill 的文档结构、模板资产和触发测试方式。

## 何时不要使用
- 只是想临时写一段一次性 prompt，不打算沉淀为 skill。
- 只是想补一个很短的说明注释，不需要完整交付结构。

## 输入契约
调用本 skill 时，至少提供：
- `目标目录`
- `skill 主题`
- `主要触发场景`

如已有旧 skill，还应提供：
- 现有 `SKILL.md` 路径
- 已知失败案例或误触发案例

## RED：先做 failing test / baseline
1. 在编写新 skill 之前，先记录“没有该 skill 时 agent 会怎么失败”。
2. 至少收集以下信息：
   - 用户会怎么提需求
   - agent 会漏掉什么
   - agent 会用什么借口跳过关键步骤
   - 哪些输出格式经常不稳定
3. 将这些失败表现整理为：
   - should-trigger 用例
   - should-not-trigger 用例
   - 常见漏洞与 red flags

如果没有看过失败基线，不要直接写 skill。

## GREEN：生成最小可用 skill 套件
先产出最小可用结构：

```text
<skill-dir>/
├── README.md
├── SKILL.md
├── template/
├── assets/
├── references/
└── evals/
```

然后按以下顺序写内容：
1. 写 `SKILL.md`：只放每次激活都必须看到的核心规则。
   - `frontmatter.name` 必须是中文 skill 名，不允许直接写英文目录名、拼音或英文占位符。
   - `frontmatter.description` 必须是中文触发描述，不允许使用 `Use when ...` 这类英文句式。
   - 如果目标 skill 面向中文仓库，frontmatter 也视为正文的一部分，必须中文化。
   - 主 `SKILL.md` 只保留触发条件、核心流程、硬约束、关键决策表。
   - 大段示例、前后文件、迁移清单不要堆在主文件正文，统一下沉到 `[[template/]]` 或 `[[references/]]`。
2. 写 `README.md`：补充给维护者看的说明，并声明本次使用的 frontmatter 模式。
3. 写 `template/`：提供给人类评审和仿写的完整示例。
   - 新建型任务：直接提供完整新增示例。
   - 更新型任务：必须提供 `[[template/before]]` / `[[template/after]]`，必要时用 `[[template/mvp]]` / `[[template/snapshot]]`。
4. 写 `assets/`：只放给 agent 按需读取的素材。
   - 至少包含 `[[assets/frontmatter-template.yaml]]`
   - 至少包含 `[[assets/few-shot-example]]`
   - 至少包含 1 份 agent 侧辅助文档，如 `[[assets/skill-output-checklist.md]]`
5. 写 `references/`：放长篇方法论、规范解释、设计理由和边界讨论。
6. 写 `evals/`：定义触发测试和输出验收样例。

## frontmatter 双模式
默认使用“本地中文模式”：
- `name` 用中文
- `description` 用中文触发描述

只有在用户明确要求“对外分享 / 规范校验 / 兼容通用 Agent Skills 生态”时，才切换到“对外兼容模式”：
- `name` 用英文 slug
- `description` 用规范兼容描述

无论用哪种模式，都必须在 `README.md` 中声明本次采用的是哪一种模式。

## REFACTOR：补漏洞、补触发词、补反例
1. 如果测试时发现 agent 仍然跳步，就把跳步条件写入清单或 red flags。
2. 如果 skill 被误触发，收紧 `description` 和适用场景。
3. 如果 skill 不触发，补充更贴近用户意图的关键词和场景描述。
4. 如果输出结构不稳定，就把给人看的前后示例固化到 `[[template/]]`，把给 agent 的辅助素材固化到 `[[assets/]]`，不要只用文字描述。
5. 交付前按 `[[assets/skill-output-checklist.md]]` 做结构自检；Markdown 标题空行、H1 策略和 frontmatter 文档标题规则统一参考 `[[references/markdown-format-rules.md]]`。

## 固定输出结构
最终交付至少包含：
- `README.md`
- `SKILL.md`
- `template/`
- `assets/frontmatter-template.yaml`
- `assets/few-shot-example/README.md`
- `assets/few-shot-example/SKILL.md`
- `assets/skill-output-checklist.md`
- `references/writing-skills-core.md`
- `evals/evals.json`

## 质量检查清单
- [ ] `SKILL.md` frontmatter 至少有 `name`、`description`
- [ ] `SKILL.md` 的 `name`、`description` 都是中文，不允许英文成品或英文占位
- [ ] 已在 `README.md` 中声明本次采用“本地中文模式”或“对外兼容模式”
- [ ] `SKILL.md` 中保留 `RED`、`GREEN`、`REFACTOR`
- [ ] `README.md` 与 `SKILL.md` 都包含使用示例
- [ ] 存在 `template/`，且内容与任务类型匹配
- [ ] `assets/` 只放 agent 素材
- [ ] 长说明已下沉到 `references/`
- [ ] 主 `SKILL.md` 未承载大段示例正文
- [ ] 内部支持文件引用优先使用双链，如 `[[template/README.md]]`
- [ ] `evals/evals.json` 覆盖 should-trigger 与 should-not-trigger
- [ ] 全部主体文案使用简体中文，只有术语保留英文

## 验证要求
1. 先验证 skill 会不会被触发：
   - 每条 should-trigger / should-not-trigger 用例建议运行 3 次
   - 观察触发率是否稳定
2. 再验证输出质量：
   - 是否生成固定目录结构
   - 是否正确区分 `template/` 与 `assets/`
   - 是否包含可仿写的 few-shot 成品
3. 若验证失败：
   - 修正文案、模板或清单
   - 重新运行验证

## 使用示例
### 示例 1：创建新 skill

```text
使用 $write-skill 为“多仓库发布说明编写”创建一个中文 skill，
目标目录为 F:\Documents\Repertory\Sieyuan\nebula\.cursor\mySkills\release-note-skill
```

### 示例 2：改造旧 skill

```text
使用 $write-skill 把 F:\Documents\Repertory\Sieyuan\nebula\.cursor\mySkills\legacy-skill
从单文件结构升级为包含 template、assets、references、evals 的完整 skill 套件，
并提供 [[template/before]] / [[template/after]] 对照
```

## 常见错误
- 还没观察失败基线就直接写 skill
- frontmatter 只把正文写成中文，却把 `name`、`description` 留成英文
- 只写 `SKILL.md`，不补 `README.md`、`template/` 和 agent 素材
- 把全部理论塞进主 `SKILL.md`，导致激活后上下文过重
- 把给人看的示例和给 agent 的素材混在同一层目录
- 没有 should-not-trigger 用例，导致误触发长期存在
- few-shot 只有空骨架，没有完整成品
