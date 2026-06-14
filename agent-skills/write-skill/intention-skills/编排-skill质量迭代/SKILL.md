---
name: 编排-skill质量迭代
description: 当一个 skill 写完后还需要进入 Darwin 式质量评估、受控试跑、优化迭代与 keep 或 revert 决策时使用。
---

# 核心任务
负责质量闭环编排，不把 Darwin 细节塞回主 skill。

## Darwin 接入顺序
1. 先检查当前工作区 `./.cursor/darwin-skill`
2. 若缺失，请求人类提供 Darwin skill
3. 若仍拿不到，再退化到内部简化闭环

## 输入 / 前置条件
- 当前套件完成度
- 是否已存在 `./.cursor/darwin-skill`
- 用户允许的质量迭代范围

## 输出
- `darwinIntegrationMode`
- `qualityGatePlan`
- `baselinePlan`
- `trialPlan`
- `keepOrRevertRule`

## 边界
- 它负责编排 Darwin，不负责替代实际评分节点。
- 如果结构、内容或 Markdown 还没完成，不应直接推进 Darwin。

## 常用配套
- `[[../../feature-skills/darwin质量评估与迭代/SKILL.md]]`
- `[[../../feature-skills/Darwin-集成评估闭环/SKILL.md]]`

## 自我迭代入口

当实跑完成后，自动进入自我检查：

```
调用 诊断-自我能力评估 ← intention-skill
  ├─ 检查路由/模板/Darwin/用户反馈 4个维度
  ├─ 连续<3次同一缺口 → 记录暂不触发
  └─ 连续≥3次 → 触发迭代（新增子skill）
```

## 使用示例
```text
这个 skill 套件已经基本写完，我想决定怎么接入 Darwin 质量迭代，但先不直接跑优化。
使用 $编排-skill质量迭代 给出质量门禁、baseline 和试跑计划。
```
