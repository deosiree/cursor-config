---
name: 撰写-conftest与fixtures
description: 撰写 conftest.py：session 登录、实体 lifecycle fixtures、safe_cleanup、pytest hooks。
---

# Feature：撰写 conftest 与 fixtures

## 职责

`conftest.py` 提供全局 fixtures；**黄金样本**：`nebula/seccenter/tests/conftest.py`

## Session 级（必选）

| Fixture | 作用 |
|---------|------|
| `session` | 登录管理员，`yield` 后 logout |
| `unauthenticated_session` | 未登录场景 |

登录须处理：`maybe_encrypt_password`、验证码 `0000`（测试模式）、`unwrap_response` 取 `sessionId`。

## Function 级（按需）

| Fixture | 模式 |
|---------|------|
| `test_tenant` | create → yield → `safe_cleanup` delete |
| `test_menu` / `test_role` / `test_user` | 同上，注意依赖链 |

```python
@pytest.fixture
def test_tenant(session):
    """创建测试租户，测试完成后删除"""
    ...
    yield tenant
    safe_cleanup(session, f"{BASE_URL}/.../delete", {"id": tenant_id}, "tenant")
```

## safe_cleanup

失败只 `print(Warning)`，不使 teardown 抛错导致后续清理跳过。

## Hooks（可选）

- `pytest_collection_modifyitems` — 按文件名排序
- `pytest_configure` — 注册 `slow`、`integration` markers

## 禁止

- 在 fixture 里 `unittest.mock` HTTP
- 硬编码生产 tenant id

## 模板

[[../../template/新模块骨架/after/SKILL.md]] §conftest
