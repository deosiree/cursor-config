# OpenCode 会话摘要（hS81vFai）

> 来源：[https://opncd.ai/share/hS81vFai](https://opncd.ai/share/hS81vFai) · session `ses_1b551f84effePMZzXchS81vFai`  
> 用途：记录本 skill 套件的设计决策链，供后续改造对齐；非用户-facing few-shot 正文。

## 会话目标

将 MCP / Function Calling / SDK / Skill / gRPC 等技术 QA 讨论，沉淀为**面经风格**知识文档，并抽象可复用的 skill 编排（后演化为 `QA转面经` 套件）。

## 关键决策

| 决策 | 结论 |
|------|------|
| 参考结构 | 行文结构入库为 `面试钩子-对比递进-答题收束`（非领域命名） |
| 与播客 skill 关系 | 产出仍为静态面经 `.md`；N/K、doc_type 与 `文档转播客` 对齐，但不内嵌 TTS/双人稿流程 |
| N / K | `K = min(max(3, N), 7)`，卷尾快问快答与「面试追问预测」对齐 |
| doc_type | 面经 / 教程 / 技术方案 / 参考 → 决定开场钩子 |
| N>7 | 检查点 A：合并 / 拆篇 / 用户确认继续 |
| 学习方法论 | `references/方法论库/SKILL.md` + `references/` 子文件 |
| 成功案例 | 拓展 MCP 全景对比文 → `template/snapshot/成功案例-MCP工具调用全景对比.md` |
| 质量迭代 | write-skill 分层 + Darwin 受控试跑（evaluate → trial → keep/revert） |

## 产物线索（会话内路径）

- 鹅厂 MCP vs Function Calling 面经（Obsidian `Agent面经/MCP/`）
- 拓展文：MCP 与 SDK、Skill、gRPC、传输选型全景对比

## 与本轮 skill 优化的对应

- 新增 `分析-QA体量与doc_type`（步骤 1.5）
- 编排步骤 6：经验贴交付后**询问**是否联动 `文档转播客`，播客落同 stem 目录
- 共用契约：`.cursor/_shared/references/技术文档-NK与doc_type契约.md`
