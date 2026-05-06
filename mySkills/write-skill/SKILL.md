---
name: 写skill
description: 当需要基于通用TDD方法编写、改造或标准化一个中文skill，并同时交付README、SKILL、assets与验证材料时使用。
---

# 目标
基于 `writing-skills` 的通用 TDD 主线，产出适合中文仓库长期复用的标准 skill 套件。

## 与 writing-skills 的关系
- 本 skill 继承 `writing-skills` 的核心方法论，不替代它。
- 保留 failing test、`RED -> GREEN -> REFACTOR`、触发描述优化、漏洞补洞。
- 额外增加固定交付结构：`README.md`、`SKILL.md`、`assets/`、`references/`、`evals/`。

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
├── assets/
├── references/
└── evals/
```

然后按以下顺序写内容：
1. 写 `SKILL.md`：只放每次激活都必须看到的核心规则。
2. 写 `README.md`：补充给维护者看的说明。
3. 写 `assets/`：提供空模板和完整 few-shot 示例。
4. 写 `references/`：放长篇方法论或补充说明。
5. 写 `evals/`：定义触发测试和输出验收样例。

## REFACTOR：补漏洞、补触发词、补反例
1. 如果测试时发现 agent 仍然跳步，就把跳步条件写入清单或 red flags。
2. 如果 skill 被误触发，收紧 `description` 和适用场景。
3. 如果 skill 不触发，补充更贴近用户意图的关键词和场景描述。
4. 如果输出结构不稳定，就把模板固化到 `assets/`，不要只用文字描述。

## 固定输出结构
最终交付至少包含：
- `README.md`
- `SKILL.md`
- `assets/README-template.md`
- `assets/SKILL-template.md`
- `assets/frontmatter-template.yaml`
- `assets/few-shot-example/README.md`
- `assets/few-shot-example/SKILL.md`
- `references/writing-skills-core.md`
- `evals/evals.json`

## 质量检查清单
- [ ] `SKILL.md` frontmatter 至少有 `name`、`description`
- [ ] `SKILL.md` 中保留 `RED`、`GREEN`、`REFACTOR`
- [ ] `README.md` 与 `SKILL.md` 都包含使用示例
- [ ] `assets/` 同时提供空模板和完整 few-shot 示例
- [ ] 长说明已下沉到 `references/`
- [ ] `evals/evals.json` 覆盖 should-trigger 与 should-not-trigger
- [ ] 全部主体文案使用简体中文，只有术语保留英文

## 验证要求
1. 先验证 skill 会不会被触发：
   - 每条 should-trigger / should-not-trigger 用例建议运行 3 次
   - 观察触发率是否稳定
2. 再验证输出质量：
   - 是否生成固定目录结构
   - 是否包含模板资产
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
从单文件结构升级为包含 assets、references、evals 的完整 skill 套件
```

## 常见错误
- 还没观察失败基线就直接写 skill
- 只写 `SKILL.md`，不补 `README.md` 和模板资源
- 把全部理论塞进主 `SKILL.md`，导致激活后上下文过重
- 没有 should-not-trigger 用例，导致误触发长期存在
- few-shot 只有空骨架，没有完整成品
