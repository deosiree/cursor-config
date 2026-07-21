---
name: 分析-harness现状
description: 判定目标仓是无 harness、旧 harness，还是仅对照缺口；输出 mode 与 Discovery 前置状态。触发词：分析 harness、有没有 AGENTS、harness 现状。
---

# 分析-harness现状

## 目标

输出唯一 `mode`，供父 agent 路由，不落地写文件。

## 输入

- `targetPath`（缺失 → 🔴 问路径，本节点输出 `mode=blocked`）

## 步骤

1. 调 `[[../../feature-skills/认识项目Discovery/SKILL.md]]` 填表（可部分 unknown）  
2. 按 `existingHarness` 判定：

| 条件 | mode |
| --- | --- |
| 无 AGENTS 且无 docs 下 intake/architecture/quality 类文件 | `none` |
| 有 AGENTS 或明显 harness 文档，但相对可迁移能力有缺口 | `legacy` |
| 用户只要对照清单、明确不写文件 | `audit-only` |
| targetPath 不可用 | `blocked` |

3. 调 `[[../../feature-skills/对照可迁移能力/SKILL.md]]` 生成初版 `gapChecklist`（audit-only / legacy / none 均需要）  
4. 输出 `mode` + `nextIntention` 建议  
5. 若父 agent 已声明「同轮衔接」且 `mode` 为 `none|legacy`、关键 blockers 可标在 `stopOrCheckpoint`：允许同一回复继续进入对应编排；最终 YAML 的 `route` 写**编排**名，并在正文标明已完成分析  
6. 若 `mode=blocked|audit-only`：**停止**，不进入创建/升级编排  

## 失败分支

| 触发 | 一线 | 兜底 |
| --- | --- | --- |
| 路径缺失 | 🔴 问路径 | `mode=blocked` |
| 碎片文档命名怪异 | 按能力语义归类，不按文件名死磕 | gap 标「部分」并说明依据 |
| 像有 AGENTS 但是空壳 | 当 `legacy` 且 P0 多项「无」 | 建议仍走升级而非从 0 覆盖 |

## 输出

```yaml
mode: "none|legacy|audit-only|blocked"
nextIntention: "编排-无harness创建|编排-旧harness升级|无|待路径"
discoveryTable: {}
gapChecklist: []
stopOrCheckpoint: ""
```
