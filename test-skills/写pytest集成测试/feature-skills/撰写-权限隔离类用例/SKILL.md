---
name: 撰写-权限隔离类用例
description: 撰写权限校验与跨租户隔离：多 session、403、VerifySession、策略型文件头。
---

# Feature：撰写权限隔离类用例

## 适用

- API 权限 / VerifySession
- 跨租户读写拒绝
- `is_system_only` 菜单
- 无权限普通用户 vs 租户 owner

## 文件头

必须用 **策略型** 文件头，列出场景编号：[[../../assets/few-shot-example/API权限策略文档头/SKILL.md]]

## 多 Session 模式

```python
owner_session = login_as_tenant_owner(email, password)
# 或 fixture: no_permission_user_session
resp = owner_session.post(f"{BASE_URL}/.../verify", json={...})
assert_success(resp, msg="VerifySession")
```

## 断言

| 预期 | 用法 |
|------|------|
| 成功 | `assert_success` |
| 无权限 | `assert_error` 或 status/business code 403 |
| 反枚举 | 错误信息不泄露存在性 |

## 数据自建

- 不依赖 DB 预置菜单/API 绑定（除非系统租户只读查询）
- 用例内 create menu → bind api → assign role → verify → cleanup

## 类命名

- `TestApiPermissionOwner`
- `TestRoleTenantIsolation`
- `TestUserTenantIsolation`

## 参考源文件

`nebula/seccenter/tests/test_08_api_permission.py`、`test_09_tenant_isolation.py`
