---
name: 分析-skill现状
description: 当需要先判断一个目标 skill 当前属于单文件、旧套件、agent 套件还是 Darwin 迭代态，再决定后续改造路径时使用。
---

# 核心任务
先做结构诊断，再决定进入哪个 intention 节点。

## 何时触发
- 还不清楚目标是单文件 skill、旧套件、agent 套件还是 Darwin 迭代态。
- 用户给出的目标模糊，需要先判断现状再决定路径。
- 当前任务同时夹杂结构、内容和质量问题，不能直接跳功能节点。

## 必看
- `[[../../README.md]]`
- `[[../../references/writing-skills-core.md]]`

## 输入 / 前置条件
- `targetPath`
- 当前目录结构或可读文件
- 已知痛点

## 输出
- `currentStructure`
- `primaryGaps`
- `recommendedNextIntentions`

## 边界
- 它负责判现状，不直接完成重构或补文档。
- 如果任务类型已经非常明确，不必重复回到本节点。

## 使用示例
```text
我只知道这是最近写的一个 skill 套件，但还没判断它到底是旧单体还是已经进入 Darwin 阶段。
使用 $分析-skill现状 先给出现状判定和下一步 intention 路由。
```
