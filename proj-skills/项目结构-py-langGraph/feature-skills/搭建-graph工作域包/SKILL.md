---
name: 搭建-graph工作域包
description: 创建 graph 工作域包：state builder runner nodes edges domain utils prompts tests。Use when LangGraph 域包、PreTranslateGraph。
---

# 搭建-graph工作域包

## 何时使用

- 新增 `graph/<workflow>/`

## 目录结构

```
graph/<workflow>/
├── README.md            # 必写，双轨 Mermaid
├── state.py
├── constants.py
├── builder.py           # compile
├── runner.py            # invoke 入口
├── domain/
├── edges/
├── nodes/
│   ├── intentions/
│   └── features/{io,rules,llm,workflow,tools,human}
├── utils/
├── prompts/
└── tests/
```

## LangGraph 三要素

| 概念 | 文件 |
|------|------|
| State | `state.py` |
| Nodes | `nodes/**/*.py` |
| Edges | `edges/*.py` |
| Compile | `builder.py` |
| Invoke | `runner.py` |

## 循环 import 注意

- `utils/__init__.py` 不要 import `trace.py`（trace 依赖 runner）
- 包级 `__init__.py` 延迟 import builder

## 输出契约

- 完整 graph 域包 + README

## 金样

[[../../template/graph域包骨架/tree.txt]]
