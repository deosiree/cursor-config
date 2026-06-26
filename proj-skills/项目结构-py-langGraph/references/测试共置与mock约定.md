# 测试共置与 mock 约定

## pytest 路径

```powershell
pytest app/services/pre_translate/tests -v
pytest app/graph/pre_translate/tests -v
pytest app/api/tests -v
pytest -v
```

## mock LLM 节点

```python
with patch(
    "app.graph.pre_translate.builder.translate_suggest_node",
    fake_translate,
):
    ...
```

**不要** patch `nodes.features.llm.translate_suggest.translate_suggest_node`（builder 已绑定旧引用）。

## mock Repository

```python
monkeypatch.setattr(
    "app.graph.pre_translate.nodes.features.io.retrieve_similar.TermRepository",
    repo_factory,
)
```

## markers

- `@pytest.mark.graph` — 图/节点/边
- `@pytest.mark.service` — services 契约
- `@pytest.mark.api` — FastAPI 路由
