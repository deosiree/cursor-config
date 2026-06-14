---
name: Darwin-集成评估闭环
description: 在写 skill 完成后，自动接入 Darwin 评估闭环：先桥接外部 darwin-skill，缺失时退化为内部简化闭环。
---

# 核心任务

在 skill 创建/改造完成后，自动触发 Darwin 评估闭环，确保质量门禁闭环。

## 何时触发

- `编排-skill质量迭代` Step 3（完成结构编写后触发评估）
- 或用户显式要求"接入 Darwin 评估"

## 流程

### Step 1：检查外部 Darwin skill

```
检查 ./cursor/darwin-skill/SKILL.md 是否存在
  ├── 存在 → 优先桥接：
  │     ├─ 读 darwin-skill/SKILL.md 获取 rubric
  │     ├─ 读 darwin-skill/template/ 获取模板
  │     └─ 按外部 Darwin 流程执行评估
  └── 不存在 → 退化到内部简化闭环（Step 2）
```

### Step 2：内部简化闭环

```
1. 基于本项目 rubric 做 baseline 评分（9维）
2. 设计 2-3 条测试 prompt
3. 执行 dry_run 推演
4. 产出 baseline 报告
5. 记录到 results.tsv
```

### Step 3：结果交付

```json
{
  "mode": "external | internal",
  "baselineScore": 72,
  "status": "baseline_done | eval_skipped",
  "nextStep": "进入优化循环（如需要）"
}
```

## 边界

- 桥接优先于内嵌
- 缺失时退化到内部简化闭环，不阻塞
- 不修改 skill 内容，只评估

## 与现有 darwin质量评估与迭代 的关系

本 skill 是自动接入点，在写 skill 流程末尾自动触发。
`darwin质量评估与迭代` 是手动调用入口，二者共享内部闭环逻辑。
