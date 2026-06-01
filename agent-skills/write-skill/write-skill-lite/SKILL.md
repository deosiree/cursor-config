---
name: 写skill-lite
description: 5 分钟上手 write-skill 套件。新建/升级/拆层/评估 skill 时使用。完整版路线图见 references。
---

# 写skill — 5 分钟上手

## 你遇到了什么情况？

| 场景 | 做什么 |
| --- | --- |
| 从 0 建一个新 skill | `intention-skills/策略-新建skill` |
| 把旧单文件升级为套件 | `intention-skills/策略-升级旧skill` → `迁移-主skill改造为agent` |
| 平铺子skill太多想拆层 | `intention-skills/迁移-拆分意图层与功能层` |
| 写完了想评估质量 | `feature-skills/darwin质量评估与迭代` |
| 主 SKILL.md 太重想瘦身 | `feature-skills/主SKILL瘦身与下沉` |
| 模板只有说明壳没有真实样本 | `feature-skills/真实历史样本型模板-基于RED写before` |
| 需要做 Markdown 格式收尾 | `feature-skills/Markdown格式规范收尾` |

## 标准工作流

```text
RED       → 分析现状（intention-skills/分析-skill现状）
GREEN     → 结构补齐 → 内容补齐
REFINE    → Markdown 收尾
DARWIN    → 评估 + 试跑 + 优化
REFACTOR  → 拆层、改名、补模板、补 few-shot
```

## 每个子节点的最小要求

```
README.md + SKILL.md + template/ + assets/ + references/ + evals/
```

## 空心化门禁

> 只凭 README 标题和一句话定位就当作完成 → **不通过**。
> 每个子节点必须能在 SKILL.md 中读到：任务、输入、输出、边界、使用示例。

## 约束基线

当前分层版不得退化的规则，见：

- `[[../references/write-skill-single-guardrails.md]]`

## 完整版

- `[[../SKILL.md]]` — 父级 agent 入口，含任务分类、路由、Darwin 入口
- `[[../README.md]]` — 结构职责、演化边界、长期原则
- `[[../references/write-skill-operating-guide.md]]` — 完整执行说明
- `[[../references/writing-skills-core.md]]` — 核心规则（命名/模板/few-shot/Darwin）
