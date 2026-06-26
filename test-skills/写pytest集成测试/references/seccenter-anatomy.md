# seccenter 测试解剖规范

黄金样本：`F:\Documents\Repertory\Sieyuan\nebula\seccenter\tests`

## 三层注释结构

```
文件 docstring（模块地图 / 测试策略）
  └── class TestXxx（行为域）
        └── def test_yyy（单场景中文说明）
              └── 内联注释（业务规则、camelCase、清理）
```

## 文件头模式

### 简短型（CRUD 模块）

```python
"""租户 CRUD 测试"""
```

### 策略型（复杂域）

```python
"""API 权限校验测试

测试 VerifySession 接口的 API 权限校验功能。

测试策略：
- 测试用例自己创建菜单并绑定 API，不依赖数据库预置数据
- 测试完成后清理创建的数据
- 保证在任何环境下都能运行

测试场景：
1. 租户所有者访问租户关联项目的 API - 应成功
2. ...
"""
```

### 索引型（多 Test 类）

```python
"""
SecurityConfig 安全配置测试

测试覆盖:
- TestSecurityConfigCRUD: 安全配置查询和更新
- TestSecurityConfigValidation: 参数校验测试
"""
```

## 命名约定

| 层级 | 模式 | 示例 |
|------|------|------|
| 文件 | `test_{NN}_{module}.py` | `test_03_tenant.py` |
| 类 | `Test{Feature}{Aspect}` | `TestTenantCRUD`、`TestApiPermissionOwner` |
| 方法 | `test_{action}_{scenario}` | `test_create_tenant`、`test_unauthenticated_request_rejected` |
| 模块辅助 | `_snake_case` | `_create_parent_menu` |
| 测试数据 | `TEST_AUTO_` 前缀 | `generate_unique_name("TENANT_CREATE")` |

## 典型用例骨架

```python
class TestTenantCRUD:
    """租户 CRUD 测试"""

    def test_create_tenant(self, session):
        """测试创建租户"""
        data = { ... "name": generate_unique_name("TENANT_CREATE"), ... }
        resp = session.post(f"{BASE_URL}/seccenter/v2/tenant/create", json=data)
        assert_success(resp, msg="CreateTenant")
        result = unwrap_response(resp)
        tenant_id = safe_get_id(result)
        assert tenant_id, f"Missing tenant id: {result}"
        # 清理
        session.post(f"{BASE_URL}/seccenter/v2/tenant/delete", json={"id": tenant_id})
```

## 分段注释

大文件用水平线分区：

```python
# ============================================================================
# Fixtures: 创建带 API 的测试菜单
# ============================================================================
```

## 字段读取

始终兼容 camelCase / snake_case：

```python
session_id = result.get("session_id") or result.get("sessionId")
tenant.get("owner_id") or tenant.get("ownerId")
```

## Few-shot 索引

- 最小 CRUD：[[../assets/few-shot-example/租户CRUD最小样本/SKILL.md]]
- 策略文件头：[[../assets/few-shot-example/API权限策略文档头/SKILL.md]]
