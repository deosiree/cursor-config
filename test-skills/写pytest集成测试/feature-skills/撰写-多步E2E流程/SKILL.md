---
name: 撰写-多步E2E流程
description: 撰写 API 级 E2E：多 HTTP 步骤、可选 Redis 旁路、@pytest.mark.slow。
---

# Feature：撰写多步 E2E 流程

## 定义

**API 级 E2E**（本 skill 范围）：多接口串联，可旁路不可读组件（如 Redis 植入验证码），**非**浏览器 UI。

## 典型：密码重置

来源：`nebula/seccenter/tests/test_10_password_reset.py`

策略要点：

- Redis 植入图形验证码答案
- 从 Redis 读取后端生成的重置码
- 完整 request → reset → login 新密码

## 结构

```python
class TestResetPasswordByCodeEndToEnd:
    """找回密码端到端测试"""

    @pytest.mark.slow
    def test_full_reset_flow(self, session, redis_client):
        """完整找回密码流程应成功"""
        ...
```

## Redis fixture

```python
@pytest.fixture
def redis_client():
  try:
    import redis
    ...
  except Exception:
    pytest.skip("Redis not available")
```

## 标记

- `@pytest.mark.slow` — 速率限制、锁账户、验证码冷却
- `@pytest.mark.integration` — 可选，CI 分层

## 禁止

- 用 mock 替代 Redis 旁路（除非用户明确仅测 happy path 前半段）
- 在 E2E 中跳过中间步骤断言

## 环境

见 [[../../references/env-prerequisites.md]] §Redis
