# 创建harness工作流

## 定位

父级 agent 套件：创建/升级任意仓 harness，或把源仓新范式同步为可迁移能力，并接入 Darwin 质量门。

**frontmatter 模式：** 本地中文模式。

## 结构职责

| 路径 | 职责 |
| --- | --- |
| `SKILL.md` | 路由、硬约束、双输出契约；不写长流程 |
| `intention-skills/` | 分析现状；无/旧编排；同步 skill 收益；Darwin 质量迭代 |
| `feature-skills/` | Discovery、对照能力、反拷贝、落地、合并、提炼条目 |
| `references/可迁移能力.md` | P0–P2 能力 SSOT（他仓对照用） |
| `references/样例-Nebula.md` | few-shot，须改写 |
| `template/` | 虚构单仓骨架 |
| `evals/` | 触发题 + Darwin 记录 |

## 维护规则（防膨胀）

1. 源仓学会新范式 → 走 `编排-同步skill收益`，**只改** `可迁移能力.md` / 样例附录 / 必要 feature，**不**把细则堆进父 SKILL  
2. 质量问题 → `编排-skill质量迭代`（Darwin），不手搓堆段落凑分  
3. 新编排路径 → 新开 intention，禁止塞进「无/旧」两个节点混写  

**最近同步：** 2026-08-14 · SSOT 解耦 + 漂移审计 + 期末三层卷 → [`evals/sync-run-2026-08-14.md`](evals/sync-run-2026-08-14.md)

## 使用示例

```text
从 0 建 harness / 升级旧 harness / 同步 skill 收益 / Darwin 评估本套件
```

## 验收

- 父文件可回答「走哪条 intention」  
- 无/旧两条编排行为不同且可测  
- 同步收益产出的是能力条目而非业务特例  
- Darwin 记录在 `evals/results.tsv`  
