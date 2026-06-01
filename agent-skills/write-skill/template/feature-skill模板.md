# feature-skill 模板

> 可直接复制的 feature 节点骨架。

## 目录结构

```text
<feature-节点>/
├── README.md             # 作用、适用场景、与相邻节点边界
├── SKILL.md              # 核心任务 + 输入/输出 + 边界 + 使用示例
├── template/             # before/after 或 mvp/snapshot 模板族
├── assets/               # few-shot-example/ + skill-output-checklist.md
├── references/           # notes.md + darwin-evolution.md
└── evals/                # evals.json
```

## SKILL.md 骨架

```markdown
---
name: <中文功能名>
description: Use when <触发条件>
---

# 核心任务
<一句话>

## 何时触发
- <条件1>

## 输入 / 前置条件
- <字段A>

## 输出
- <字段B>

## 边界
- 它只负责 <能力>，不负责 <相邻节点职责>

## 使用示例

