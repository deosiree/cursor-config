---
name: 撰写-graph域README双轨Mermaid
description: 撰写 graph 工作域 README，含源码对照与中文业务双轨 Mermaid。Use when graph README、双轨 Mermaid、pre_translate README。
---

# 撰写-graph域README双轨Mermaid

## 何时使用

- 新建或更新 `graph/<workflow>/README.md`
- 任何涉及 builder 连边变更后的文档同步

## 章节模板

复制 [[../../template/graph域README模板/README.md]]，按 workflow 填写。

## 双轨规则（硬约束）

每张流程图 **必须成对**：

1. `### 源码对照（与 builder 一致）` — 节点函数名
2. `### 业务说明（人类阅读）` — 中文动作描述

**Mermaid 引号规则（业务图必守）**：
- 标签含 `:`、`/`、`?`、英文（如 `or`、`LLM`）→ `node["标签文本"]`
- 圆角节点：`start(["收到输入"])`
- 边标签：`-->|"术语库足够"|`

详见 [[../../references/Mermaid双轨写作规范.md]]

## 失败模式

| 触发 | 修复 |
|------|------|
| Mermaid lexical error on line N | 给该行节点/边标签加双引号 |
| 源码图与 builder 不一致 | 以 `builder.py` 的 `add_node`/`add_edge` 为准重画 |
| 只有源码图无中文图 | 补「业务说明」成对节，禁止提交 |

## 必含章节

1. 业务摘要
2. 全项目调用链（双轨）
3. 目录树
4. 主流程（双轨）
5. 条件边（双轨，若有）
6. State 字段表
7. 节点一览（源码名 + 中文 + 路径）
8. 维护 Checklist

## 输出契约

- 完整 `graph/<workflow>/README.md`
- Mermaid 与 `builder.py` 一致

## 金样

[[../../assets/few-shot-example/terminology-agent/graph-pre_translate-README.md]]
