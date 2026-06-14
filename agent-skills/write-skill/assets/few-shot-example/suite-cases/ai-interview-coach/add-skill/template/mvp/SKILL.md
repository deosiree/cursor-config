# ai-interview-coach 初始 SKILL.md（mvp 版本）

> 此为从零新建 agent skill 套件时的初始入口文件形态。
> 完整文件见 `~/.hermes/skills/ai-interview-coach/SKILL.md`

```markdown
---
name: ai-interview-coach
description: AI面试学习管家。管理6周递进式面试备考，支持每日学习流程（抽题→考试→打分→记录）、暂停/复习/跳周/进度查询。触发词：今天学习、开始学习、Day N、今天休息、复习、看进度、打卡、面试练习。
version: 1.0.0
tags: [面试, 学习, 备考, 打卡, 面经, 考试, AI面试, 每日练习]
metadata:
  hermes:
    category: learning
    related_skills: [learning-assistant]
---

## RED（失败基线）
见 templates/before/。常漏：未读取进度、未等选择框架、未检查当天是否已完成。

## GREEN（执行主线）
| 场景 | 路由 |
|------|------|
| 开始每天的学习 | intention-skills/编排-每日学习流程/SKILL.md |
| 复习/全部复习 | intention-skills/分析-复习计划/SKILL.md |
| 查询进度 | intention-skills/分析-学习进度/SKILL.md |
| 跳过/休息 | intention-skills/分析-复习计划/SKILL.md |

## 入参 / 数据文件索引 / 评分标准 / 关键约束 / 何时不用 / REFACTOR

## 相邻skill
learning-assistant · QA转面经 · conversation-summary
```
