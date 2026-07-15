---
name: 多模型并发调度
description: 多供应商多模型的加权路权并发调度器。简单批处理任务（翻译/批量审查/测试）默认推荐全模型免费池并发；复杂任务（编码/推理）默认推荐单主力模型。含人类确认门禁、模型提案表、车道限流调度、定价检查。
version: 1.0.0
tags: [concurrency, multi-model, lane, dispatch, batch, translation, review]
metadata:
  tier: agent
  depends:
    config: lib/models.config.json
    catalog: ../translate/lib/modelCatalog.js
---

# 目标

把「判定任务类型 → 提案模型列表 → 等人确认 → 路权分配 → 车道限流调度」标准化为可路由 agent 套件。

## 何时使用

- 任何需要多模型并发分摊的批处理任务（翻译、批量代码审查、批量测试、数据清洗）
- 任务未指定模型，需要系统根据任务类型推荐模型池（免费 vs 主力）
- 需要路权模型——有的模型 20 路、有的 1 路——做加权调度
- 需要检查模型定价是否过期

## 何时不要使用

- 用户已明确指定单一模型 → 直接走单模型，不经过本套件
- 只需探测模型可用性但不执行任务 → 走 `[[feature-skills/探测-模型可用性/SKILL.md]]` 即可

## RED · 失败基线

1. 把 20 路的讯飞和 1 路的硅基小模型同等对待，round-robin 摊批 → 硅基小模型拥塞、讯飞空转
2. 沉默自动选全模型并发 → 可能消耗限免额度或触发付费
3. 模型换了但配置不更新 → 调度器仍走旧模型/旧路数
4. 批大小一刀切 → 小模型 100 条超时、大模型 20 条浪费
5. 免费/付费模型混用 → 翻译任务意外消费高昂的主力模型

### 失败模式 fallback

| 触发条件 | 一线修复 | 仍失败兜底 |
|---------|---------|-----------|
| 模型提案表为空 | 回退 `models.config.json` 全部 free tier | 提示补充模型配置 |
| 用户确认超时/无响应 | 默认走 free tier 单模型（讯飞优先） | `single` 兜底 |
| API Key 缺失 | 标 `skipped_no_key`，剩余模型继续 | 报告缺少 Key 的模型 |
| 路权配置冲突 | 以 `models.config.json` 为准，忽略旧 env | 日志 warn |

## 人工门禁

| 条件 | 动作 |
|------|------|
| 未指定模型 + 任务类 = batch | 🔴 CHECKPOINT：列出 free tier 全部模型（含路数/批大小/计费/URL），等人确认 |
| 未指定模型 + 任务类 = complex | 🔴 CHECKPOINT：列出 primary tier 全部模型，等人确认 |
| 定价超过 30 天未确认的付费模型 | ⚠️ WARN，仍可用但提示 |

## GREEN · 路由

### 任务分类

- `batch`：翻译、批量审查、批量测试、数据清洗等 → 推荐全模型免费池并发
- `complex`：编码、数学推理、长文创作等 → 推荐单主力模型
- `probe_only`：只探测模型可用性，不执行任务

### 线性步骤

1. **任务分类** → 判定 `taskClass` = batch | complex | probe_only
   `[[intention-skills/分析-任务分类与模型提案/SKILL.md]]`
2. **模型提案**（若未指定模型）→ 生成提案表，🔴 CHECKPOINT 等人确认
3. **路权判定** → 计算 totalLanes + 路权分配表
   `[[intention-skills/分析-路权判定/SKILL.md]]`
4. **编排** → CLI 参数 + 路由到车道限流调度器
   `[[intention-skills/编排-加权调度/SKILL.md]]`
5. **执行** → LanePoolDispatcher
   `[[feature-skills/执行-车道限流调度/SKILL.md]]`

### 功能层速查

| 任务 | 路由 |
|------|------|
| 探测模型 | `探测-模型可用性` |
| 车道限流执行 | `执行-车道限流调度` |

## 反例黑名单

- 不要在未确认的情况下自动跑全模型并发
- 不要把付费主力模型混入 free tier
- 不要把视觉/OCR 模型纳入文本翻译分摊
- 不要硬编码路数——从 `models.config.json` 读取

## 资源索引

- 配置：`[[lib/models.config.json]]`、`[[../../translate/lib/modelCatalog.js]]`
- 路权模型文档：`[[references/lane-model.md]]`
- 探测：`[[feature-skills/探测-模型可用性/SKILL.md]]`
