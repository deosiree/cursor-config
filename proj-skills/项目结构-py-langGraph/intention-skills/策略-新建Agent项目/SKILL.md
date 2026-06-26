---
name: 策略-新建Agent项目
description: 从 0 搭建 FastAPI+LangGraph Agent 全项目骨架。Use when 新建 Agent 项目、terminology-agent 结构、app 目录分层。
---

# 策略-新建Agent项目

## 何时使用

- 从 0 创建 FastAPI + LangGraph Agent 仓库
- 需要完整 `app/` 分层 + 最小可运行 main/router/conftest

## GREEN 步骤

1. 复制 [[../../template/新Agent项目骨架/tree.txt]] 创建目录
2. 调用 [[../../feature-skills/撰写-项目根README/SKILL.md]] 写项目根 README
3. 至少一个 `services/<domain>/` — [[../../feature-skills/搭建-services领域包/SKILL.md]]
4. 至少一个 `graph/<workflow>/` — [[../../feature-skills/搭建-graph工作域包/SKILL.md]]
5. [[../../feature-skills/搭建-测试共置与mock/SKILL.md]] 补 conftest
6. 对照 [[../../assets/skill-output-checklist.md]] 自检

## 输出契约

- 完整 `app/` 目录树
- 各层 README 占位或金样链接
- `pytest` 可收集（允许 0 业务用例，settings 测试可绿）

## 金样

[[../../assets/few-shot-example/terminology-agent/project-tree.txt]]
