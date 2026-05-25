# QA转面经 操作指南

## 框架结构库

- 索引：`[[框架结构库/README.md]]`
- 写作只读 `{structureId}/框架说明.md`；样本 md 可选读语气
- 未指定 structureId：**推荐 2～3 个 → 等人选**（禁止领域默认）

## N/K 与 doc_type

`[[../../../_shared/references/技术文档-NK与doc_type契约.md]]`。步骤 1.5 产出 N、K、doc_type。

## 方法论库

- 路由：`[[方法论库/SKILL.md]]`
- 选费曼：写章节用 `方法论库/references/费曼-统合叙事.md`，写后用 `费曼-理解校验.md`

## 面经质量门禁

- 钩子、全景图、对比表、正反例、快问快答 K、区分度
- cargo cult：见费曼-理解校验（表空、钩子无追问、代码无关）

## 文档转播客（步骤 6）

| 项 | 约定 |
| --- | --- |
| 触发 | 面经落盘后**询问**，禁止静默 |
| 输入 md | 刚写入的经验贴绝对路径 |
| 输出目录 | `{面经父目录}/{stem}/`，`stem` = 面经文件名去 `.md`（勿用 `podcast/`） |
| doc_type | 步骤 1.5 结果，默认 `面经` |
| 交付模式 | 用户未指定 → **完整**（文档转播客 **不再**检查点 B 二次确认） |

示例：`Obsidian/MCP/MCP工具调用全景对比.md` → 播客目录 `Obsidian/MCP/MCP工具调用全景对比/`。

本 skill **不**运行 validate-podcast-md、TTS 脚本。

## 与 post-mortem

复盘三文件用 post-mortem；若要面经体例可选用 `背景-实现-核心-取舍` structureId。
