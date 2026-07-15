---
name: 分析-任务分类与模型提案
description: 当用户请求多模型并发但未指定模型列表，需要根据任务类型（批处理/复杂推理）推荐模型池并生成人类确认提案表时使用。
---

# 核心任务

判定 `taskClass = batch | complex | probe_only`；若未指定模型则生成「模型提案表」→ 🔴 CHECKPOINT 等人确认。

## 何时触发

- 主 skill 收到任务后第一步，用户未明确指定模型
- 用户只说「翻译这个文件」「批量审查」「测试一下」而没有说用哪个模型

## 输入 / 前置条件

- 用户自然语言请求（含任务描述）
- `models.config.json`：`[[../../lib/models.config.json]]`
- `modelCatalog.js`：`[[../../../translate/lib/modelCatalog.js]]`

## 任务分类判定

| 信号 | 判定 |
|------|------|
| 「翻译」「英译俄」「en2ru」「批量翻译」「批量审查」「批量测试」「代码扫描」「数据清洗」「批量生成」 | `batch` → 推荐 free tier 全模型并发 |
| 「编码」「写代码」「数学推理」「数学证明」「复杂逻辑」「长文创作」「架构设计」 | `complex` → 推荐 primary tier 单主力模型 |
| 「测模型」「probe models」「API 探测」 | `probe_only` |
| 已指定模型名 / `--models` | 跳过提案，直接进入路权判定 |
| 用户明确说「用免费模型」「所有免费的一起跑」 | `batch` → free tier all |
| 用户明确说「用主力模型」「用 deepseek」 | `complex` → primary tier 指定模型 |

## 模型提案表生成

当选 `batch` 或 `complex` 且未指定模型时，生成 Markdown 表格供人类确认：

```markdown
## 🔴 CHECKPOINT · 模型确认

任务类型：{taskClass}
推荐模型池：{tierLabel}

| # | 供应商 | 模型 | 路数 | 批大小 | 计费 | 文档 |
|---|--------|------|------|--------|------|------|
| 1 | 讯飞星辰 | Hy-MT2-7B | 20 | 100 | 限免 | [pricing](...) |
| 2 | 硅基流动 | Hunyuan-MT-7B | 1 | 40 | 限免 | [pricing](...) |
| ... | ... | ... | ... | ... | ... | ... |

> 总计 {N} 路，理论峰值吞吐约 {估算} 条/分钟。
> 
> 请确认使用哪些模型？回复：
> - 「全用」→ 全部勾选
> - 「去掉 xxx」→ 排除指定模型
> - 「只用 xxx, yyy」→ 只选指定模型
```

## 输出

- `taskClass`：`batch` | `complex` | `probe_only`
- `tier`：`free` | `primary`
- `proposalTable`：Markdown 提案表（含 models、lanes、pricing、urls）
- `needConfirm`：boolean（是否需要等人确认）
- `totalLanes`：若已确认 → 预计算
- `reason`：分类理由

## 下一步路由

- 需确认 → 暂停等人 🔴 CHECKPOINT
- 已确认 / 已指定 → `[[../分析-路权判定/SKILL.md]]`
- probe_only → `[[../../feature-skills/探测-模型可用性/SKILL.md]]`

## 边界

- 只做任务分类和模型提案，不执行调度、不调 API。
- 提案表必须包含模型 URL（定价页/文档页），方便人类核实。
- 换模型只需改 `models.config.json`，下次提案自动反映。
