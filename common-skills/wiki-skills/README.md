# Wiki Skills — Obsidian 知识库自动维护技能

> 反重力（Antigravity）风格的 Obsidian Wiki 方法论两件套。
> AI 自动将笔记整理成维基百科式的结构化知识库，无需手动管理目录结构。

---

## 📦 内容

| 子仓库 | 来源 | 定位 |
|--------|------|------|
| `wikify/` | [Misaka16384/Wikify](https://github.com/Misaka16384/Wikify) | 学术文献深度编译流水线 |
| `claude-wiki-verbs/` | [daniel8824-del/claude-wiki-verbs](https://github.com/daniel8824-del/claude-wiki-verbs) | 通用知识管理 9 动词引擎 |

两个 submodule 通过 `.cursor` 子模块管理，推送主仓库时只会推送 submodule 指针（commit hash），不影响各自独立更新。

---

## 🤔 如何选择

### 场景一：处理学术论文 / 技术文献 → 用 **Wikify**

适合需要摄入 PDF/LaTeX、提取定理公式、构建概念图谱的严肃研究场景。

| 阶段 | 命令 | 作用 |
|------|------|------|
| 基建 | `/wiki_hub_init` / `/wiki_init` | 创建研究主题工作区 |
| 摄入 | `/wiki_ingest` / `/wiki_ingest_ocr` | PDF/LaTeX → 结构化 Markdown |
| 编译 | `/wiki_compile` / `/wiki_enrich` | 提取定义/定理 → 概念卡片 |
| 链接 | `/wiki_semantic_link` | 向量嵌入自动双链 + 去重合并 |
| 标签 | `/wiki_tag_sync` | Map-Reduce 标签清洗 |
| 自愈 | `/wiki_lint` / `/wiki_graph_index` | 死链修复 + 图谱重建 |
| 问答 | `/wiki_ask` / `/wiki_audit` / `/wiki_research` | 引用级问答 + 矛盾审计 + 综述撰写 |

**依赖**：Poppler + Pandoc + pdflatex（可选）+ Ollama（本地 OCR + 向量模型）

### 场景二：日常笔记整理 / 知识检索 → 用 **claude-wiki-verbs**

适合日常阅读笔记、会议记录、博客等非学术内容的自动消化和检索。

| 动词 | 作用 | 例句 |
|------|------|------|
| **ingest** | 外部来源 → Raw + Gold 过滤 | "ingest this paper" |
| **query** | 4 层检索链（Wiki→Claude→Raw→Web）| "what do I know about X?" |
| **save** | 6 区路由 + wikilink 校验 | "save this as design note" |
| **lint** | 结构健康检查（FATAL/MAJOR/MINOR/POLISH）| "vault health check" |
| **synthesize** | 多文件 → 编译为一篇综述 | "compile everything on X" |
| **critique** | 矛盾/过时/空白检测 | "find inconsistencies" |
| **compare** | 5 维矩阵对比 | "A vs B" |
| **eli5** | 通俗解释 | "explain like I'm a student" |
| **manage** | qmd 索引更新/状态 | "reindex vault" |

**依赖**：纯 Markdown prompt（零代码依赖），qmd 可选（提供评分检索）

### 场景三：组合使用（推荐）

```
日常阅读 → claude-wiki-verbs ingest → 快速入库存
积累多了 → claude-wiki-verbs synthesize → 自动综述
遇到论文 → Wikify wiki_ingest → 深度编译
要找东西 → claude-wiki-verbs query → 4 层检索
```

---

## 🔄 更新方式

两个 submodule 各自独立更新，互不影响：

```bash
# 更新 Wikify
cd .cursor/common-skills/wiki-skills/wikify
git pull origin main

# 更新 claude-wiki-verbs
cd .cursor/common-skills/wiki-skills/claude-wiki-verbs
git pull origin main
```

---

## ⚙️ Agent 扫描机制

本目录不写路由 SKILL.md，agent 通过 `using-superpowers` 元技能的全面扫描机制自动发现两个子仓库中的 SKILL.md 文件：

- **Wikify**：`skills/wiki_xxx/SKILL.md`（15 个独立技能）
- **claude-wiki-verbs**：`skills/wiki/SKILL.md`（1 个 9 动词统一技能）

如果 agent 未自动发现，请检查 `agents.md` 中的 skill 发现路径列表是否包含 `common-skills/wiki-skills/`。
