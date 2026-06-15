# route-obsidian — Obsidian 技能路由器

## 作用

route-obsidian 是 `obsidian-skills` 套件的编排器（intention-skill）。它不执行任何具体操作，只做三件事：

1. **分类**：判断用户请求属于哪个 Obsidian 功能域（读写/检索/维护/摄入/综合）
2. **派发**：Single Dispatch 到对应的 feature skill
3. **终止/回环**：成功则结束，失败则走 Human Loop

## 反漩涡设计

| 规则 | 说明 |
|------|------|
| **Single Dispatch** | 每次只派发一个 skill，不链式 fallback |
| **Max 1 Auto-Fallback** | 仅可行性检查失败时自动试次选 |
| **Fail → Human Loop** | 运行时失败不自动尝试，报告用户决策 |
| **Token 止损** | >20 工具调用未解决 → 停止并报告 |

## 路由表

| 用户请求 | 首选 | 次选 |
|---------|------|------|
| 读写笔记 | feature/obsidian-vault | feature/llm-wiki save |
| 检索知识 | feature/llm-wiki query | feature/qmd |
| Vault 维护 | feature/vault-maintainer | 无→Human Loop |
| 摄入知识 | feature/llm-wiki ingest | obsidian-vault |
| 综合/对比 | feature/llm-wiki synthesize | 无→Human Loop |

## 安装检查

使用前确认：
- 目标 feature skill 的 `SKILL.md` 存在
- 如果指向 Hermes marketplace skill，先用 `hermes skills install <name>` 安装
