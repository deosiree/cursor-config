---
name: 策略-重构反模式
description: 治理 Agent 目录反模式：orchestration 平铺、graph 根杂物。Use when 重构 orchestration、graph routes 迁移、目录混乱。
---

# 策略-重构反模式

## 何时使用

- 存在 `orchestration/` 与 `services/` 职责重叠
- graph 根目录平铺 `routes.py`、`*_graph.py`、`trace_utils.py`
- `nodes/` 与 `nodes/features/` 重复遗留目录

## 识别信号

| 反模式 | 目标状态 |
|--------|----------|
| `orchestration/batch_*.py` | `services/<domain>/service.py` |
| `graph/routes.py` | `graph/<workflow>/edges/` |
| `graph/pre_translate_graph.py` | `builder.py` + `runner.py` |
| `graph/retrieval_helpers.py` | `graph/<workflow>/utils/` |

## GREEN 步骤

1. 列出 import 替换对照表（旧 → 新）
2. 迁文件、改 import，**不改业务断言**
3. **🔴 CHECKPOINT · pytest** — `pytest -v` 全绿后才允许删除旧目录
4. [[../../feature-skills/撰写-graph域README双轨Mermaid/SKILL.md]] 补 README
5. [[../../feature-skills/沉淀-历史样本为few-shot/SKILL.md]] 更新 assets

## 失败模式

| 触发 | 一线修复 | 兜底 |
|------|----------|------|
| import 循环依赖 | 按层迁：repository → graph → services → api | 暂留旧 re-export shim |
| pytest 单测红 | 只修 import 路径，**不改 assert** | 3 轮仍红 → 🛑 STOP 列失败用例 |
| 旧目录删后回滚难 | 先 `git commit` 迁移中间态再删 | — |

## 输出契约

- 迁移映射表
- 删除清单
- pytest 全绿

## 金样迁移

terminology-agent 已完成：orchestration → services/pre_translate；graph 根 → pre_translate 包。
