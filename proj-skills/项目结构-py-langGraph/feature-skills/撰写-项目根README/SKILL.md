---
name: 撰写-项目根README
description: 撰写 terminology-agent 级 README：技术栈、全项目结构树、分层约定、测试命令。Use when Agent README、主要目录表。
---

# 撰写-项目根README

## 何时使用

- 新建 Agent 项目根 README
- 结构重构后更新「主要目录」与「分层约定」

## 必含章节

1. 项目简介
2. 技术栈
3. 快速启动
4. 测试命令（按域 `pytest app/services/<domain>/tests`）
5. **全项目结构树**（api / services / graph / repository / schemas / core）
6. 分层约定（router → services → graph → repository）
7. 链接 `graph/<workflow>/README.md`
8. 相关文档

## 输出契约

- `terminology-agent/README.md` 或等价项目根 README

## 金样

terminology-agent/README.md
