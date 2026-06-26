---
name: 搭建-services领域包
description: 创建 services 领域包：service.py 编排入口、single.py、mappers.py、tests。Use when PreTranslateService、services 领域包。
---

# 搭建-services领域包

## 何时使用

- 新增 `services/<domain>/`

## 目录结构

```
services/<domain>/
├── __init__.py          # export XxxService
├── service.py           # 编排入口（batch / 用例循环）
├── single.py            # 单条执行（可选，调 graph runner）
├── mappers.py           # state→响应 纯函数（可选）
└── tests/
    └── test_*_service.py
```

## 职责边界

- **service.py** — 类比前端 `views/<domain>/index.vue`
- **single.py** — 单条用例，调 `graph/<workflow>/runner.py`
- **mappers.py** — 无 I/O 的映射/推断函数

## 禁止

- HTTP 解析进 service（留在 api/）
- LangGraph 节点逻辑进 service（留在 graph/nodes/）

## 输出契约

- 完整 `services/<domain>/` 包
- router 只 import `XxxService`

## 金样

[[../../assets/few-shot-example/terminology-agent/services-pre_translate-tree.txt]]
