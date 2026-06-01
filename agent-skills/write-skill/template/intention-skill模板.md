# intention-skill 模板

> 可直接复制的 intention 节点骨架。

## 目录结构

```text
<intention-节点>/
├── README.md             # 作用、边界、与相邻节点关系
├── SKILL.md              # 核心判断逻辑 + 输出 + 路由
├── template/             # output-example、input-example
├── assets/               # few-shot-example/ + skill-output-checklist.md
├── references/           # notes.md + darwin-evolution.md
└── evals/                # evals.json（should-trigger / should-not-trigger）
```

## SKILL.md 骨架

```markdown
---
name: <中文节点名>
description: Use when <触发条件>
---

# 核心任务
<一句话说明这个 intention 判断什么>

## 何时触发
- <典型触发条件>

## 输入 / 前置条件
- <必须字段>

## 输出
- <字段A>
- <字段B>

## 下一步路由
- 输出X -> `[[feature-skills/<X>/SKILL.md]]`
- 输出Y -> `[[feature-skills/<Y>/SKILL.md]]`

## 边界
- 它只负责判断，不负责落地
```
