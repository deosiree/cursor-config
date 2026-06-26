---
name: 新模块骨架-after
description: 最小可跑 HTTP 集成测试目录（GREEN 目标态）。
---

# Template After：新模块骨架

## 目标目录

```
tests/
├── __init__.py
├── conftest.py          # session + safe_cleanup
├── config.py            # BASE_URL, LOGIN_CREDENTIALS, TEST_PREFIX
├── utils.py             # assert_success, unwrap_response, generate_unique_name
├── pytest.ini
├── requirements.txt     # pytest>=7, requests>=2.28
├── README.md
└── test_01_{module}.py  # 至少一个 Test* 类 + 一条 CRUD 环
```

## config.py 最小集

```python
"""测试配置"""
import os

BASE_URL = os.environ.get("SECCENTER_TEST_BASE_URL", "http://127.0.0.1:8000")
LOGIN_CREDENTIALS = {
    "identifier": os.environ.get("SECCENTER_TEST_ADMIN_EMAIL", "admin@system.local"),
    "password": os.environ.get("SECCENTER_TEST_ADMIN_PASSWORD", "123456"),
    "login_type": 1,
}
TEST_PREFIX = "TEST_AUTO_"
```

## conftest.py 最小集

- `@pytest.fixture(scope="session") def session()` — 登录 + yield + logout
- `safe_cleanup(session, url, data, entity_name)` — teardown 不抛错

## utils.py 最小集

- `assert_success(resp, msg=)`
- `unwrap_response(resp)`
- `generate_unique_name(suffix)` → `TEST_AUTO_{suffix}_{uuid8}`
- `maybe_encrypt_password(password, base_url, session)`

## test_01 最小用例

见 [[../../assets/few-shot-example/租户CRUD最小样本/SKILL.md]]

## 验收

```bash
cd tests && pytest test_01_*.py -v
```

一条用例绿即可视为骨架完成；后续走 `策略-补场景用例`。
