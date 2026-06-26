---
name: 租户CRUD最小样本
description: seccenter test_03_tenant.py 最小 CRUD 环 few-shot — create → assert_success → unwrap → 清理。
---

# Few-shot：租户 CRUD 最小样本

**来源**：`F:\Documents\Repertory\Sieyuan\nebula\seccenter\tests\test_03_tenant.py`

## 文件头

```python
"""租户 CRUD 测试"""
```

## 类与方法

```python
class TestTenantCRUD:
    """租户 CRUD 测试"""

    def test_create_tenant(self, session):
        """测试创建租户"""
        encrypted_password = maybe_encrypt_password("Test@123456", BASE_URL, session)
        data = {
            "name": generate_unique_name("TENANT_CREATE"),
            "owner_username": generate_unique_name("owner_create").lower(),
            "owner_email": generate_unique_email("owner_create"),
            "owner_password": encrypted_password
        }
        resp = session.post(f"{BASE_URL}/seccenter/v2/tenant/create", json=data)
        assert_success(resp, msg="CreateTenant")

        result = unwrap_response(resp)
        tenant_id = safe_get_id(result)
        assert tenant_id, f"Missing tenant id: {result}"

        # 清理
        session.post(f"{BASE_URL}/seccenter/v2/tenant/delete", json={"id": tenant_id})
```

## 要点

1. `session` fixture 来自 `conftest.py`（已登录管理员）
2. `generate_unique_name` 带 `TEST_AUTO_` 语义前缀
3. `maybe_encrypt_password` 处理 RSA 传输
4. `assert_success` + `unwrap_response` + `safe_get_id` 标准链
5. 用例末尾 **显式 delete**，不依赖 fixture teardown（内联创建场景）

## 模块级 helper 样本

```python
def login_as_tenant_owner(email: str, password: str) -> requests.Session:
    """以租户所有者身份登录，返回新 session（自动处理密码加密）"""
    s = requests.Session()
    encrypted_password = maybe_encrypt_password(password, BASE_URL, s)
    resp = s.post(f"{BASE_URL}/seccenter/v2/auth/login", json={
        "identifier": email,
        "password": encrypted_password,
        "login_type": 1  # EMAIL
    })
    if resp.status_code != 200 or not is_success(resp):
        raise Exception(f"Login as tenant owner failed: {resp.text}")
    return s
```

## 适用场景

新建 `Test*CRUD` 类、单接口 create/delete 环、需要第二 session 的权限场景前置。
