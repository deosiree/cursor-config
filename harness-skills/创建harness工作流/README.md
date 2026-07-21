# 创建harness工作流

## 定位

教 Agent / 维护者：**如何让 harness 认识并协同任意目标项目**。  
不传授某一产品的业务规则；样例仓仅作 few-shot。

**frontmatter 模式：** 本地中文模式（`name` / `description` 均为中文）。

## 结构职责

| 路径 | 职责 |
| --- | --- |
| `SKILL.md` | 三幕流程、失败分支、黑名单、输出契约 |
| `references/可迁移能力.md` | P0–P2 能力清单（括号内为样例实现，非必拷） |
| `references/样例-Nebula.md` | 某 Meta-Workspace 如何填实方法论（须改写） |
| `template/虚构单仓-ReactREST.md` | 无业务耦合的填空成品样本 |
| `assets/` | Discovery 工作表、检查清单、frontmatter 模板 |
| `evals/` | 触发与验收题 |

## 使用示例

```text
给我仓库 X 从 0 建 harness，先认识项目再写文件。
```

```text
升级旧 harness：对照可迁移能力，优先补审查导览与质量 Loop。
```

## 验收方式

1. 打开 `evals/evals.json` 的 should-trigger / should-not-trigger  
2. 用虚构单仓跑一遍三幕，产物无样例专有名词残留（除 `样例-*.md`）  
3. Darwin 评估见 `evals/results.tsv`（人确认 keep/revert）

## 维护

- 新增可迁移能力：先改 `references/可迁移能力.md`，再视需要改主 `SKILL.md` 一句索引  
- 禁止把样例业务规则升格为主流程必做项  
