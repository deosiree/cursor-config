---
name: 项目结构-py-langGraph
description: >-
  FastAPI+LangGraph Agent 全项目结构标准：api/services/graph/repository 分层、graph 域包、双轨 Mermaid README。
  何时用：新建 Agent 项目、新增 graph 工作域、新增 services 领域、目录反模式重构、写 graph 域 README。
  何时不用：单节点业务逻辑、seccenter HTTP 集成测试、纯 CRUD 无 LangGraph。
  触发词：LangGraph 项目结构、Agent 目录规范、graph 域 README、双轨 Mermaid、services 领域包。
---

# 项目结构-py-langGraph

## 何时使用

- 从 0 新建 FastAPI + LangGraph Agent 项目骨架
- 已有项目新增 `graph/<workflow>/` 或 `services/<domain>/`
- 目录混乱（orchestration 平铺、graph 根杂物）需重构
- 为 graph 工作域撰写 **双轨 Mermaid** README

## 何时不要使用

- 只改某个 `*_node` 的业务逻辑（检索算法、prompt 文案）
- seccenter / nebula HTTP 黑盒集成测试 → [[../../test-skills/写pytest集成测试/SKILL.md]]
- 纯 CRUD 服务、无 LangGraph 工作流

## Single Dispatch 路由表

**一次只 dispatch 一个 intention，禁止自动链式多 dispatch。**

| 用户意图 | dispatch 唯一 intention |
|----------|---------------------------|
| 从 0 新建 Agent 项目 | [[intention-skills/策略-新建Agent项目/SKILL.md]] |
| 已有项目，新增 LangGraph 工作流 | [[intention-skills/策略-新增图域/SKILL.md]] |
| 已有项目，新增业务域（审核/批处理） | [[intention-skills/策略-新增服务域/SKILL.md]] |
| 目录混乱、orchestration/平铺/graph 根杂物 | [[intention-skills/策略-重构反模式/SKILL.md]] |
| 只写/补 graph 域 README | [[feature-skills/撰写-graph域README双轨Mermaid/SKILL.md]] |
| 不确定属于哪类 | [[intention-skills/路由-结构任务/SKILL.md]] |

## Agent 执行流程

1. **读输入契约** — 提取 `targetRepo`、`taskType`、`workflowName`/`domainName`
2. **🔴 CHECKPOINT · 路由** — 按上表 dispatch **唯一** intention；`taskType` 不明则走 `路由-结构任务`
3. **执行 intention GREEN 步骤** — 只读被 dispatch 的 SKILL.md，按序产出
4. **🔴 CHECKPOINT · 自检** — 对照 [[assets/skill-output-checklist.md]] 逐项勾选
5. **输出** — 目录树 diff + 新建/修改文件清单 + 待跑 `pytest -v`

## 失败模式与 Fallback

| 触发条件 | 一线修复 | 仍失败兜底 |
|----------|----------|------------|
| `targetRepo` 缺失或路径不存在 | 🛑 STOP，列出 `missingFacts`，请用户补路径 | — |
| `taskType` 无法推断 | dispatch `路由-结构任务`，最多追问 2 个澄清问题 | 仍不明 → 🛑 STOP，给出 4 选 1 菜单 |
| 目标仓库无 `app/graph/` 或 `app/services/` | 若用户要增域 → 先 dispatch `策略-新建Agent项目` 搭骨架 | 用户拒绝新建 → 🛑 STOP |
| 重构后 `pytest` 失败 | 回滚 import 替换，逐文件迁移；**不改测试断言** | 3 轮仍红 → 🛑 STOP，输出失败用例与 diff |
| Mermaid 预览报 lexical error | 节点/边标签含 `:` `/` `?` 英文 → 改为 `node["标签"]` | 见 [[references/Mermaid双轨写作规范.md]] |
| mock LLM 不生效 | patch 路径改为 `graph/<workflow>/builder.py` 内节点函数名 | 见 [[references/测试共置与mock约定.md]] |

## 执行反例黑名单（本 skill 运行时不要做）

| 反模式 | 替代做法 |
|--------|----------|
| 一次 dispatch 多个 intention 并串行执行 | Single Dispatch：一次只开一个 intention |
| 新建 graph 域不写 README | 必调 `撰写-graph域README双轨Mermaid` |
| 重构时改测试断言来凑绿 | 只迁路径与 import，断言不动 |
| Mermaid 中文图节点不加引号 | `node["含 : / 或英文的标签"]` |
| patch 节点模块路径 mock LLM | patch `builder.<node_fn>` |

## 全项目硬约束（10 条）

1. `api/` 只做 HTTP 薄壳，业务进 `services/`
2. `services/<domain>/service.py` 为领域编排入口
3. `graph/<workflow>/` 一图一包：`state` `builder` `runner` `nodes` `edges` `domain` `utils` `prompts` `tests`
4. 每个 `graph/<workflow>/README.md` **必写**，含双轨 Mermaid
5. 条件边放 `edges/`，不放 `nodes/`
6. `builder.py` 负责 compile；`runner.py` 负责 invoke
7. `repository/` 为唯一 DB 访问层
8. 测试与源码共置 `**/tests/`
9. mock LLM 时 patch `builder.<node_fn>`，非节点模块路径
10. 禁止 graph 根目录平铺 `routes.py`、`*_graph.py`

## 反模式黑名单

- 顶层 `orchestration/` 与 `services/` 并存
- graph 根目录平铺业务文件
- 条件边函数放进 `nodes/`
- 新建 `graph/<workflow>/` 不写 README
- Mermaid 只有源码节点名、无中文业务图

## 输入契约

| 字段 | 说明 |
|------|------|
| `targetRepo` | 目标 Agent 仓库路径 |
| `taskType` | `new_project` / `new_graph` / `new_service` / `refactor` / `write_readme` |
| `workflowName` | 图域名，如 `pre_translate` |
| `domainName` | 服务域名，如 `term_audit` |

## 使用示例

```text
使用 $项目结构-py-langGraph，为 terminology-agent 新增 graph/lexicon_curation/ 工作域，
含双轨 README 与 tests，遵循 pre_translate 金样。
```

```text
使用 $项目结构-py-langGraph，从 0 搭 FastAPI+LangGraph Agent，
参考 assets/few-shot-example/terminology-agent/。
```

## 延伸阅读

- 全项目分层：[[references/全项目分层与边界.md]]
- Mermaid 双轨：[[references/Mermaid双轨写作规范.md]]
- 金样项目：[[assets/few-shot-example/terminology-agent/project-tree.txt]]
