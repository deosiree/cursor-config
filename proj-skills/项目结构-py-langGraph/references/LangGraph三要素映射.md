# LangGraph 三要素映射

| LangGraph API | 本项目目录 | 文件示例 |
|---------------|------------|----------|
| State | `<workflow>/state.py` | `PreTranslateState` |
| Nodes | `<workflow>/nodes/` | `retrieve_similar_node` |
| Edges | `<workflow>/edges/` | `route_after_resolve_source` |
| Compile | `<workflow>/builder.py` | `build_pre_translate_graph()` |
| Invoke | `<workflow>/runner.py` | `PreTranslateGraph.run()` |

## nodes 内部分层

| 子目录 | 职责 |
|--------|------|
| `nodes/intentions/` | 写策略字段（如 `translation_source`） |
| `nodes/features/io/` | Repository I/O |
| `nodes/features/rules/` | 确定性纯函数 |
| `nodes/features/llm/` | LLM 调用 |
| `nodes/features/workflow/` | review_status 等流程字段 |

## 官方对照

LangGraph Application structure 推荐：`state.py` + nodes + `agent.py`（组装图）。

本项目将 `agent.py` 拆为：

- **builder.py** — 只负责 `add_node` / `add_edge` / `compile`
- **runner.py** — 只负责 initial state + `ainvoke`

便于测试 mock 与职责分离。
