---
name: 搭建-测试共置与mock
description: Agent 测试共置目录与 LangGraph mock 约定。Use when pytest graph mock、patch builder 节点、conftest。
---

# 搭建-测试共置与mock

## 何时使用

- 任何 graph / services GREEN 阶段
- 编写 mock LLM 或 mock Repository 测试

## 共置规则

```
app/
├── services/<domain>/tests/
├── graph/<workflow>/tests/
├── api/tests/
└── conftest.py              # 全局 fixtures
```

## mock 约定

| 场景 | patch 路径 |
|------|------------|
| mock TermRepository | `graph.<workflow>.nodes.features.io.retrieve_similar.TermRepository` |
| mock LLM 节点 | `graph.<workflow>.builder.translate_suggest_node` |

**原因**：builder 在 import 时已绑定节点函数引用。

## conftest fixtures

- `pre_translate_service` — 注入 mock repo 的 PreTranslateService
- `mock_repo` — AsyncMock TermRepository

## 输出契约

- 测试路径与 skill 结构一致
- mock 路径文档化

## 参考

[[../../references/测试共置与mock约定.md]]
