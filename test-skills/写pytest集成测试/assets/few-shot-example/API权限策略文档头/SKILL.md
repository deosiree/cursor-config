---
name: API权限策略文档头
description: seccenter test_08_api_permission.py 策略型文件头 + Fixtures 分段 few-shot。
---

# Few-shot：API 权限策略文档头

**来源**：`F:\Documents\Repertory\Sieyuan\nebula\seccenter\tests\test_08_api_permission.py`

## 策略型文件头（完整）

```python
"""API 权限校验测试

测试 VerifySession 接口的 API 权限校验功能。

测试策略：
- 测试用例自己创建菜单并绑定 API，不依赖数据库预置数据
- 测试完成后清理创建的数据
- 保证在任何环境下都能运行

测试场景：
1. 租户所有者访问租户关联项目的 API - 应成功
2. 普通用户访问角色授权菜单的 API - 应成功
3. 普通用户访问未授权的 API - 应返回 403
4. is_system_only 菜单的 API - 普通租户用户应返回 403
"""
```

## camelCase 兼容 helper

```python
def _get_has_all_devices(result: dict):
    """从 verify 响应提取 has_all_devices（兼容 camelCase/snake_case）"""
    if "has_all_devices" in result:
        return result["has_all_devices"]
    return result.get("hasAllDevices")
```

## Fixtures 分段

```python
# ============================================================================
# Fixtures: 创建带 API 的测试菜单
# ============================================================================

def _create_parent_menu(session, suffix=""):
    """创建 directory→page 菜单链，返回 (page_id, dir_id)
    ...
    """
```

## 类命名样本

- `TestApiPermissionOwner` — 租户所有者应成功
- `TestApiPermissionRole` — 角色授权
- `TestVerifySessionHasAllDevices` — 设备范围

## 要点

1. 文件头写清 **不依赖预置数据** 与 **自清理** 策略
2. 用编号列出测试场景，便于 README / 评审对照
3. 复杂文件用 `# ====` 分段：Fixtures → Test 类
4. 权限类用例常需 **第二个 session**（普通用户 / 另一租户）

## 适用场景

权限校验、租户隔离、VerifySession、需自建菜单/API 绑定的模块。
