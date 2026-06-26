# services 领域包规范

## 最小结构

```
services/<domain>/
├── __init__.py
├── service.py
└── tests/
```

## 预翻译类域（调 LangGraph）

```
services/pre_translate/
├── service.py      # run_batch 循环
├── single.py       # run_single_pre_translate → graph runner
├── mappers.py      # map_graph_state_to_agent_meta
└── tests/
```

## service.py 职责

- 接收已解析的业务参数（非 Request 对象）
- 循环、过滤、计数
- 委托 single 或 graph runner
- 返回 dict / Pydantic 可序列化结构

## 命名

- 对外类名：`PreTranslateService`（与 API/前端语义一致）
- 不用 `BatchOrchestrator` 等与 HTTP 无关的编排器名作为对外 API
